package com.nutrivet.backend.controller;

import java.util.List;
import java.util.Optional;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.bind.annotation.RestController;
import com.nutrivet.backend.domain.Product;
import com.nutrivet.backend.service.ProductService;

@RestController
@RequestMapping("/api/product")
@CrossOrigin(origins = "*")
public class ProductController {

    private final ProductService productService;

    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    // endpoints de buscadores
    @GetMapping("/search/name")
    @PreAuthorize("hasAuthority('PRODUCT_GET_ALL')")
    public ResponseEntity<?> searchProductsByName(@RequestParam String name) {
        try {
            return ResponseEntity.ok(productService.searchByName(name));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/search/code")
    @PreAuthorize("hasAuthority('PRODUCT_GET_BY_ID')")
    public ResponseEntity<?> searchProductByCode(@RequestParam String code) {
        try {
            return productService.searchByCode(code).<ResponseEntity<?>>map(ResponseEntity::ok)
                    .orElseGet(() -> ResponseEntity.notFound().build());
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // endpoints de stock
    @GetMapping("/stock-status/{id}")
    @PreAuthorize("hasAuthority('PRODUCT_GET_BY_ID')")
    public ResponseEntity<?> getStockStatus(@PathVariable Integer id) {
        try {
            Product product = productService.getById(id)
                    .orElseThrow(() -> new RuntimeException("No se encontró el producto"));
            String status = productService.getStockStatus(product.getProductAmount());

            return ResponseEntity.ok(status);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }

    @GetMapping("/critical-stock")
    @PreAuthorize("hasAuthority('PRODUCT_GET_ALL')")
    public ResponseEntity<?> getCriticalStockProducts() {
        return ResponseEntity.ok(productService.getCriticalStockProducts());
    }

    @GetMapping("/low-stock")
    @PreAuthorize("hasAuthority('PRODUCT_GET_ALL')")
    public ResponseEntity<?> getLowStockProducts() {
        return ResponseEntity.ok(productService.getLowStockProducts());
    }

    // endpoints de crud
    @GetMapping("/all")
    @PreAuthorize("hasAuthority('PRODUCT_GET_ALL')")
    public ResponseEntity<?> getAllProducts() {
        try {
            List<Product> products = productService.getAll();
            return ResponseEntity.ok(products);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error al consultar los productos");
        }
    }

    @GetMapping("/get/{id}")
    @PreAuthorize("hasAuthority('PRODUCT_GET_BY_ID')")
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

    @PostMapping(value = "/add", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAuthority('PRODUCT_CREATE')")
    public ResponseEntity<?> addProduct(@RequestPart("product") Product product,
            @RequestParam(value = "image", required = false) MultipartFile image) {
        try {
            Product savedProduct = productService.add(product, image);
            return ResponseEntity.status(HttpStatus.CREATED).body(savedProduct);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Error al agregar el producto: " + e.getMessage());
        }
    }

    @PutMapping(value = "/update/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAuthority('PRODUCT_UPDATE')")
    public ResponseEntity<?> updateProduct(@PathVariable int id, @RequestPart("product") Product product, @RequestParam(value = "image", required = false) MultipartFile image,
            @RequestParam(value = "removeImage", defaultValue = "false") boolean removeImage) {
        try {
            Product updatedProduct = productService.update(id, product, image, removeImage);
            return ResponseEntity.ok(updatedProduct);
        } catch (RuntimeException e) {
            if ("El producto no existe".equals(e.getMessage())) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
            }
            return ResponseEntity.badRequest().body("Error al actualizar el producto: " + e.getMessage());
        }
    }

    /*
     * @PostMapping("/add")
     * 
     * @PreAuthorize("hasAuthority('PRODUCT_CREATE')")
     * public ResponseEntity<?> addProduct(@RequestBody Product product) {
     * try {
     * productService.add(product);
     * return ResponseEntity.status(HttpStatus.CREATED).
     * body("El producto fue agregado exitosamente");
     * } catch (RuntimeException e) {
     * return ResponseEntity.status(HttpStatus.BAD_REQUEST)
     * .body("Error al agregar el producto: " + e.getMessage());
     * }
     * }
     * 
     * 
     * @PutMapping("/update/{id}")
     * 
     * @PreAuthorize("hasAuthority('PRODUCT_UPDATE')")
     * public ResponseEntity<String> updateProduct(@PathVariable int
     * id, @RequestBody Product product) {
     * try {
     * productService.update(id, product);
     * return ResponseEntity.ok("El producto fue actualizado exitosamente");
     * } catch (RuntimeException e) {
     * if ("El producto no existe".equals(e.getMessage())) {
     * return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
     * }
     * return ResponseEntity.status(HttpStatus.BAD_REQUEST)
     * .body("Error al actualizar el producto: " + e.getMessage());
     * }
     * }
     */

    @DeleteMapping("/delete/{id}")
    @PreAuthorize("hasAuthority('PRODUCT_DELETE')")
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
