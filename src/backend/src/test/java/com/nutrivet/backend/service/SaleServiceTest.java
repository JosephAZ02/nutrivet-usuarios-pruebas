package com.nutrivet.backend.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.ArrayList;
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

import com.nutrivet.backend.domain.InventoryMovement;
import com.nutrivet.backend.domain.Invoice;
import com.nutrivet.backend.domain.InvoiceDetail;
import com.nutrivet.backend.domain.Product;
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

    @InjectMocks
    private SaleService saleService;

    // "Base de datos" falsa: lo que la venta va guardando
    private Invoice savedInvoice;
    private List<InvoiceDetail> savedDetails;

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
    void metodoDePagoInvalido_rechazaLaVenta() {
        addProduct(1, "Producto A", 1000, 10);
        SaleRequest request = new SaleRequest("CHEQUE", 5000.0, List.of(new SaleItemRequest(1, 1)));

        assertSaleFails(request, "Método de pago inválido: use EFECTIVO o TARJETA");
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