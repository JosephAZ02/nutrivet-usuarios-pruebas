package com.nutrivet.backend.service;

import java.util.List;
import java.util.Optional;
import org.springframework.stereotype.Service;
import com.nutrivet.backend.domain.Product;
import com.nutrivet.backend.domain.ProductCategory;
import com.nutrivet.backend.repository.ProductRepository;
import com.nutrivet.backend.repository.ProductCategoryRepository;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ProductService {

    private final ProductRepository productRepository;
    private final ProductCategoryRepository productCategoryRepository;
    private final ProductImageService productImageService;

    public ProductService(ProductRepository productRepository, ProductCategoryRepository productCategoryRepository,
            ProductImageService productImageService) {
        this.productRepository = productRepository;
        this.productCategoryRepository = productCategoryRepository;
        this.productImageService = productImageService;
    }

    private void validateProduct(Product product) {

        if (product == null) {
            throw new RuntimeException("Los datos del producto son obligatorios");
        }

        if (product.getCode() == null || product.getCode().trim().isEmpty()) {
            throw new RuntimeException("El código del producto es obligatorio");
        }

        if (product.getName() == null || product.getName().trim().isEmpty()) {
            throw new RuntimeException("El nombre del producto es obligatorio");
        }

        if (product.getUnitPrice() < 0) {
            throw new RuntimeException("El precio de venta no puede ser negativo");
        }
        if (product.getProductAmount() < 0) {
            throw new RuntimeException("La cantidad no puede ser negativa");
        }

        if (product.getProductCost() < 0) {
            throw new RuntimeException("El costo del producto no puede ser negativo");
        }

        if (product.getTransportCost() < 0) {
            throw new RuntimeException("El costo de transporte no puede ser negativo");
        }

        if (product.getCategory() == null || product.getCategory().getId() <= 0) {
            throw new RuntimeException("Debe seleccionar una categoría");
        }

        ProductCategory category = productCategoryRepository.findById(product.getCategory().getId())
                .orElseThrow(() -> new RuntimeException("La categoría no existe"));

        if (!category.isActive()) {
            throw new RuntimeException("La categoría está desactivada");
        }

        product.setCategory(category);
    }

    public List<Product> getAll() {
        return productRepository.findByActiveTrue();
    }

    public Optional<Product> getById(Integer id) {
        return productRepository.findById(id).filter(Product::isActive);
    }

    // igual que getById, pero devuelve el producto aunque esté desactivado.
    // Lo usa la factura para mostrar productos que ya se vendieron y luego se
    // desactivaron.
    public Optional<Product> getByIdWithAnyState(Integer id) {
        return productRepository.findById(id);
    }

    /*
     * public Product add(Product product) {
     * validateProduct(product);
     * if (product.getProductAmount() < 0) {
     * throw new RuntimeException("La cantidad no puede ser negativa");
     * }
     * String code = product.getCode().trim();
     * 
     * if (productRepository.existsByCodeIgnoreCase(code)) {
     * throw new RuntimeException("Ya existe un producto con ese código");
     * }
     * 
     * product.setCode(code);
     * product.setName(product.getName().trim());
     * 
     * return productRepository.save(product);
     * }
     * 
     * public Product update(Integer id, Product updatedProduct) {
     * 
     * validateProduct(updatedProduct);
     * 
     * Product existingProduct = productRepository.findById(id)
     * .orElseThrow(() -> new RuntimeException("El producto no existe"));
     * if (!existingProduct.isActive()) {
     * throw new RuntimeException("No se puede actualizar un producto desactivado");
     * }
     * String code = updatedProduct.getCode().trim();
     * 
     * if (productRepository.existsByCodeIgnoreCaseAndIdNot(code, id)) {
     * throw new RuntimeException("Ya existe otro producto con ese código");
     * }
     * 
     * existingProduct.setCode(code);
     * existingProduct.setName(updatedProduct.getName().trim());
     * existingProduct.setCategory(updatedProduct.getCategory());
     * existingProduct.setUnitPrice(updatedProduct.getUnitPrice());
     * existingProduct.setProductCost(updatedProduct.getProductCost());
     * existingProduct.setTransportCost(updatedProduct.getTransportCost());
     * existingProduct.setBulkSale(updatedProduct.isBulkSale());
     * existingProduct.setPhoto(updatedProduct.getPhoto());
     * 
     * return productRepository.save(existingProduct);
     * }
     */
    public Product add(Product product) {
        return add(product, null);
    }

    @Transactional
    public Product add(Product product, MultipartFile image) {

        validateProduct(product);

        String code = product.getCode().trim();

        if (productRepository.existsByCodeIgnoreCase(code)) {
            throw new RuntimeException("Ya existe un producto con ese código");
        }

        product.setCode(code);
        product.setName(product.getName().trim());
        product.setPhoto(null);
        String savedImagePath = null;

        try {
            if (image != null && !image.isEmpty()) {
                savedImagePath = productImageService.saveImage(image);
                product.setPhoto(savedImagePath);
            }

            return productRepository.save(product);
        } catch (RuntimeException e) {
            if (savedImagePath != null) {
                try {
                    productImageService.deleteImage(savedImagePath);
                } catch (RuntimeException cleanupError) {
                    e.addSuppressed(cleanupError);
                }
            }
            throw e;
        }
    }

    public Product update(Integer id, Product updatedProduct) {
        return update(id, updatedProduct, null, false);
    }

    @Transactional
    public Product update(Integer id, Product updatedProduct, MultipartFile image, boolean removeImage) {
        if (image != null && !image.isEmpty() && removeImage) {
            throw new RuntimeException("No se puede reemplazar y quitar la imagen al mismo tiempo");
        }

        validateProduct(updatedProduct);

        Product existingProduct = productRepository.findById(id).orElseThrow(() -> new RuntimeException("El producto no existe"));

        if (!existingProduct.isActive()) {
            throw new RuntimeException("No se puede actualizar un producto desactivado");
        }

        String code = updatedProduct.getCode().trim();

        if (productRepository.existsByCodeIgnoreCaseAndIdNot(code, id)) {
            throw new RuntimeException("Ya existe otro producto con ese código");
        }

        existingProduct.setCode(code);
        existingProduct.setName(updatedProduct.getName().trim());
        existingProduct.setCategory(updatedProduct.getCategory());
        existingProduct.setUnitPrice(updatedProduct.getUnitPrice());
        existingProduct.setProductCost(updatedProduct.getProductCost());
        existingProduct.setTransportCost(updatedProduct.getTransportCost());
        existingProduct.setBulkSale(updatedProduct.isBulkSale());

        String oldImagePath = existingProduct.getPhoto();
        String newImagePath = null;

        if (removeImage) {
            existingProduct.setPhoto(null);

        } else if (image != null && !image.isEmpty()) {
            newImagePath = productImageService.saveImage(image);
            existingProduct.setPhoto(newImagePath);
        }

        try {
            Product savedProduct = productRepository.save(existingProduct);
            if ((removeImage || newImagePath != null) && oldImagePath != null && !oldImagePath.equals(newImagePath)) {
                try {
                    productImageService.deleteImage(oldImagePath);
                } catch (RuntimeException cleanupError) {
                    
                }
            }
            return savedProduct;
        } catch (RuntimeException e) {
            // si falla guardar, limpiar la imagen nueva sin tocar la anterior
            if (newImagePath != null) {
                try {
                    productImageService.deleteImage(newImagePath);
                } catch (RuntimeException cleanupError) {
                    e.addSuppressed(cleanupError);
                }
            }
            throw e;
        }
    }

    // igual que getById, pero bloquea la fila hasta que termine la venta
    public Optional<Product> getByIdWithLock(Integer id) {
        return productRepository.findWithLockById(id);
    }

    public void deleteById(Integer id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("El producto no existe"));

        if (!product.isActive()) {
            throw new RuntimeException("El producto ya está desactivado");
        }

        product.setActive(false);
        productRepository.save(product);
    }

    // buscadores
    public List<Product> searchByName(String name) {
        if (name == null || name.trim().isEmpty()) {
            throw new RuntimeException("Debe ingresar un nombre para buscar");
        }
        return productRepository.findByNameContainingIgnoreCaseAndActiveTrue(name.trim());
    }

    public Optional<Product> searchByCode(String code) {
        if (code == null || code.trim().isEmpty()) {
            throw new RuntimeException("Debe ingresar un código para buscar");
        }
        return productRepository.findByCodeIgnoreCaseAndActiveTrue(code.trim());
    }

    // stock
    public String getStockStatus(int productAmount) {
        if (productAmount < 0) {
            throw new RuntimeException("La cantidad de existencias no puede ser negativa");
        }
        if (productAmount <= 5) {
            return "Crítico";
        }
        if (productAmount <= 19) {
            return "Bajo";
        }
        return "Bueno";
    }

    public List<Product> getCriticalStockProducts() {
        return productRepository.findByActiveTrue().stream().filter(product -> product.getProductAmount() <= 5)
                .toList();
    }

    public List<Product> getLowStockProducts() {
        return productRepository.findByActiveTrue().stream()
                .filter(product -> product.getProductAmount() > 5 && product.getProductAmount() < 20).toList();
    }

}