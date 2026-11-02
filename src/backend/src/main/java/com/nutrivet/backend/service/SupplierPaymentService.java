package com.nutrivet.backend.service;

import java.util.List;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.stereotype.Service;

import com.nutrivet.backend.domain.SupplierInvoice;
import com.nutrivet.backend.domain.SupplierPayment;
import com.nutrivet.backend.repository.SupplierPaymentRepository;

@Service
public class SupplierPaymentService {

    private final SupplierPaymentRepository supplierPaymentRepository;
    private final SupplierInvoiceService supplierInvoiceService;

    public SupplierPaymentService(SupplierPaymentRepository supplierPaymentRepository,
            SupplierInvoiceService supplierInvoiceService) {
        this.supplierPaymentRepository = supplierPaymentRepository;
        this.supplierInvoiceService = supplierInvoiceService;
    }

    public List<SupplierPayment> getAll() {
        return supplierPaymentRepository.findAll();
    }

    public List<SupplierPayment> getAllBySupplierInvoiceId(Integer id) {
        return supplierPaymentRepository.findByIdSupplierInvoice(id);
    }

    public SupplierPayment add(SupplierPayment supplierPayment) {
        return supplierPaymentRepository.save(supplierPayment);
    }

    @Transactional
    public SupplierPayment registerPayment(SupplierPayment payment) {
        if (payment.getAmount() <= 0) {
            throw new IllegalArgumentException("El monto del pago debe ser mayor a cero.");
        }
        if (payment.getPaymentDate() == null) {
            throw new IllegalArgumentException("La fecha de pago es obligatoria.");
        }

        SupplierInvoice invoice = supplierInvoiceService.getById(payment.getIdSupplierInvoice())
                .orElseThrow(() -> new IllegalArgumentException("La factura del proveedor no existe."));
        if ("PAID".equals(invoice.getState()) || "CANCELLED".equals(invoice.getState())) {
            throw new IllegalArgumentException("No se pueden registrar abonos en una factura pagada o cancelada.");
        }

        double paidAmount = supplierPaymentRepository.findByIdSupplierInvoice(invoice.getId()).stream()
                .mapToDouble(SupplierPayment::getAmount)
                .sum();
        double pendingAmount = invoice.getTotalAmount() - paidAmount;
        if (payment.getAmount() > pendingAmount) {
            throw new IllegalArgumentException("El monto acumulado de los abonos no puede superar la factura.");
        }

        invoice.setPendingAmount(pendingAmount - payment.getAmount());
        if (invoice.getPendingAmount() <= 0.000001) {
            invoice.setPendingAmount(0);
            invoice.setState("PAID");
        }
        supplierInvoiceService.update(invoice);
        return supplierPaymentRepository.save(payment);
    }

}
