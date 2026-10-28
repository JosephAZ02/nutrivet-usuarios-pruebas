package com.nutrivet.backend.service;

import java.util.List;
import java.util.Optional;
import org.springframework.stereotype.Service;
import com.nutrivet.backend.domain.SupplierInvoice;
import com.nutrivet.backend.repository.SupplierInvoiceRepository;

@Service
public class SupplierInvoiceService {

    private final SupplierInvoiceRepository supplierInvoiceRepository;
    public SupplierInvoiceService(SupplierInvoiceRepository supplierInvoiceRepository) {
        this.supplierInvoiceRepository = supplierInvoiceRepository;
    }

    public List<SupplierInvoice> getAll() {
        return supplierInvoiceRepository.findAll();
    }

    public Optional<SupplierInvoice> getById(Integer id) {
        return supplierInvoiceRepository.findById(id);
    }

    public SupplierInvoice add(SupplierInvoice supplierInvoice) {
        return supplierInvoiceRepository.save(supplierInvoice);
    }

    public void deleteById(Integer id) {
        supplierInvoiceRepository.deleteById(id);
    }
}
