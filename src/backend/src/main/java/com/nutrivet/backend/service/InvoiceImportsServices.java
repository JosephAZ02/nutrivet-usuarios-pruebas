package com.nutrivet.backend.service;

import java.io.IOException;
import java.time.LocalDateTime;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.transaction.annotation.Transactional;

import com.nutrivet.backend.domain.InvoiceImports;
import com.nutrivet.backend.domain.Supplier;
import com.nutrivet.backend.domain.SupplierInvoice;
import com.nutrivet.backend.dto.ImportedInvoiceData;
import com.nutrivet.backend.repository.InvoiceImportsRepository;
import com.nutrivet.backend.repository.SupplierInvoiceRepository;
import com.nutrivet.backend.repository.SupplierRepository;
import com.nutrivet.backend.util.XmlInvoiceParser;

@Service
public class InvoiceImportsServices {

    private final InvoiceImportsRepository invoiceImportsRepository;
    private final SupplierInvoiceRepository supplierInvoiceRepository;
    private final SupplierRepository supplierRepository;
    private final XmlInvoiceParser xmlInvoiceParser;

    public InvoiceImportsServices(InvoiceImportsRepository invoiceImportsRepository,
            SupplierInvoiceRepository supplierInvoiceRepository,
            SupplierRepository supplierRepository, XmlInvoiceParser xmlInvoiceParser) {
        this.invoiceImportsRepository = invoiceImportsRepository;
        this.supplierInvoiceRepository = supplierInvoiceRepository;
        this.supplierRepository = supplierRepository;
        this.xmlInvoiceParser = xmlInvoiceParser;
    }

    public InvoiceImports registerImport(InvoiceImports invoiceImport) {
        if (invoiceImportsRepository.existsByMessageId(invoiceImport.getMessageId())) {
            throw new IllegalArgumentException("El correo ya fue procesado.");
        }

        if (invoiceImport.getImportedAt() == null) {
            invoiceImport.setImportedAt(LocalDateTime.now());
        }

        return invoiceImportsRepository.save(invoiceImport);
    }

    public ImportedInvoiceData parseInvoice(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("El archivo XML es obligatorio.");
        }

        String fileName = file.getOriginalFilename();
        if (fileName == null || !fileName.toLowerCase().endsWith(".xml")) {
            throw new IllegalArgumentException("El archivo debe tener extensión XML.");
        }

        try {
            return xmlInvoiceParser.parseInvoiceData(file.getInputStream());
        } catch (IOException exception) {
            throw new IllegalArgumentException("No se pudo leer el archivo XML.", exception);
        }
    }

    @Transactional
    public SupplierInvoice importInvoice(MultipartFile file) {
        try {
            return importInvoice(file.getInputStream(), file.getOriginalFilename(),
                    "MANUAL-" + file.getOriginalFilename());
        } catch (IOException exception) {
            throw new IllegalArgumentException("No se pudo leer el archivo XML.", exception);
        }
    }

    @Transactional
    public SupplierInvoice importInvoice(java.io.InputStream inputStream, String fileName, String messageId) {
        ImportedInvoiceData data = xmlInvoiceParser.parseInvoiceData(inputStream);
        String electronicKey = data.getElectronicKey();

        boolean alreadyImported = supplierInvoiceRepository.existsByElectronicKey(electronicKey)
                || invoiceImportsRepository.findByElectronicKey(electronicKey).isPresent();

        if (alreadyImported) {
            throw new IllegalArgumentException("La factura ya fue importada.");
        }

        Supplier supplier = supplierRepository.findByIdentificationNumber(data.getSupplierIdentification());// buscar el
                                                                                                            // proveedor
                                                                                                            // por la
        // identificacion
        // de la
        // factura
        if (supplier == null) {
            if (data.getSupplierName() == null || data.getSupplierName().isBlank()
                    || data.getSupplierIdentification() == null
                    || data.getSupplierIdentification().isBlank()) {
                throw new IllegalArgumentException(
                        "El XML no contiene los datos necesarios para crear el proveedor.");
            }

            supplier = new Supplier();
            supplier.setName(data.getSupplierName());
            supplier.setEmail(data.getSupplierEmail());
            supplier.setIdentificationNumber(data.getSupplierIdentification());
            supplier = supplierRepository.save(supplier);
        }

        if (data.getEmissionDate() == null || data.getTotalAmount() <= 0) {// verificar que la fecha y el total de la
                                                                           // factura sean validos
            throw new IllegalArgumentException("La fecha y el total de la factura son obligatorios.");
        }

        SupplierInvoice invoice = new SupplierInvoice();// crear una nueva factura de proveedor
        invoice.setDate(data.getEmissionDate().toLocalDate());
        invoice.setTotalAmount(data.getTotalAmount());
        invoice.setPendingAmount(data.getTotalAmount());
        invoice.setState("REVIEW");
        invoice.setCondition(null);
        invoice.setPeriod(null);
        invoice.setDueDate(null);
        invoice.setElectronicKey(data.getElectronicKey());
        invoice.setIdSupplier(supplier.getId());

        SupplierInvoice savedInvoice = supplierInvoiceRepository.save(invoice);

        InvoiceImports invoiceImport = new InvoiceImports();// crear un nuevo registro de importacion

        invoiceImport.setMessageId(messageId);
        invoiceImport.setFileName(fileName);
        invoiceImport.setElectronicKey(data.getElectronicKey());// guardar la clave electronica de la factura
        invoiceImport.setImportedAt(LocalDateTime.now());// guardar la fecha y hora de la importacion
        invoiceImport.setStatus("PROCESSED");// guardar el estado de la importacion como procesada
        invoiceImportsRepository.save(invoiceImport);// guardar el registro de importacion en la base de datos

        return savedInvoice;// devolver la factura de proveedor guardada
    }
}