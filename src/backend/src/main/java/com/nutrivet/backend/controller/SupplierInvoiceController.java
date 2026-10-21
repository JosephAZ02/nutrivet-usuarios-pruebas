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

import com.nutrivet.backend.domain.SupplierInvoice;
import com.nutrivet.backend.service.SupplierInvoiceService;

@RestController
@RequestMapping("/api/supplierInvoice")
@CrossOrigin(origins = "*")
public class SupplierInvoiceController {

    @Autowired
    private SupplierInvoiceService supplierInvoiceService;

    @GetMapping("/all")
    public List<SupplierInvoice> getAllSupplierInvoices() {
        return supplierInvoiceService.getAll();
    }

    @GetMapping("/get/{id}")
    public Optional<SupplierInvoice> getSupplierInvoiceById(@PathVariable int id) {
        return supplierInvoiceService.getById(id);
    }

    @PostMapping("/add")
    public SupplierInvoice addSupplierInvoice(@RequestBody SupplierInvoice supplierInvoice) {
        return supplierInvoiceService.add(supplierInvoice);
    }

    @PutMapping("/update")
    public SupplierInvoice updateSupplierInvoice(@RequestBody SupplierInvoice supplierInvoice) {
        return supplierInvoiceService.add(supplierInvoice);
    }

    @DeleteMapping("/delete/{id}")
    public void deleteSupplierInvoice(@PathVariable int id) {
        supplierInvoiceService.deleteById(id);
    }
}
