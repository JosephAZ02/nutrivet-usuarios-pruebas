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

    @PostMapping("/add")
    @PreAuthorize("hasAuthority('SUPPLIER_INVOICE_CREATE')")
    public SupplierInvoice addSupplierInvoice(@RequestBody SupplierInvoice supplierInvoice) {
        if (supplierInvoice.getCondition() == null ||
                supplierInvoice.getCondition().isBlank()) {
            throw new IllegalArgumentException("La condición es obligatoria.");
        }
        if (supplierInvoice.getCondition().equals("CASH")) {
            supplierInvoice.setDueDate(LocalDate.now());
            supplierInvoice.setState("PAID");
        } else {
            supplierInvoice.setState("PENDING");
            supplierInvoice.setDueDate(supplierInvoice.getDate().plusDays(supplierInvoice.getPeriod()));
        }
        if (supplierInvoice.getCondition() == null || supplierInvoice.getCondition().isEmpty()) {
            throw new IllegalArgumentException("La condición de la factura no puede estar vacía.");
        }
        if (supplierInvoice.getPeriod() <= 0 && supplierInvoice.getCondition().equals("CREDIT")) {
            throw new IllegalArgumentException("El período de la factura debe ser mayor a cero.");
        }
        if (supplierInvoice.getDueDate() == null) {
            throw new IllegalArgumentException("La fecha de vencimiento de la factura no puede estar vacía.");
        }
        if (supplierInvoice.getDueDate().isBefore(supplierInvoice.getDate())) {
            throw new IllegalArgumentException(
                    "La fecha de vencimiento no puede ser anterior a la fecha de la factura.");
        }
        if (supplierInvoice.getTotalAmount() <= 0) {
            throw new IllegalArgumentException("El monto total de la factura debe ser mayor a cero.");
        }
        if (supplierService.getById(supplierInvoice.getIdSupplier()).isEmpty()) {
            throw new IllegalArgumentException("El ID del proveedor no existe en la base de datos.");
        }

        return supplierInvoiceService.add(supplierInvoice);
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
