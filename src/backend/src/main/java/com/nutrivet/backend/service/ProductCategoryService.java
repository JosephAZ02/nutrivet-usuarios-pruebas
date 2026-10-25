
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

    private void validateName(String name) {
        if (name == null || name.trim().isEmpty()) {
            throw new RuntimeException("El nombre de la categoría es obligatorio");
        }

        if (name.trim().length() > 100) {
            throw new RuntimeException("El nombre no puede superar los 100 caracteres");
        }
    }

    public List<ProductCategory> getAll() {
        return productCategoryRepository.findAll();
    }

    public Optional<ProductCategory> getById(Integer id) {
        return productCategoryRepository.findById(id);
    }

    public ProductCategory add(ProductCategory productCategory) {
        validateName(productCategory.getName());

        String name = productCategory.getName().trim();

        if (productCategoryRepository.existsByNameIgnoreCase(name)) {
            throw new RuntimeException("Ya existe una categoría con ese nombre");
        }

        productCategory.setName(name);
        productCategory.setActive(true);

        return productCategoryRepository.save(productCategory);
    }

    public ProductCategory update(Integer id, ProductCategory updatedCategory) {validateName(updatedCategory.getName());
        ProductCategory existingCategory = productCategoryRepository.findById(id).orElseThrow(() -> new RuntimeException( "La categoría no existe"));

        String name = updatedCategory.getName().trim();

        if (productCategoryRepository.existsByNameIgnoreCaseAndIdNot(name, id)) {throw new RuntimeException("Ya existe otra categoría con ese nombre");
        }

        existingCategory.setName(name);

        return productCategoryRepository.save(existingCategory);
    }

    public void deactivate(Integer id) {
        ProductCategory category =productCategoryRepository.findById(id).orElseThrow(() -> new RuntimeException("La categoría no existe"));
        category.setActive(false);
        productCategoryRepository.save(category);
    }
}
