
package com.nutrivet.backend.controller;

import java.util.List;

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
import java.util.Optional;
import com.nutrivet.backend.domain.ProductCategory;
import com.nutrivet.backend.service.ProductCategoryService;

@RestController
@RequestMapping("/api/productCategory")
@CrossOrigin(origins = "*")
public class ProductCategoryController {

    @Autowired
    private ProductCategoryService productCategoryService;



    @GetMapping("/all")
    @PreAuthorize ("hasAuthority('PRODUCT_CATEGORY_GET_ALL')")
    public List<ProductCategory> getAllProductCategories() {
        return productCategoryService.getAll();
    }

    @GetMapping("/get/{id}")
    public ResponseEntity<?> getProductCategoryById(@PathVariable int id) {
        try {
            Optional<ProductCategory> category = productCategoryService.getById(id);
            if (category.isPresent()) {
                return ResponseEntity.ok(category.get());
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("La categoría no existe");
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error al consultar la categoría");
        }
    }

    @PostMapping("/add")
    @PreAuthorize ("hasAuthority('PRODUCT_CATEGORY_CREATE')")
    public ResponseEntity<String> addProductCategory(@RequestBody ProductCategory productCategory) {
        try {
            productCategoryService.add(productCategory);
            return ResponseEntity.status(HttpStatus.CREATED).body("La categoría fue agregada exitosamente");
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("Error al agregar la categoría: " + e.getMessage());
        }
    }

    @PutMapping("/update/{id}")
    @PreAuthorize ("hasAuthority('PRODUCT_CATEGORY_UPDATE')")
    public ResponseEntity<String> updateProductCategory(@PathVariable int id,
            @RequestBody ProductCategory productCategory) {
        try {
            productCategoryService.update(id, productCategory);
            return ResponseEntity.ok("La categoría fue actualizada exitosamente");
        } catch (RuntimeException e) {
            if ("La categoría no existe".equals(e.getMessage())) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
            }
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body("Error al actualizar la categoría: " + e.getMessage());
        }
    }

    @DeleteMapping("/delete/{id}")
    @PreAuthorize ("hasAuthority('PRODUCT_CATEGORY_DELETE')")
    public ResponseEntity<String> deactivateProductCategory(@PathVariable int id) {
        try {
            productCategoryService.deactivate(id);
            return ResponseEntity.ok("La categoría fue desactivada exitosamente");
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Error al desactivar la categoría: " + e.getMessage());
        }
    }
}
