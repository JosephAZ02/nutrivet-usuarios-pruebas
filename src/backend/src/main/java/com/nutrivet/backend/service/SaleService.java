package com.nutrivet.backend.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.nutrivet.backend.domain.Client;
import com.nutrivet.backend.domain.ClientInstallment;
import com.nutrivet.backend.domain.InventoryMovement;
import com.nutrivet.backend.domain.Invoice;
import com.nutrivet.backend.domain.InvoiceDetail;
import com.nutrivet.backend.domain.Product;
import com.nutrivet.backend.domain.ReceivableAccount;
import com.nutrivet.backend.dto.InvoiceLineResponse;
import com.nutrivet.backend.dto.InvoiceResponse;
import com.nutrivet.backend.dto.SaleItemRequest;
import com.nutrivet.backend.dto.SaleRequest;

@Service
public class SaleService {

    private static final String CASH = "EFECTIVO";
    private static final String CARD = "TARJETA";
    private static final String SINPE = "SINPE";
    private static final String CREDIT = "CREDITO";
    private static final int MAX_LINES = 20; // máximo de líneas por factura

    private final InvoiceService invoiceService;
    private final InvoiceDetailService invoiceDetailService;
    private final InventoryMovementService inventoryMovementService;
    private final ProductService productService;
    private final ClientService clientService;
    private final ReceivableAccountService receivableAccountService;
    private final ClientInstallmentService clientInstallmentService;

    public SaleService(InvoiceService invoiceService, InvoiceDetailService invoiceDetailService,
            InventoryMovementService inventoryMovementService, ProductService productService,
            ClientService clientService, ReceivableAccountService receivableAccountService,
            ClientInstallmentService clientInstallmentService) {
        this.invoiceService = invoiceService;
        this.invoiceDetailService = invoiceDetailService;
        this.inventoryMovementService = inventoryMovementService;
        this.productService = productService;
        this.clientService = clientService;
        this.receivableAccountService = receivableAccountService;
        this.clientInstallmentService = clientInstallmentService;
    }

    // Si algo falla, spring deshace todo con transactional
    @Transactional
    public InvoiceResponse createSale(SaleRequest request) {
        validateSale(request);

        // La factura se guarda primero para tener su id y los totales se completan al final
        Invoice invoice = new Invoice();
        invoice.setDate(LocalDateTime.now());
        invoice.setPaymentMethod(request.paymentMethod());
        invoice.setCredit(CREDIT.equals(request.paymentMethod()));
        invoice = invoiceService.add(invoice);

        double subtotal = 0;
        for (SaleItemRequest item : request.items()) {
            subtotal = subtotal + sellItem(invoice, item);
        }

        invoice.setNumber(String.format("F-%06d", invoice.getId())); // ejemplo: F-000007
        invoice.setSubtotal(subtotal);
        invoice.setTotal(subtotal); // sin IVA por ahora (no sé como el muchacho calcula el iva de esos productos)
        invoice.setChange(calculateChange(request, subtotal));
        invoiceService.add(invoice);

        // Si la venta es a crédito se crea la cuenta por cobrar (y el abono inicial, si hubo)
        if (invoice.isCredit()) {
            saveCredit(invoice, request, subtotal);
        }

        return getInvoice(invoice.getId());
    }

    // Devuelve una factura guardada con sus líneas para mostrarla, imprimirla o descargarla
    public InvoiceResponse getInvoice(int id) {
        Invoice invoice = invoiceService.getById(id)
                .orElseThrow(() -> new RuntimeException("La factura no existe"));

        List<InvoiceLineResponse> invoiceLines = new ArrayList<>();
        for (InvoiceDetail detail : invoiceDetailService.getByInvoiceId(id)) {
            Product product = productService.getByIdWithAnyState(detail.getIdProduct()).orElse(null);
            String code = "";
            String name = "Producto eliminado";
            if (product != null) {
                code = product.getCode();
                name = product.getName();
            }
            invoiceLines.add(new InvoiceLineResponse(detail.getIdProduct(), code, name,
                    (int) detail.getAmount(), detail.getUnitPrice(), detail.getTotal()));
        }

        double tax = round(invoice.getTotal() - invoice.getSubtotal());
        double amountReceived = round(invoice.getTotal() + invoice.getChange());

        // datos del crédito: solo tienen valor si la factura fue a crédito
        String clientId = null;
        String clientName = null;
        double balance = 0;
        double monthlyInstallment = 0;
        LocalDate dueDate = null;

        if (invoice.isCredit()) {
            ReceivableAccount account = receivableAccountService.getByInvoiceId(id).orElse(null);
            if (account != null) {
                amountReceived = account.getInitialPayment(); // en crédito, lo recibido es el abono inicial
                clientId = account.getIdClient();
                Client client = clientService.getById(clientId).orElse(null);
                clientName = client != null ? client.getName() : "Cliente eliminado";
                balance = account.getCurrentAmount();
                monthlyInstallment = account.getMonthlyInstallment();
                dueDate = account.getDueDate();
            }
        }

        return new InvoiceResponse(invoice.getId(), invoice.getNumber(), invoice.getDate(),
                invoice.getSubtotal(), tax, invoice.getTotal(), invoice.getPaymentMethod(),
                amountReceived, invoice.getChange(), invoice.isCredit(), invoiceLines,
                clientId, clientName, balance, monthlyInstallment, dueDate);
    }

    private void validateSale(SaleRequest request) {
        if (request == null || request.items() == null || request.items().isEmpty()) {
            throw new RuntimeException("La factura debe tener al menos un producto");
        }

        if (request.items().size() > MAX_LINES) {
            throw new RuntimeException("La factura no puede tener más de " + MAX_LINES + " productos");
        }

        // se revisan todas las líneas antes de guardar nada
        for (SaleItemRequest item : request.items()) {
            if (item == null) {
                throw new RuntimeException("La factura contiene un producto inválido");
            }
        }

        String method = request.paymentMethod();

        if (!CASH.equals(method) && !CARD.equals(method) && !SINPE.equals(method) && !CREDIT.equals(method)) {
            throw new RuntimeException("Método de pago inválido: use EFECTIVO, TARJETA, SINPE o CREDITO");
        }

        if (CREDIT.equals(method)) {
            validateCredit(request);
        }
    }

    // Validaciones de los datos del crédito que no dependen del total de la venta
    private void validateCredit(SaleRequest request) {
        if (request.clientId() == null || request.clientId().trim().isEmpty()) {
            throw new RuntimeException("Debe indicar el cliente de la venta a crédito");
        }

        if (clientService.getById(request.clientId().trim()).isEmpty()) {
            throw new RuntimeException("El cliente no existe");
        }

        if (request.monthlyInstallment() == null || request.monthlyInstallment() <= 0) {
            throw new RuntimeException("El abono mensual debe ser mayor a cero");
        }

        if (request.dueDate() == null) {
            throw new RuntimeException("Debe indicar la fecha límite de pago");
        }

        if (!request.dueDate().isAfter(LocalDate.now())) {
            throw new RuntimeException("La fecha límite debe ser posterior a hoy");
        }

        if (request.initialPayment() != null && request.initialPayment() < 0) {
            throw new RuntimeException("El abono inicial no puede ser negativo");
        }
    }

    // Crea la cuenta por cobrar de una venta a crédito y registra el abono inicial si lo hubo.
    // Aquí se validan los datos que dependen del total de la venta.
    private void saveCredit(Invoice invoice, SaleRequest request, double total) {
        double initialPayment = 0;
        if (request.initialPayment() != null) {
            initialPayment = round(request.initialPayment());
        }

        if (initialPayment >= total) {
            throw new RuntimeException(
                    "El abono inicial debe ser menor al total; si el cliente paga todo, use otro método de pago");
        }

        double balance = round(total - initialPayment);
        double monthlyInstallment = round(request.monthlyInstallment());

        if (monthlyInstallment > balance) {
            throw new RuntimeException("El abono mensual no puede ser mayor al saldo pendiente");
        }

        String clientId = request.clientId().trim();

        ReceivableAccount account = new ReceivableAccount();
        account.setTotalAmount(total);
        account.setInitialPayment(initialPayment);
        account.setCurrentAmount(balance);
        account.setMonthlyInstallment(monthlyInstallment);
        account.setDueDate(request.dueDate());
        account.setIdInvoice(invoice.getId());
        account.setIdClient(clientId);
        account = receivableAccountService.add(account);

        if (initialPayment > 0) {
            ClientInstallment installment = new ClientInstallment();
            installment.setAmount(initialPayment);
            installment.setInstallmentDate(LocalDate.now());
            installment.setIdReceivableAccount(account.getId());
            installment.setIdClient(clientId);
            clientInstallmentService.add(installment);
        }
    }

    // Vende un producto, valida, guarda la línea, rebaja el stock y registra la
    // salida.
    // Devuelve el total de la línea.
    private double sellItem(Invoice invoice, SaleItemRequest item) {
        if (item.quantity() <= 0) {
            throw new RuntimeException("La cantidad de cada producto debe ser mayor a cero");
        }

        Product product = productService.getByIdWithLock(item.productId())
                .orElseThrow(() -> new RuntimeException("El producto con id " + item.productId() + " no existe"));

        // Validaciones de stock y estado del producto
        if (!product.isActive()) {
            throw new RuntimeException("El producto \"" + product.getName() + "\" está desactivado");
        }

        if (product.getProductAmount() < item.quantity()) {
            throw new RuntimeException("Existencias insuficientes de \"" + product.getName() + "\": disponibles "
                    + product.getProductAmount() + ", solicitadas " + item.quantity());
        }

        double lineTotal = round(product.getUnitPrice() * item.quantity());

        saveDetail(invoice, product, item.quantity(), lineTotal);
        saveMovement(invoice, product, item.quantity()); // aquí se rebaja el stock

        return lineTotal;
    }

    private void saveDetail(Invoice invoice, Product product, int quantity, double lineTotal) {
        InvoiceDetail detail = new InvoiceDetail();
        detail.setIdInvoice(invoice.getId());
        detail.setIdProduct(product.getId());
        detail.setAmount(quantity);
        detail.setUnitPrice(product.getUnitPrice());
        detail.setTotal(lineTotal);
        invoiceDetailService.add(detail);
    }

    // Registra la salida en donde InventoryMovementService.add es quien rebaja el stock
    private void saveMovement(Invoice invoice, Product product, int quantity) {
        InventoryMovement movement = new InventoryMovement();
        movement.setType("SALIDA");
        movement.setAmount(quantity);
        movement.setReason("Venta");
        movement.setProduct(product);
        movement.setIdInvoice(invoice.getId());
        inventoryMovementService.add(movement);
    }

    // Solo en efectivo se exige el monto recibido y se calcula el vuelto.
    // Con tarjeta, SINPE o crédito el vuelto es 0.
    private double calculateChange(SaleRequest request, double total) {
        if (!CASH.equals(request.paymentMethod())) {
            return 0;
        }
        if (request.amountReceived() == null) {
            throw new RuntimeException("Debe indicar el monto recibido en efectivo");
        }
        if (request.amountReceived() < total) {
            throw new RuntimeException("El monto recibido es menor al total a pagar");
        }
        return round(request.amountReceived() - total);
    }

    // Redondea a 2 decimales
    private double round(double value) {
        return Math.round(value * 100.0) / 100.0;
    }
}