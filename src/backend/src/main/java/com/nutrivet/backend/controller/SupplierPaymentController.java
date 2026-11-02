package com.nutrivet.backend.controller;

import java.util.List;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.nutrivet.backend.domain.SupplierPayment;
import com.nutrivet.backend.service.SupplierPaymentService;

@RestController
@RequestMapping("/api/supplierPayment")
@CrossOrigin(origins = "*")
public class SupplierPaymentController {

    private final SupplierPaymentService supplierPaymentService;

    public SupplierPaymentController(SupplierPaymentService supplierPaymentService) {
        this.supplierPaymentService = supplierPaymentService;
    }

    @GetMapping("/all")
    @PreAuthorize("hasAuthority('SUPPLIER_PAYMENT_GET_ALL')")
    public List<SupplierPayment> getAllSupplierPayments() {
        return supplierPaymentService.getAll();
    }

    @GetMapping("/paymentInvoiceSupplier/{id}")
    @PreAuthorize("hasAuthority('SUPPLIER_PAYMENT_GET_BY_INVOICE')")
    public List<SupplierPayment> getAllBySupplierInvoiceId(@PathVariable int id) {
        return supplierPaymentService.getAllBySupplierInvoiceId(id);
    }

    @PostMapping("/add")
    @PreAuthorize("hasAuthority('SUPPLIER_PAYMENT_CREATE')")
    public SupplierPayment addSupplierPayment(@RequestBody SupplierPayment supplierPayment) {

        if (supplierPayment.getIdSupplierInvoice() <= 0) {
            throw new IllegalArgumentException("El ID de la factura del proveedor es obligatorio.");
        }
        return supplierPaymentService.registerPayment(supplierPayment);
    }

}
