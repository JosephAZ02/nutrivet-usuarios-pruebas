package com.nutrivet.backend.controller;

import java.util.List;
import java.util.Optional;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.nutrivet.backend.domain.Invoice;
import com.nutrivet.backend.service.InvoiceService;

@RestController
@RequestMapping("/api/invoice")
@CrossOrigin(origins = "*")
public class InvoiceController {

    private final InvoiceService invoiceService;

    public InvoiceController(InvoiceService invoiceService) {
        this.invoiceService = invoiceService;
    }

    @GetMapping("/all")
    public List<Invoice> getAllInvoices() {
        return invoiceService.getAll();
    }

    @GetMapping("/get/{id}")
    public Optional<Invoice> getInvoiceById(@PathVariable Integer id) {
        return invoiceService.getById(id);
    }

    @PostMapping("/add")
    public Invoice addInvoice(@RequestBody Invoice invoice) {
        return invoiceService.add(invoice);
    }

    @PutMapping("/update")
    public Invoice updateInvoice(@RequestBody Invoice invoice) {
        return invoiceService.add(invoice);
    }

    @DeleteMapping("/delete/{id}")
    public void deleteInvoice(@PathVariable int id) {
        invoiceService.deleteById(id);
    }
}
