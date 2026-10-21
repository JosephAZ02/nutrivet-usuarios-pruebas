package com.nutrivet.backend.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.nutrivet.backend.domain.ProductCategory;
import com.nutrivet.backend.repository.ProductCategoryRepository;

@Service
public class ProductCategoryService {

    @Autowired
    private ProductCategoryRepository productCategoryRepository;

    public List<ProductCategory> getAll() {
        return productCategoryRepository.findAll();
    }

    public Optional<ProductCategory> getById(Integer id) {
        return productCategoryRepository.findById(id);
    }

    public ProductCategory add(ProductCategory productCategory) {
        return productCategoryRepository.save(productCategory);
    }

    public void deleteById(Integer id) {
        productCategoryRepository.deleteById(id);
    }
}
