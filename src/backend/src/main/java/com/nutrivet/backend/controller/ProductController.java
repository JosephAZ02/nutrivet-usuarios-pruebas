package com.nutrivet.backend.controller;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
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
    public List<Product> getAllProducts() {
        return productService.getAll();
    }

    @GetMapping("/get/{id}")
    @PreAuthorize ("hasAuthority('PRODUCT_GET_BY_ID')")
    public Optional<Product> getProductById(@PathVariable int id) {
        return productService.getById(id);
    }

    @PostMapping("/add")
    @PreAuthorize ("hasAuthority('PRODUCT_CREATE')")
    public Product addProduct(@RequestBody Product product) {
        return productService.add(product);
    }

    @PutMapping("/update")
    @PreAuthorize ("hasAuthority('PRODUCT_UPDATE')")
    public Product updateProduct(@RequestBody Product product) {
        return productService.add(product);
    }

    @DeleteMapping("/delete/{id}")
    @PreAuthorize ("hasAuthority('PRODUCT_DELETE')")
    public void deleteProduct(@PathVariable int id) {
        productService.deleteById(id);
    }
}
