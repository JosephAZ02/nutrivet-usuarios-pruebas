package com.nutrivet.backend.service;

import java.util.List;
import java.util.Optional;
import org.springframework.stereotype.Service;
import com.nutrivet.backend.domain.InvoiceDetail;
import com.nutrivet.backend.repository.InvoiceDetailRepository;

@Service
public class InvoiceDetailService {

    
    private final InvoiceDetailRepository invoiceDetailRepository;
    public InvoiceDetailService(InvoiceDetailRepository invoiceDetailRepository) {
        this.invoiceDetailRepository = invoiceDetailRepository;
    }

    public List<InvoiceDetail> getAll() {
        return invoiceDetailRepository.findAll();
    }

    public InvoiceDetail add(InvoiceDetail invoiceDetail) {
        return invoiceDetailRepository.save(invoiceDetail);
    }

    public List<InvoiceDetail> getByInvoiceId(int invoiceId) {
        return invoiceDetailRepository.findByIdInvoice(invoiceId);
    }

    public Optional<InvoiceDetail> getById(Integer id) {
        return invoiceDetailRepository.findById(id);
    }

    public void deleteById(Integer id) {
        invoiceDetailRepository.deleteById(id);
    }
}
