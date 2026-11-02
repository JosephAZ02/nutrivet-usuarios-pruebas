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
import com.nutrivet.backend.service.SupplierInvoiceService;
import com.nutrivet.backend.service.SupplierPaymentService;

@RestController
@RequestMapping("/api/supplierPayment")
@CrossOrigin(origins = "*")
public class SupplierPaymentController {

    private final SupplierPaymentService supplierPaymentService;
    private final SupplierInvoiceService supplierInvoiceService;

    public SupplierPaymentController(SupplierPaymentService supplierPaymentService,
            SupplierInvoiceService supplierInvoiceService) {
        this.supplierPaymentService = supplierPaymentService;
        this.supplierInvoiceService = supplierInvoiceService;
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

        if (supplierPayment.getAmount() <= 0) {
            throw new IllegalArgumentException("El monto del pago debe ser mayor a cero.");
        }
        if (supplierPayment.getPaymentDate() == null) {

            throw new IllegalArgumentException("La fecha de pago es obligatoria.");
        }
        if (supplierPayment.getIdSupplierInvoice() == 0) {
            throw new IllegalArgumentException("El ID de la factura del proveedor es obligatorio.");
        }
        if (supplierInvoiceService.getById(supplierPayment.getIdSupplierInvoice()).isEmpty()) {
            throw new IllegalArgumentException("La factura del proveedor no existe.");
        }
        if (supplierPayment.getAmount() > supplierInvoiceService.getById(supplierPayment.getIdSupplierInvoice()).get()
                .getTotalAmount()) {
            throw new IllegalArgumentException("El monto del pago no puede ser mayor al total de la factura.");
        }

        return supplierPaymentService.add(supplierPayment);
    }

}
