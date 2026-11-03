package com.nutrivet.backend.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;

import com.nutrivet.backend.domain.Client;
import com.nutrivet.backend.domain.ClientInstallment;
import com.nutrivet.backend.domain.InventoryMovement;
import com.nutrivet.backend.domain.Invoice;
import com.nutrivet.backend.domain.InvoiceDetail;
import com.nutrivet.backend.domain.Product;
import com.nutrivet.backend.domain.ReceivableAccount;
import com.nutrivet.backend.dto.InvoiceResponse;
import com.nutrivet.backend.dto.SaleItemRequest;
import com.nutrivet.backend.dto.SaleRequest;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class SaleServiceTest {

    // Los servicios de los que depende SaleService se reemplazan por versiones falsas
    @Mock
    private InvoiceService invoiceService;

    @Mock
    private InvoiceDetailService invoiceDetailService;

    @Mock
    private InventoryMovementService inventoryMovementService;

    @Mock
    private ProductService productService;

    @Mock
    private ClientService clientService;

    @Mock
    private ReceivableAccountService receivableAccountService;

    @Mock
    private ClientInstallmentService clientInstallmentService;

    @InjectMocks
    private SaleService saleService;

    // "Base de datos" falsa: lo que la venta va guardando
    private Invoice savedInvoice;
    private List<InvoiceDetail> savedDetails;
    private ReceivableAccount savedAccount;
    private List<ClientInstallment> savedInstallments;

    @BeforeEach
    void setUp() {
        savedInvoice = null;
        savedDetails = new ArrayList<>();

        // Al guardar la factura se le asigna el id 7, como haría MySQL
        when(invoiceService.add(any(Invoice.class))).thenAnswer(call -> {
            Invoice invoice = call.getArgument(0);
            invoice.setId(7);
            savedInvoice = invoice;
            return invoice;
        });
        when(invoiceService.getById(7)).thenAnswer(call -> Optional.ofNullable(savedInvoice));

        when(invoiceDetailService.add(any(InvoiceDetail.class))).thenAnswer(call -> {
            InvoiceDetail detail = call.getArgument(0);
            savedDetails.add(detail);
            return detail;
        });
        when(invoiceDetailService.getByInvoiceId(7)).thenAnswer(call -> savedDetails);

        savedAccount = null;
        savedInstallments = new ArrayList<>();

        // Al guardar la cuenta por cobrar se le asigna el id 5
        when(receivableAccountService.add(any(ReceivableAccount.class))).thenAnswer(call -> {
            ReceivableAccount account = call.getArgument(0);
            account.setId(5);
            savedAccount = account;
            return account;
        });
        when(receivableAccountService.getByInvoiceId(7)).thenAnswer(call -> Optional.ofNullable(savedAccount));

        when(clientInstallmentService.add(any(ClientInstallment.class))).thenAnswer(call -> {
            ClientInstallment installment = call.getArgument(0);
            savedInstallments.add(installment);
            return installment;
        });
    }

    // ---------- métodos auxiliares de las pruebas ----------

    private Product addProduct(int id, String name, double price, int stock) {
        Product product = new Product();
        product.setId(id);
        product.setCode("COD" + id);
        product.setName(name);
        product.setUnitPrice(price);
        product.setProductAmount(stock);
        when(productService.getByIdWithLock(id)).thenReturn(Optional.of(product));
        when(productService.getByIdWithAnyState(id)).thenReturn(Optional.of(product));
        return product;
    }

    private SaleRequest cashSale(Double amountReceived, SaleItemRequest... items) {
        return new SaleRequest("EFECTIVO", amountReceived, List.of(items));
    }

    private SaleRequest cardSale(SaleItemRequest... items) {
        return new SaleRequest("TARJETA", null, List.of(items));
    }

    private void addClient(String id, String name) {
        Client client = new Client();
        client.setId(id);
        client.setName(name);
        when(clientService.getById(id)).thenReturn(Optional.of(client));
    }

    private SaleRequest creditSale(String clientId, Double initialPayment, Double monthlyInstallment,
            LocalDate dueDate, SaleItemRequest... items) {
        return new SaleRequest("CREDITO", null, List.of(items), clientId, initialPayment, monthlyInstallment, dueDate);
    }

    // Comprueba que la venta falle con exactamente ese mensaje
    private void assertSaleFails(SaleRequest request, String expectedMessage) {
        RuntimeException error = assertThrows(RuntimeException.class, () -> saleService.createSale(request));
        assertEquals(expectedMessage, error.getMessage());
    }

    // ---------- total y vuelto con distintos montos ----------

    @Test
    void efectivo_calculaSubtotalTotalYVuelto() {
        addProduct(1, "Concentrado Perro 20kg", 1000, 10);

        InvoiceResponse invoice = saleService.createSale(cashSale(5000.0, new SaleItemRequest(1, 3)));

        assertEquals("F-000007", invoice.number());
        assertNotNull(invoice.date());
        assertEquals(3000.0, invoice.subtotal(), 0.001);
        assertEquals(0.0, invoice.tax(), 0.001);
        assertEquals(3000.0, invoice.total(), 0.001);
        assertEquals(5000.0, invoice.amountReceived(), 0.001);
        assertEquals(2000.0, invoice.change(), 0.001);
        assertEquals("EFECTIVO", invoice.paymentMethod());
        assertEquals(1, invoice.items().size());
    }

    @Test
    void variosProductosConDecimales_sumaBienElTotal() {
        addProduct(1, "Producto A", 1500.50, 10);
        addProduct(2, "Producto B", 250.25, 10);

        InvoiceResponse invoice = saleService.createSale(
                cashSale(4000.0, new SaleItemRequest(1, 2), new SaleItemRequest(2, 3)));

        // 1500.50 x 2 = 3001.00  y  250.25 x 3 = 750.75
        assertEquals(3751.75, invoice.total(), 0.001);
        assertEquals(248.25, invoice.change(), 0.001);
        assertEquals(2, invoice.items().size());
    }

    @Test
    void efectivo_montoExacto_vueltoCero() {
        addProduct(1, "Producto A", 1000, 10);

        InvoiceResponse invoice = saleService.createSale(cashSale(2000.0, new SaleItemRequest(1, 2)));

        assertEquals(0.0, invoice.change(), 0.001);
    }

    @Test
    void efectivo_montoMenorAlTotal_rechazaLaVenta() {
        addProduct(1, "Producto A", 1000, 10);

        assertSaleFails(cashSale(1999.0, new SaleItemRequest(1, 2)), "El monto recibido es menor al total a pagar");
    }

    @Test
    void efectivo_sinMontoRecibido_rechazaLaVenta() {
        addProduct(1, "Producto A", 1000, 10);

        assertSaleFails(cashSale(null, new SaleItemRequest(1, 1)), "Debe indicar el monto recibido en efectivo");
    }

    @Test
    void tarjeta_noNecesitaMontoYElVueltoEsCero() {
        addProduct(1, "Producto A", 1000, 10);

        InvoiceResponse invoice = saleService.createSale(cardSale(new SaleItemRequest(1, 2)));

        assertEquals("TARJETA", invoice.paymentMethod());
        assertEquals(2000.0, invoice.total(), 0.001);
        assertEquals(0.0, invoice.change(), 0.001);
    }

    @Test
    void sinpe_noNecesitaMontoYElVueltoEsCero() {
        addProduct(1, "Producto A", 1000, 10);
        SaleRequest request = new SaleRequest("SINPE", null, List.of(new SaleItemRequest(1, 2)));

        InvoiceResponse invoice = saleService.createSale(request);

        assertEquals("SINPE", invoice.paymentMethod());
        assertEquals(2000.0, invoice.total(), 0.001);
        assertEquals(0.0, invoice.change(), 0.001);
        assertEquals(2000.0, invoice.amountReceived(), 0.001);
    }

    @Test
    void sinpe_rebajaElInventarioComoCualquierVenta() {
        addProduct(1, "Producto A", 1000, 10);
        SaleRequest request = new SaleRequest("SINPE", null, List.of(new SaleItemRequest(1, 3)));

        saleService.createSale(request);

        verify(inventoryMovementService, times(1)).add(any(InventoryMovement.class));
    }

    @Test
    void metodoDePagoInvalido_rechazaLaVenta() {
        addProduct(1, "Producto A", 1000, 10);
        SaleRequest request = new SaleRequest("CHEQUE", 5000.0, List.of(new SaleItemRequest(1, 1)));

        assertSaleFails(request, "Método de pago inválido: use EFECTIVO, TARJETA, SINPE o CREDITO");
    }

    // ---------- inventario ----------

    @Test
    void registraUnaSalidaDeInventarioPorCadaProducto() {
        Product product = addProduct(1, "Producto A", 1000, 10);

        saleService.createSale(cashSale(3000.0, new SaleItemRequest(1, 3)));

        ArgumentCaptor<InventoryMovement> captor = ArgumentCaptor.forClass(InventoryMovement.class);
        verify(inventoryMovementService).add(captor.capture());
        InventoryMovement movement = captor.getValue();

        assertEquals("SALIDA", movement.getType());
        assertEquals(3, movement.getAmount());
        assertEquals("Venta", movement.getReason());
        assertEquals(product, movement.getProduct());
        assertEquals(Integer.valueOf(7), movement.getIdInvoice());
    }

    @Test
    void variosProductos_registraUnaSalidaPorProducto() {
        addProduct(1, "Producto A", 1000, 10);
        addProduct(2, "Producto B", 500, 10);

        saleService.createSale(cashSale(9999.0, new SaleItemRequest(1, 1), new SaleItemRequest(2, 2)));

        verify(inventoryMovementService, times(2)).add(any(InventoryMovement.class));
        assertEquals(2, savedDetails.size());
    }

    @Test
    void productoSinExistencias_rechazaLaVentaYNoRegistraSalida() {
        addProduct(1, "Ivermectina 50ml", 6200, 0);

        assertSaleFails(cashSale(9999.0, new SaleItemRequest(1, 1)),
                "Existencias insuficientes de \"Ivermectina 50ml\": disponibles 0, solicitadas 1");

        verify(inventoryMovementService, never()).add(any(InventoryMovement.class));
    }

    @Test
    void cantidadMayorQueLasExistencias_rechazaLaVenta() {
        addProduct(1, "Producto A", 1000, 2);

        assertSaleFails(cashSale(9999.0, new SaleItemRequest(1, 3)),
                "Existencias insuficientes de \"Producto A\": disponibles 2, solicitadas 3");
    }

    @Test
    void cantidadIgualALasExistencias_permiteLaVenta() {
        addProduct(1, "Producto A", 1000, 3);

        InvoiceResponse invoice = saleService.createSale(cashSale(3000.0, new SaleItemRequest(1, 3)));

        assertEquals(3000.0, invoice.total(), 0.001);
    }

    @Test
    void unProductoSinStockEnLaVenta_cancelaLaVentaCompleta() {
        addProduct(1, "Producto A", 1000, 10);
        addProduct(2, "Producto B", 500, 0);

        assertSaleFails(cashSale(9999.0, new SaleItemRequest(1, 1), new SaleItemRequest(2, 1)),
                "Existencias insuficientes de \"Producto B\": disponibles 0, solicitadas 1");
    }

    @Test
    void productoDesactivado_rechazaLaVenta() {
        Product product = addProduct(1, "Producto A", 1000, 10);
        product.setActive(false);

        assertSaleFails(cashSale(9999.0, new SaleItemRequest(1, 1)), "El producto \"Producto A\" está desactivado");
    }

    @Test
    void productoInexistente_rechazaLaVenta() {
        when(productService.getByIdWithLock(99)).thenReturn(Optional.empty());

        assertSaleFails(cashSale(9999.0, new SaleItemRequest(99, 1)), "El producto con id 99 no existe");
    }

    // ---------- producto a granel ----------

    @Test
    void productoAGranel_seVendeEnUnidadesEnterasComoCualquierOtro() {
        // El saco ya dividido se registra como un producto más, marcado como granel
        Product bulk = addProduct(1, "Concentrado a granel (kg)", 1600, 40);
        bulk.setBulkSale(true);

        InvoiceResponse invoice = saleService.createSale(cashSale(7000.0, new SaleItemRequest(1, 4)));

        assertEquals(6400.0, invoice.total(), 0.001);
        assertEquals(600.0, invoice.change(), 0.001);
        verify(inventoryMovementService).add(any(InventoryMovement.class));
    }

    @Test
    void productoAGranel_sinExistencias_rechazaLaVenta() {
        Product bulk = addProduct(1, "Concentrado a granel (kg)", 1600, 2);
        bulk.setBulkSale(true);

        assertSaleFails(cashSale(9999.0, new SaleItemRequest(1, 5)),
                "Existencias insuficientes de \"Concentrado a granel (kg)\": disponibles 2, solicitadas 5");
    }

    // ---------- factura sin productos y datos inválidos ----------

    @Test
    void facturaSinProductos_rechazaLaVenta() {
        assertSaleFails(cashSale(1000.0), "La factura debe tener al menos un producto");
    }

    @Test
    void listaDeProductosNula_rechazaLaVenta() {
        assertSaleFails(new SaleRequest("EFECTIVO", 1000.0, null), "La factura debe tener al menos un producto");
    }

    @Test
    void ventaNula_rechazaLaVenta() {
        assertSaleFails(null, "La factura debe tener al menos un producto");
    }

    @Test
    void facturaSinProductos_noGuardaNada() {
        assertThrows(RuntimeException.class, () -> saleService.createSale(cashSale(1000.0)));

        verify(invoiceService, never()).add(any(Invoice.class));
        verify(inventoryMovementService, never()).add(any(InventoryMovement.class));
    }

    @Test
    void cantidadCero_rechazaLaVenta() {
        addProduct(1, "Producto A", 1000, 10);

        assertSaleFails(cashSale(9999.0, new SaleItemRequest(1, 0)), "La cantidad de cada producto debe ser mayor a cero");
    }

    @Test
    void cantidadNegativa_rechazaLaVenta() {
        addProduct(1, "Producto A", 1000, 10);

        assertSaleFails(cashSale(9999.0, new SaleItemRequest(1, -2)), "La cantidad de cada producto debe ser mayor a cero");
    }

    @Test
    void productoNuloEnLaLista_rechazaLaVentaYNoGuardaNada() {
        addProduct(1, "Producto A", 1000, 10);
        // List.of no acepta null, por eso se usa Arrays.asList
        List<SaleItemRequest> items = Arrays.asList(new SaleItemRequest(1, 1), null);

        assertSaleFails(new SaleRequest("EFECTIVO", 9999.0, items), "La factura contiene un producto inválido");

        verify(invoiceService, never()).add(any(Invoice.class));
        verify(inventoryMovementService, never()).add(any(InventoryMovement.class));
    }

    @Test
    void masDeVeinteProductos_rechazaLaVenta() {
        addProduct(1, "Producto A", 1000, 1000);
        List<SaleItemRequest> items = new ArrayList<>();
        for (int i = 0; i < 21; i++) {
            items.add(new SaleItemRequest(1, 1));
        }

        assertSaleFails(new SaleRequest("EFECTIVO", 999999.0, items), "La factura no puede tener más de 20 productos");

        verify(invoiceService, never()).add(any(Invoice.class));
    }

    @Test
    void exactamenteVeinteProductos_permiteLaVenta() {
        addProduct(1, "Producto A", 10, 1000);
        List<SaleItemRequest> items = new ArrayList<>();
        for (int i = 0; i < 20; i++) {
            items.add(new SaleItemRequest(1, 1));
        }

        InvoiceResponse invoice = saleService.createSale(new SaleRequest("TARJETA", null, items));

        assertEquals(200.0, invoice.total(), 0.001);
        assertEquals(20, invoice.items().size());
    }

    @Test
    void mismoProductoEnDosLineas_sumaLasCantidades() {
        addProduct(1, "Producto A", 1000, 10);

        InvoiceResponse invoice = saleService.createSale(cardSale(new SaleItemRequest(1, 2), new SaleItemRequest(1, 3)));

        assertEquals(5000.0, invoice.total(), 0.001);
        assertEquals(2, invoice.items().size());
        verify(inventoryMovementService, times(2)).add(any(InventoryMovement.class));
    }

    @Test
    void mismoProductoEnDosLineas_sumadasSuperanLasExistencias_rechazaLaVenta() {
        Product product = addProduct(1, "Producto A", 1000, 4);

        // el servicio real de inventario rebaja el stock; aquí se imita para que la 2.ª línea lo vea rebajado
        when(inventoryMovementService.add(any(InventoryMovement.class))).thenAnswer(call -> {
            InventoryMovement movement = call.getArgument(0);
            product.setProductAmount(product.getProductAmount() - (int) movement.getAmount());
            return movement;
        });

        assertSaleFails(cardSale(new SaleItemRequest(1, 2), new SaleItemRequest(1, 3)),
                "Existencias insuficientes de \"Producto A\": disponibles 2, solicitadas 3");
    }

    // ---------- venta a crédito ----------

    @Test
    void credito_conAbonoInicial_creaLaCuentaPorCobrarYElPrimerAbono() {
        addProduct(1, "Producto A", 1000, 10);
        addClient("123456789", "Cliente Prueba");
        LocalDate dueDate = LocalDate.now().plusMonths(3);

        InvoiceResponse invoice = saleService
                .createSale(creditSale("123456789", 2000.0, 1000.0, dueDate, new SaleItemRequest(1, 5)));

        assertEquals("CREDITO", invoice.paymentMethod());
        assertTrue(invoice.credit());
        assertEquals(5000.0, invoice.total(), 0.001);
        assertEquals(0.0, invoice.change(), 0.001);
        assertEquals(2000.0, invoice.amountReceived(), 0.001);
        assertEquals("123456789", invoice.clientId());
        assertEquals("Cliente Prueba", invoice.clientName());
        assertEquals(3000.0, invoice.balance(), 0.001);
        assertEquals(1000.0, invoice.monthlyInstallment(), 0.001);
        assertEquals(dueDate, invoice.dueDate());

        assertEquals(5000.0, savedAccount.getTotalAmount(), 0.001);
        assertEquals(2000.0, savedAccount.getInitialPayment(), 0.001);
        assertEquals(3000.0, savedAccount.getCurrentAmount(), 0.001);
        assertEquals(7, savedAccount.getIdInvoice());
        assertEquals("123456789", savedAccount.getIdClient());

        assertEquals(1, savedInstallments.size());
        assertEquals(2000.0, savedInstallments.get(0).getAmount(), 0.001);
        assertEquals(5, savedInstallments.get(0).getIdReceivableAccount());
        assertEquals("123456789", savedInstallments.get(0).getIdClient());
    }

    @Test
    void credito_sinAbonoInicial_noRegistraAbonoYElSaldoEsElTotal() {
        addProduct(1, "Producto A", 1000, 10);
        addClient("123456789", "Cliente Prueba");

        InvoiceResponse invoice = saleService.createSale(creditSale("123456789", null, 1000.0,
                LocalDate.now().plusMonths(3), new SaleItemRequest(1, 5)));

        assertEquals(5000.0, invoice.balance(), 0.001);
        assertEquals(0.0, invoice.amountReceived(), 0.001);
        assertEquals(0, savedInstallments.size());
    }

    @Test
    void credito_abonoInicialCero_noRegistraAbono() {
        addProduct(1, "Producto A", 1000, 10);
        addClient("123456789", "Cliente Prueba");

        saleService.createSale(creditSale("123456789", 0.0, 1000.0, LocalDate.now().plusMonths(3),
                new SaleItemRequest(1, 5)));

        assertEquals(0, savedInstallments.size());
        assertEquals(5000.0, savedAccount.getCurrentAmount(), 0.001);
    }

    @Test
    void credito_rebajaElInventarioComoCualquierVenta() {
        addProduct(1, "Producto A", 1000, 10);
        addClient("123456789", "Cliente Prueba");

        saleService.createSale(creditSale("123456789", null, 1000.0, LocalDate.now().plusMonths(3),
                new SaleItemRequest(1, 5)));

        verify(inventoryMovementService, times(1)).add(any(InventoryMovement.class));
    }

    @Test
    void credito_sinCliente_rechazaLaVenta() {
        addProduct(1, "Producto A", 1000, 10);

        assertSaleFails(creditSale(null, null, 1000.0, LocalDate.now().plusMonths(3), new SaleItemRequest(1, 5)),
                "Debe indicar el cliente de la venta a crédito");
        assertSaleFails(creditSale("   ", null, 1000.0, LocalDate.now().plusMonths(3), new SaleItemRequest(1, 5)),
                "Debe indicar el cliente de la venta a crédito");
    }

    @Test
    void credito_clienteInexistente_rechazaLaVenta() {
        addProduct(1, "Producto A", 1000, 10);

        assertSaleFails(creditSale("999999999", null, 1000.0, LocalDate.now().plusMonths(3),
                new SaleItemRequest(1, 5)), "El cliente no existe");
    }

    @Test
    void credito_abonoMensualCeroONulo_rechazaLaVenta() {
        addProduct(1, "Producto A", 1000, 10);
        addClient("123456789", "Cliente Prueba");

        assertSaleFails(creditSale("123456789", null, 0.0, LocalDate.now().plusMonths(3), new SaleItemRequest(1, 5)),
                "El abono mensual debe ser mayor a cero");
        assertSaleFails(creditSale("123456789", null, null, LocalDate.now().plusMonths(3), new SaleItemRequest(1, 5)),
                "El abono mensual debe ser mayor a cero");
    }

    @Test
    void credito_sinFechaLimite_rechazaLaVenta() {
        addProduct(1, "Producto A", 1000, 10);
        addClient("123456789", "Cliente Prueba");

        assertSaleFails(creditSale("123456789", null, 1000.0, null, new SaleItemRequest(1, 5)),
                "Debe indicar la fecha límite de pago");
    }

    @Test
    void credito_fechaLimiteHoyOPasada_rechazaLaVenta() {
        addProduct(1, "Producto A", 1000, 10);
        addClient("123456789", "Cliente Prueba");

        assertSaleFails(creditSale("123456789", null, 1000.0, LocalDate.now(), new SaleItemRequest(1, 5)),
                "La fecha límite debe ser posterior a hoy");
        assertSaleFails(creditSale("123456789", null, 1000.0, LocalDate.now().minusDays(1), new SaleItemRequest(1, 5)),
                "La fecha límite debe ser posterior a hoy");
    }

    @Test
    void credito_abonoInicialNegativo_rechazaLaVenta() {
        addProduct(1, "Producto A", 1000, 10);
        addClient("123456789", "Cliente Prueba");

        assertSaleFails(creditSale("123456789", -100.0, 1000.0, LocalDate.now().plusMonths(3),
                new SaleItemRequest(1, 5)), "El abono inicial no puede ser negativo");
    }

    @Test
    void credito_abonoInicialIgualAlTotal_rechazaLaVenta() {
        addProduct(1, "Producto A", 1000, 10);
        addClient("123456789", "Cliente Prueba");

        assertSaleFails(creditSale("123456789", 5000.0, 1000.0, LocalDate.now().plusMonths(3),
                new SaleItemRequest(1, 5)),
                "El abono inicial debe ser menor al total; si el cliente paga todo, use otro método de pago");
    }

    @Test
    void credito_abonoMensualMayorAlSaldo_rechazaLaVentaYNoCreaLaCuenta() {
        addProduct(1, "Producto A", 1000, 10);
        addClient("123456789", "Cliente Prueba");

        // total 5000 - abono inicial 2000 = saldo 3000
        assertSaleFails(creditSale("123456789", 2000.0, 3500.0, LocalDate.now().plusMonths(3),
                new SaleItemRequest(1, 5)), "El abono mensual no puede ser mayor al saldo pendiente");

        verify(receivableAccountService, never()).add(any(ReceivableAccount.class));
        verify(clientInstallmentService, never()).add(any(ClientInstallment.class));
    }

    @Test
    void credito_abonoMensualIgualAlSaldo_permiteLaVenta() {
        addProduct(1, "Producto A", 1000, 10);
        addClient("123456789", "Cliente Prueba");

        InvoiceResponse invoice = saleService.createSale(creditSale("123456789", 2000.0, 3000.0,
                LocalDate.now().plusMonths(3), new SaleItemRequest(1, 5)));

        assertEquals(3000.0, invoice.monthlyInstallment(), 0.001);
        assertEquals(3000.0, invoice.balance(), 0.001);
    }

    @Test
    void credito_datosInvalidos_noGuardaNada() {
        addProduct(1, "Producto A", 1000, 10);

        assertThrows(RuntimeException.class, () -> saleService.createSale(creditSale("999999999", null, 1000.0,
                LocalDate.now().plusMonths(3), new SaleItemRequest(1, 5))));

        verify(invoiceService, never()).add(any(Invoice.class));
        verify(inventoryMovementService, never()).add(any(InventoryMovement.class));
        verify(receivableAccountService, never()).add(any(ReceivableAccount.class));
    }

    @Test
    void credito_productoSinExistencias_noCreaLaCuenta() {
        addProduct(1, "Producto A", 1000, 1);
        addClient("123456789", "Cliente Prueba");

        assertThrows(RuntimeException.class, () -> saleService.createSale(creditSale("123456789", null, 1000.0,
                LocalDate.now().plusMonths(3), new SaleItemRequest(1, 5))));

        verify(receivableAccountService, never()).add(any(ReceivableAccount.class));
    }

    @Test
    void credito_ventaDeContado_noCreaCuentaPorCobrar() {
        addProduct(1, "Producto A", 1000, 10);

        InvoiceResponse invoice = saleService.createSale(cashSale(5000.0, new SaleItemRequest(1, 2)));

        verify(receivableAccountService, never()).add(any(ReceivableAccount.class));
        assertFalse(invoice.credit());
        assertNull(invoice.clientId());
        assertEquals(0.0, invoice.balance(), 0.001);
        assertNull(invoice.dueDate());
    }

    @Test
    void credito_ignoraLosDatosDeCreditoEnVentasQueNoSonACredito() {
        addProduct(1, "Producto A", 1000, 10);
        SaleRequest request = new SaleRequest("TARJETA", null, List.of(new SaleItemRequest(1, 2)), "999999999",
                500.0, 100.0, LocalDate.now().plusMonths(1));

        InvoiceResponse invoice = saleService.createSale(request);

        assertFalse(invoice.credit());
        verify(receivableAccountService, never()).add(any(ReceivableAccount.class));
    }

    // ---------- consultar una factura guardada ----------

    @Test
    void getInvoice_devuelveLaFacturaConSusLineas() {
        addProduct(1, "Producto A", 1000, 10);
        saleService.createSale(cashSale(5000.0, new SaleItemRequest(1, 3)));

        InvoiceResponse invoice = saleService.getInvoice(7);

        assertEquals("F-000007", invoice.number());
        assertEquals(3000.0, invoice.total(), 0.001);
        assertEquals(5000.0, invoice.amountReceived(), 0.001);
        assertEquals(2000.0, invoice.change(), 0.001);
        assertEquals(1, invoice.items().size());
        assertEquals("Producto A", invoice.items().get(0).productName());
        assertEquals(3, invoice.items().get(0).quantity());
        assertEquals(1000.0, invoice.items().get(0).unitPrice(), 0.001);
        assertEquals(3000.0, invoice.items().get(0).total(), 0.001);
    }

    @Test
    void getInvoice_productoDesactivadoDespuesDeLaVenta_muestraSuNombre() {
        Product product = addProduct(1, "Producto A", 1000, 10);
        saleService.createSale(cashSale(1000.0, new SaleItemRequest(1, 1)));
        product.setActive(false);

        InvoiceResponse invoice = saleService.getInvoice(7);

        assertEquals("Producto A", invoice.items().get(0).productName());
    }

    @Test
    void getInvoice_productoBorradoDeLaBase_muestraProductoEliminado() {
        addProduct(1, "Producto A", 1000, 10);
        saleService.createSale(cashSale(1000.0, new SaleItemRequest(1, 1)));
        when(productService.getByIdWithAnyState(1)).thenReturn(Optional.empty());

        InvoiceResponse invoice = saleService.getInvoice(7);

        assertEquals("Producto eliminado", invoice.items().get(0).productName());
    }

    @Test
    void getInvoice_facturaInexistente_lanzaError() {
        RuntimeException error = assertThrows(RuntimeException.class, () -> saleService.getInvoice(99));

        assertEquals("La factura no existe", error.getMessage());
    }
}