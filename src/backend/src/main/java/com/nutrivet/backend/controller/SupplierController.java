package com.nutrivet.backend.controller;

import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.nutrivet.backend.domain.Supplier;
import com.nutrivet.backend.service.SupplierService;

@RestController
@RequestMapping("/api/supplier")
@CrossOrigin(origins = "*")
public class SupplierController {

    private final SupplierService supplierService;

    public SupplierController(SupplierService supplierService) {
        this.supplierService = supplierService;
    }

    @GetMapping("/all")
    @PreAuthorize("hasAuthority('SUPPLIER_GET_ALL')")
    public ResponseEntity<List<Supplier>> getAllSuppliers() {
        return ResponseEntity.ok(supplierService.getAll());
    }

    @GetMapping("/get/{id}")
    @PreAuthorize("hasAuthority('SUPPLIER_GET_BY_ID')")
    public ResponseEntity<?> getSupplierById(@PathVariable int id) {
        if (id <= 0) {
            return error(HttpStatus.BAD_REQUEST, "El ID del proveedor debe ser mayor a cero.");
        }
        return supplierService.getById(id)
                .<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElseGet(() -> error(HttpStatus.NOT_FOUND, "Proveedor no encontrado."));
    }

    @PostMapping("/add")
    @PreAuthorize("hasAuthority('SUPPLIER_CREATE')")
    public ResponseEntity<?> addSupplier(@RequestBody Supplier supplier) {
        if (supplier == null || supplier.getName() == null || supplier.getName().isBlank()) {
            throw new IllegalArgumentException("El nombre del proveedor es obligatorio.");
        }
        if (supplier.getEmail() == null || supplier.getEmail().isBlank()) {
            throw new IllegalArgumentException("El email del proveedor es obligatorio.");
        }
        return ResponseEntity.status(HttpStatus.CREATED).body(supplierService.add(supplier));
    }

    @PutMapping("/update")
    @PreAuthorize("hasAuthority('SUPPLIER_UPDATE')")
    public ResponseEntity<?> updateSupplier(@RequestBody Supplier supplier) {
        if (supplier == null || supplier.getId() <= 0) {
            return error(HttpStatus.BAD_REQUEST, "El ID del proveedor debe ser mayor a cero.");
        }
        if (supplierService.getById(supplier.getId()).isEmpty()) {
            return error(HttpStatus.NOT_FOUND, "Proveedor no encontrado.");
        }
        if (supplier.getName() == null || supplier.getName().isBlank()) {
            throw new IllegalArgumentException("El nombre del proveedor es obligatorio.");
        }
        if (supplier.getEmail() == null || supplier.getEmail().isBlank()) {
            throw new IllegalArgumentException("El email del proveedor es obligatorio.");
        }
        return ResponseEntity.ok(supplierService.add(supplier));
    }

    @DeleteMapping("/delete/{id}")
    @PreAuthorize("hasAuthority('SUPPLIER_DELETE')")
    public ResponseEntity<?> deleteSupplier(@PathVariable int id) {
        if (id <= 0) {
            return error(HttpStatus.BAD_REQUEST, "El ID del proveedor debe ser mayor a cero.");
        }
        if (supplierService.getById(id).isEmpty()) {
            return error(HttpStatus.NOT_FOUND, "Proveedor no encontrado.");
        }
        supplierService.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    private ResponseEntity<String> error(HttpStatus status, String message) {
        return ResponseEntity.status(status).body(message);
    }
}
