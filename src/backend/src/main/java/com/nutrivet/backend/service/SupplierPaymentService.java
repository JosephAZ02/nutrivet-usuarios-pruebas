package com.nutrivet.backend.service;

import java.util.List;
import org.springframework.stereotype.Service;

import com.nutrivet.backend.domain.SupplierPayment;
import com.nutrivet.backend.repository.SupplierPaymentRepository;

@Service
public class SupplierPaymentService {

    private final SupplierPaymentRepository supplierPaymentRepository;

    public SupplierPaymentService(SupplierPaymentRepository supplierPaymentRepository) {
        this.supplierPaymentRepository = supplierPaymentRepository;
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

}
