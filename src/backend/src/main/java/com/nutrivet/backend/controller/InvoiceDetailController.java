package com.nutrivet.backend.controller;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.nutrivet.backend.domain.InvoiceDetail;
import com.nutrivet.backend.service.InvoiceDetailService;

@RestController
@RequestMapping("/api/invoiceDetail")
@CrossOrigin(origins = "*")
public class InvoiceDetailController {

    @Autowired
    private InvoiceDetailService invoiceDetailService;

    @GetMapping("/all")
    public List<InvoiceDetail> getAllInvoiceDetails() {
        return invoiceDetailService.getAll();
    }

    @GetMapping("/get/{id}")
    public Optional<InvoiceDetail> getInvoiceDetailById(@PathVariable Integer id) {
        return invoiceDetailService.getById(id);
    }

    @PostMapping("/add")
    public InvoiceDetail addInvoiceDetail(@RequestBody InvoiceDetail invoiceDetail) {
        return invoiceDetailService.add(invoiceDetail);
    }

    @PutMapping("/update")
    public InvoiceDetail updateInvoiceDetail(@RequestBody InvoiceDetail invoiceDetail) {
        return invoiceDetailService.add(invoiceDetail);
    }

    @DeleteMapping("/delete/{id}")
    public void deleteInvoiceDetail(@PathVariable int id) {
        invoiceDetailService.deleteById(id);
    }
}
