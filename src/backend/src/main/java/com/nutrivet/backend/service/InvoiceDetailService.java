package com.nutrivet.backend.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.nutrivet.backend.domain.InvoiceDetail;
import com.nutrivet.backend.repository.InvoiceDetailRepository;

@Service
public class InvoiceDetailService {

    @Autowired
    private InvoiceDetailRepository invoiceDetailRepository;

    public List<InvoiceDetail> getAll() {
        return invoiceDetailRepository.findAll();
    }

    public Optional<InvoiceDetail> getById(Integer id) {
        return invoiceDetailRepository.findById(id);
    }

    public InvoiceDetail add(InvoiceDetail invoiceDetail) {
        return invoiceDetailRepository.save(invoiceDetail);
    }

    public void deleteById(Integer id) {
        invoiceDetailRepository.deleteById(id);
    }
}
