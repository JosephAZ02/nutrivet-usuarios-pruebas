package com.nutrivet.backend.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.nutrivet.backend.domain.InventoryMovement;
import com.nutrivet.backend.domain.Invoice;
import com.nutrivet.backend.domain.InvoiceDetail;
import com.nutrivet.backend.domain.Product;
import com.nutrivet.backend.dto.InvoiceLineResponse;
import com.nutrivet.backend.dto.InvoiceResponse;
import com.nutrivet.backend.dto.SaleItemRequest;
import com.nutrivet.backend.dto.SaleRequest;

@Service
public class SaleService {

    private static final String CASH = "EFECTIVO";
    private static final String CARD = "TARJETA";

    @Autowired
    private InvoiceService invoiceService;

    @Autowired
    private InvoiceDetailService invoiceDetailService;

    @Autowired
    private InventoryMovementService inventoryMovementService;

    @Autowired
    private ProductService productService;

    // Si algo falla, spring deshace todo con transactional
    @Transactional
    public InvoiceResponse createSale(SaleRequest request) {
        validateSale(request);

        // La factura se guarda primero para tener su id; los totales se completan al final
        Invoice invoice = new Invoice();
        invoice.setDate(LocalDateTime.now());
        invoice.setPaymentMethod(request.paymentMethod());
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

        return getInvoice(invoice.getId());
    }

    // Devuelve una factura guardada con sus líneas para mostrarla, imprimirla o descargarla
    public InvoiceResponse getInvoice(int id) {
        Invoice invoice = invoiceService.getById(id)
                .orElseThrow(() -> new RuntimeException("La factura no existe"));

        List<InvoiceLineResponse> invoiceLines = new ArrayList<>();
        for (InvoiceDetail detail : invoiceDetailService.getByInvoiceId(id)) {
            Product product = productService.getById(detail.getIdProduct()).orElse(null);
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

        return new InvoiceResponse(invoice.getId(), invoice.getNumber(), invoice.getDate(),
                invoice.getSubtotal(), tax, invoice.getTotal(), invoice.getPaymentMethod(),
                amountReceived, invoice.getChange(), invoice.isCredit(), invoiceLines);
    }

    private void validateSale(SaleRequest request) {
        if (request == null || request.items() == null || request.items().isEmpty()) {
            throw new RuntimeException("La factura debe tener al menos un producto");
        }
        String method = request.paymentMethod();

        if (!CASH.equals(method) && !CARD.equals(method)) {
            throw new RuntimeException("Método de pago inválido: use EFECTIVO o TARJETA");
        }
    }

    // Vende un producto, valida, guarda la línea, rebaja el stock y registra la salida.
    // Devuelve el total de la línea.
    private double sellItem(Invoice invoice, SaleItemRequest item) {
        if (item.quantity() <= 0) {
            throw new RuntimeException("La cantidad de cada producto debe ser mayor a cero");
        }

        Product product = productService.getByIdWithLock(item.productId()).orElseThrow(() -> new RuntimeException("El producto con id " + item.productId() + " no existe"));

        if (product.getProductAmount() < item.quantity()) {
            throw new RuntimeException("Existencias insuficientes de \"" + product.getName()
                    + "\": disponibles " + product.getProductAmount() + ", solicitadas " + item.quantity());
        }

        double lineTotal = round(product.getUnitPrice() * item.quantity());

        saveDetail(invoice, product, item.quantity(), lineTotal);
        discountStock(product, item.quantity());
        saveMovement(invoice, product, item.quantity());

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

    private void discountStock(Product product, int quantity) {
        product.setProductAmount(product.getProductAmount() - quantity);
        productService.add(product);
    }

    private void saveMovement(Invoice invoice, Product product, int quantity) {
        InventoryMovement movement = new InventoryMovement();
        movement.setType("SALIDA");
        movement.setAmount(quantity);
        movement.setMovementDate(LocalDate.now());
        movement.setIdProduct(product.getId());
        movement.setIdInvoice(invoice.getId());
        inventoryMovementService.add(movement);
    }

    // Con tarjeta el vuelto es 0. En efectivo se exige el monto recibido y se calcula el vuelto.
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