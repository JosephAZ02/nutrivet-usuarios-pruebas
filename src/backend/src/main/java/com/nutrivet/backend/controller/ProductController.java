package com.nutrivet.backend.controller;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
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

import com.nutrivet.backend.domain.Product;
import com.nutrivet.backend.service.ProductService;

@RestController
@RequestMapping("/api/product")
@CrossOrigin(origins = "*")
public class ProductController {

    @Autowired
    private ProductService productService;

    @GetMapping("/all")
    @PreAuthorize ("hasAuthority('PRODUCT_GET_ALL')")
    public ResponseEntity<?> getAllProducts() {
        try {
            List<Product> products = productService.getAll();
            return ResponseEntity.ok(products);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error al consultar los productos");
        }
    }

    @GetMapping("/get/{id}")
    @PreAuthorize ("hasAuthority('PRODUCT_GET_BY_ID')")
    public ResponseEntity<?> getProductById(@PathVariable int id) {
        try {
            Optional<Product> product = productService.getById(id);
            if (product.isPresent()) {
                return ResponseEntity.ok(product.get());
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("El producto no existe");
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error al consultar el producto");
        }
    }

    @PostMapping("/add")
    @PreAuthorize ("hasAuthority('PRODUCT_CREATE')")
    public ResponseEntity<?> addProduct(@RequestBody Product product) {
        try {
            productService.add(product);
            return ResponseEntity.status(HttpStatus.CREATED).body("El producto fue agregado exitosamente");
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Error al agregar el producto: " + e.getMessage());
        }
    }

    @PutMapping("/update/{id}")
    @PreAuthorize("hasAuthority('PRODUCT_UPDATE')")
    public ResponseEntity<String> updateProduct(@PathVariable int id,@RequestBody Product product) {
        try {
            productService.update(id, product);
            return ResponseEntity.ok( "El producto fue actualizado exitosamente");
        } catch (RuntimeException e) {
            if ("El producto no existe".equals(e.getMessage())) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
            }
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Error al actualizar el producto: " + e.getMessage());
        }
    }

    @DeleteMapping("/delete/{id}")
    @PreAuthorize ("hasAuthority('PRODUCT_DELETE')")
    public ResponseEntity<String> deleteProduct(@PathVariable int id) {
        try {
            productService.deleteById(id);
            return ResponseEntity.ok("El producto fue eliminado exitosamente");
        } catch (RuntimeException e) {
            if ("El producto no existe".equals(e.getMessage())) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
            }
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error al eliminar el producto");
        }
    }
}

