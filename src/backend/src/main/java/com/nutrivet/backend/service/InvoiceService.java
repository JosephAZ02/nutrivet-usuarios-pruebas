package com.nutrivet.backend.service;

import java.util.List;
import java.util.Optional;
import org.springframework.stereotype.Service;
import com.nutrivet.backend.domain.Invoice;
import com.nutrivet.backend.repository.InvoiceRepository;

@Service
public class InvoiceService {

    private final InvoiceRepository invoiceRepository;
    public InvoiceService(InvoiceRepository invoiceRepository) {
        this.invoiceRepository = invoiceRepository;
    }

    public List<Invoice> getAll() {
        return invoiceRepository.findAll();
    }

    public Optional<Invoice> getById(Integer id) {
        return invoiceRepository.findById(id);
    }

    public Invoice add(Invoice invoice) {
        return invoiceRepository.save(invoice);
    }

    public void deleteById(Integer id) {
        invoiceRepository.deleteById(id);
    }
}
