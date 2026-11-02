package com.nutrivet.backend.controller;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.nutrivet.backend.domain.InvoiceImports;
import com.nutrivet.backend.domain.SupplierInvoice;
import com.nutrivet.backend.dto.ImportedInvoiceData;
import com.nutrivet.backend.service.InvoiceEmailService;
import com.nutrivet.backend.service.InvoiceImportsServices;

@RestController
@RequestMapping("/api/invoice-import")
@CrossOrigin(origins = "*")
public class InvoiceImportsController {

    private final InvoiceImportsServices invoiceImportsServices;

    public InvoiceImportsController(
            InvoiceImportsServices invoiceImportsServices) {
        this.invoiceImportsServices = invoiceImportsServices;
    }

    // solo pruebas
    @PostMapping(value = "/parse", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAuthority('SUPPLIER_INVOICE_CREATE')")
    public ImportedInvoiceData parseInvoice(@RequestParam("file") MultipartFile file) {
        return invoiceImportsServices.parseInvoice(file);
    }

    @PostMapping(value = "/import", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAuthority('SUPPLIER_INVOICE_CREATE')")
    public SupplierInvoice importInvoice(@RequestParam("file") MultipartFile file) {
        return invoiceImportsServices.importInvoice(file);
    }

}
