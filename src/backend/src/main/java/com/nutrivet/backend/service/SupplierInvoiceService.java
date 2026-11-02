package com.nutrivet.backend.service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import org.springframework.stereotype.Service;
import com.nutrivet.backend.domain.SupplierInvoice;
import com.nutrivet.backend.repository.SupplierInvoiceRepository;

@Service
public class SupplierInvoiceService {

    private final SupplierInvoiceRepository supplierInvoiceRepository;

    public SupplierInvoiceService(SupplierInvoiceRepository supplierInvoiceRepository,
            SupplierService supplierService) {
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

    public boolean isOverdue(SupplierInvoice invoice) {
        return ("PENDING").equals(invoice.getState()) && invoice.getDueDate() != null
                && invoice.getDueDate().isBefore(LocalDate.now());
    }

    public List<SupplierInvoice> getOverdueInvoices() {
        return supplierInvoiceRepository.findAll().stream()
                .filter(this::isOverdue)
                .toList();
    }
}
