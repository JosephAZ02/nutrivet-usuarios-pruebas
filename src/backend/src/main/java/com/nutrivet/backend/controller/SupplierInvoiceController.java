package com.nutrivet.backend.controller;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.nutrivet.backend.domain.SupplierInvoice;
import com.nutrivet.backend.dto.SupplierInvoiceReviewRequest;
import com.nutrivet.backend.service.SupplierInvoiceService;
import com.nutrivet.backend.service.SupplierService;

@RestController
@RequestMapping("/api/supplierInvoice")
@CrossOrigin(origins = "*")
public class SupplierInvoiceController {

    private final SupplierInvoiceService supplierInvoiceService;
    private final SupplierService supplierService;

    public SupplierInvoiceController(SupplierInvoiceService supplierInvoiceService, SupplierService supplierService) {
        this.supplierInvoiceService = supplierInvoiceService;
        this.supplierService = supplierService;
    }

    @GetMapping("/all")
    @PreAuthorize("hasAuthority('SUPPLIER_INVOICE_GET_ALL')")
    public List<SupplierInvoice> getAllSupplierInvoices() {

        return supplierInvoiceService.getAll();
    }

    @GetMapping("/get/{id}")
    @PreAuthorize("hasAuthority('SUPPLIER_INVOICE_GET_BY_ID')")
    public Optional<SupplierInvoice> getSupplierInvoiceById(@PathVariable int id) {
        return supplierInvoiceService.getById(id);
    }

    @PutMapping("/{id}/review")
    @PreAuthorize("hasAuthority('SUPPLIER_INVOICE_UPDATE')")
    public SupplierInvoice reviewSupplierInvoice(@PathVariable int id,
            @RequestBody SupplierInvoiceReviewRequest request) {
        SupplierInvoice invoice = supplierInvoiceService.getById(id)
                .orElseThrow(() -> new IllegalArgumentException("Factura no encontrada."));

        if (!"CASH".equals(request.getCondition()) && !"CREDIT".equals(request.getCondition())) {
            throw new IllegalArgumentException("La condición de pago no es válida.");
        }
        if (request.getDueDate() == null || request.getDueDate().isBefore(invoice.getDate())) {
            throw new IllegalArgumentException("La fecha de vencimiento no es válida.");
        }
        if ("CREDIT".equals(request.getCondition()) && request.getPeriod() <= 0) {
            throw new IllegalArgumentException("El período debe ser mayor que cero.");
        }

        invoice.setCondition(request.getCondition());
        invoice.setPeriod(request.getPeriod());
        invoice.setDueDate(request.getDueDate());
        invoice.setState("CASH".equals(request.getCondition()) ? "PAID" : "PENDING");
        invoice.setPendingAmount("CASH".equals(request.getCondition()) ? 0 : invoice.getTotalAmount());
        return supplierInvoiceService.update(invoice);
    }

    @PutMapping("/{id}/markPaid")
    @PreAuthorize("hasAuthority('SUPPLIER_INVOICE_MARK_PAID')")
    public SupplierInvoice updateSupplierInvoiceStatePaid(@PathVariable int id) {
        if (supplierInvoiceService.getById(id).isEmpty()) {
            throw new IllegalArgumentException("Factura no encontrada.");
        }
        if (supplierInvoiceService.getById(id).get().getState().equals("PAID")
                || supplierInvoiceService.getById(id).get().getState().equals("CANCELLED")) {
            throw new IllegalArgumentException("La factura ya ha sido pagada.");
        }
        SupplierInvoice supplierInvoice = supplierInvoiceService.getById(id)
                .orElseThrow(() -> new IllegalArgumentException("Factura no encontrada."));
        supplierInvoice.setState("PAID");
        return supplierInvoiceService.add(supplierInvoice);
    }

    @PutMapping("/{id}/markCancelled")
    @PreAuthorize("hasAuthority('SUPPLIER_INVOICE_MARK_CANCELLED')")
    public SupplierInvoice updateSupplierInvoiceStateCancelled(@PathVariable int id) {

        if (supplierInvoiceService.getById(id).isEmpty()) {
            throw new IllegalArgumentException("Factura no encontrada.");
        }
        if (supplierInvoiceService.getById(id).get().getState().equals("PAID")) {
            throw new IllegalArgumentException("La factura ya ha sido pagada o cancelada.");
        }
        SupplierInvoice supplierInvoice = supplierInvoiceService.getById(id)
                .orElseThrow(() -> new IllegalArgumentException("Factura no encontrada."));
        supplierInvoice.setState("CANCELLED");
        return supplierInvoiceService.add(supplierInvoice);
    }

    @DeleteMapping("/delete/{id}")
    @PreAuthorize("hasAuthority('SUPPLIER_INVOICE_DELETE')")
    public void deleteSupplierInvoice(@PathVariable int id) {
        SupplierInvoice supplierInvoice = supplierInvoiceService.getById(id).orElse(null);
        if (supplierInvoice == null) {
            throw new IllegalArgumentException("Factura no encontrada.");
        }
        if (supplierInvoice.getState().equals("PAID")) {
            throw new IllegalArgumentException("No se puede eliminar una factura que ya ha sido pagada o cancelada.");

        }
        supplierInvoiceService.deleteById(id);

    }

    @GetMapping("/overdue")
    @PreAuthorize("hasAuthority('SUPPLIER_INVOICE_GET_ALL')")
    public List<SupplierInvoice> getOverdue() {
        return supplierInvoiceService.getOverdueInvoices();
    }
}
