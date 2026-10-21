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

import com.nutrivet.backend.domain.ProductCategory;
import com.nutrivet.backend.service.ProductCategoryService;

@RestController
@RequestMapping("/api/productCategory")
@CrossOrigin(origins = "*")
public class ProductCategoryController {

    @Autowired
    private ProductCategoryService productCategoryService;

    @GetMapping("/all")
    public List<ProductCategory> getAllProductCategories() {
        return productCategoryService.getAll();
    }

    @GetMapping("/get/{id}")
    public Optional<ProductCategory> getProductCategoryById(@PathVariable int id) {
        return productCategoryService.getById(id);
    }

    @PostMapping("/add")
    public ProductCategory addProductCategory(@RequestBody ProductCategory productCategory) {
        return productCategoryService.add(productCategory);
    }

    @PutMapping("/update")
    public ProductCategory updateProductCategory(@RequestBody ProductCategory productCategory) {
        return productCategoryService.add(productCategory);
    }

    @DeleteMapping("/delete/{id}")
    public void deleteProductCategory(@PathVariable int id) {
        productCategoryService.deleteById(id);
    }
}
