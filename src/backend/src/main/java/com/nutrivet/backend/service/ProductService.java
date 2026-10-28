
package com.nutrivet.backend.service;

import java.util.List;
import java.util.Optional;
import org.springframework.stereotype.Service;
import com.nutrivet.backend.domain.Product;
import com.nutrivet.backend.domain.ProductCategory;
import com.nutrivet.backend.repository.ProductRepository;
import com.nutrivet.backend.repository.ProductCategoryRepository;

@Service
public class ProductService {

    private final ProductRepository productRepository;
    private final ProductCategoryRepository productCategoryRepository;

    public ProductService(ProductRepository productRepository, ProductCategoryRepository productCategoryRepository) {
        this.productRepository = productRepository;
        this.productCategoryRepository = productCategoryRepository;
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

    public Product add(Product product) {
        validateProduct(product);
        if (product.getProductAmount() < 0) {
            throw new RuntimeException("La cantidad no puede ser negativa");
        }
        String code = product.getCode().trim();

        if (productRepository.existsByCodeIgnoreCase(code)) {
            throw new RuntimeException("Ya existe un producto con ese código");
        }

        product.setCode(code);
        product.setName(product.getName().trim());

        return productRepository.save(product);
    }

    public Product update(Integer id, Product updatedProduct) {

        validateProduct(updatedProduct);

        Product existingProduct = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("El producto no existe"));
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
        existingProduct.setPhoto(updatedProduct.getPhoto());

        return productRepository.save(existingProduct);
    }

      //igual que getById, pero bloquea la fila hasta que termine la venta
    public Optional<Product> getByIdWithLock(Integer id) {
        return productRepository.findWithLockById(id);
    }

    //buscador de la factura. Primero por código de barras, y si no hay, por nombre
    public List<Product> searchByCodeOrName(String text) {
        List<Product> byCode = productRepository.findByCode(text);
        if (!byCode.isEmpty()) {
            return byCode;
        }
        return productRepository.findByNameContainingIgnoreCase(text);
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
        return productRepository.findByActiveTrue().stream().filter(product -> product.getProductAmount() <= 5).toList();
    }

    public List<Product> getLowStockProducts() {
        return productRepository.findByActiveTrue().stream().filter(product -> product.getProductAmount() > 5 && product.getProductAmount() < 20).toList();
    }

}
