package com.nutrivet.backend.controller;

import java.util.List;
import java.util.Optional;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.nutrivet.backend.domain.Invoice;
import com.nutrivet.backend.dto.SaleRequest;
import com.nutrivet.backend.service.InvoiceService;
import com.nutrivet.backend.service.SaleService;

@RestController
@RequestMapping("/api/invoice")
@CrossOrigin(origins = "*")
public class InvoiceController {

    private final InvoiceService invoiceService;
    private final SaleService saleService;

    public InvoiceController(InvoiceService invoiceService, SaleService saleService) {
        this.invoiceService = invoiceService;
        this.saleService = saleService;
    }

    // Registra la venta: crea la factura y sus líneas, y rebaja el inventario
    @PostMapping("/sale")
    @PreAuthorize("hasAuthority('INVOICE_CREATE')")
    public ResponseEntity<?> createSale(@RequestBody SaleRequest request) {
        try {
            return ResponseEntity.status(HttpStatus.CREATED).body(saleService.createSale(request));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // Factura completa con sus líneas, para mostrarla, imprimirla o descargarla
    @GetMapping("/detail/{id}")
    @PreAuthorize("hasAuthority('INVOICE_GET_BY_ID')")
    public ResponseEntity<?> getInvoiceDetail(@PathVariable int id) {
        try {
            return ResponseEntity.ok(saleService.getInvoice(id));
        } catch (RuntimeException e) {
            if ("La factura no existe".equals(e.getMessage())) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
            }
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/all")
    @PreAuthorize("hasAuthority('INVOICE_GET_ALL')")
    public List<Invoice> getAllInvoices() {
        return invoiceService.getAll();
    }

    @GetMapping("/get/{id}")
    @PreAuthorize("hasAuthority('INVOICE_GET_BY_ID')")
    public Optional<Invoice> getInvoiceById(@PathVariable Integer id) {
        return invoiceService.getById(id);
    }
}
