package com.nutrivet.backend.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.nutrivet.backend.domain.Product;
import com.nutrivet.backend.domain.ProductCategory;
import com.nutrivet.backend.repository.ProductRepository;
import com.nutrivet.backend.repository.ProductCategoryRepository;

@ExtendWith(MockitoExtension.class)
class ProductServiceTest {

    @Mock
    private ProductRepository productRepository;

    @Mock
    private ProductCategoryRepository productCategoryRepository;

    @Mock
    private ProductImageService productImageService;

    @InjectMocks
    private ProductService productService;

    private ProductCategory category;

    @BeforeEach
    void setUp() {
        category = new ProductCategory();
        category.setId(1);
        category.setName("Concentrados");
        category.setActive(true);
    }

    // métodos auxiliares para preparar productos y categorías

    private Product createProduct(int id, String code, String name, int stock) {
        Product product = new Product();
        product.setId(id);
        product.setCode(code);
        product.setName(name);
        product.setUnitPrice(5000);
        product.setProductCost(3000);
        product.setTransportCost(500);
        product.setProductAmount(stock);
        product.setBulkSale(false);
        product.setActive(true);
        product.setCategory(category);
        return product;
    }

    private Product createValidProduct() {
        return createProduct(0, "COD001", "Concentrado para perro", 20);
    }

    private void mockActiveCategory() {
        when(productCategoryRepository.findById(1))
                .thenReturn(Optional.of(category));
    }

    // consultar productos 

    @Test
    void getAll_devuelveProductosActivos() {
        List<Product> products = List.of(
                createProduct(1, "COD001", "Producto A", 10),
                createProduct(2, "COD002", "Producto B", 20));

        when(productRepository.findByActiveTrue()).thenReturn(products);

        List<Product> result = productService.getAll();

        assertEquals(2, result.size());
        verify(productRepository).findByActiveTrue();
    }

    @Test
    void getInactiveProducts_devuelveProductosInactivos() {
        Product inactive = createProduct(1, "COD001", "Producto A", 10);
        inactive.setActive(false);

        when(productRepository.findByActiveFalse())
                .thenReturn(List.of(inactive));

        List<Product> result = productService.getInactiveProducts();

        assertEquals(1, result.size());
        assertFalse(result.get(0).isActive());
    }

    @Test
    void getById_productoActivo_devuelveProducto() {
        Product product = createProduct(1, "COD001", "Producto A", 10);

        when(productRepository.findById(1))
                .thenReturn(Optional.of(product));

        Optional<Product> result = productService.getById(1);

        assertTrue(result.isPresent());
        assertEquals("Producto A", result.get().getName());
    }

    @Test
    void getById_productoInactivo_devuelveVacio() {
        Product product = createProduct(1, "COD001", "Producto A", 10);
        product.setActive(false);

        when(productRepository.findById(1))
                .thenReturn(Optional.of(product));

        Optional<Product> result = productService.getById(1);

        assertTrue(result.isEmpty());
    }

    @Test
    void getByIdWithAnyState_productoInactivo_devuelveProducto() {
        Product product = createProduct(1, "COD001", "Producto A", 10);
        product.setActive(false);

        when(productRepository.findById(1))
                .thenReturn(Optional.of(product));

        Optional<Product> result = productService.getByIdWithAnyState(1);

        assertTrue(result.isPresent());
        assertFalse(result.get().isActive());
    }

    // registrar productos

    @Test
    void add_productoValido_guardaProducto() {
        Product product = createValidProduct();

        mockActiveCategory();

        when(productRepository.existsByCodeIgnoreCase("COD001"))
                .thenReturn(false);

        when(productRepository.save(any(Product.class)))
                .thenAnswer(call -> call.getArgument(0));

        Product result = productService.add(product);

        assertNotNull(result);
        assertEquals("COD001", result.getCode());
        assertEquals("Concentrado para perro", result.getName());
        assertTrue(result.isActive());
        assertEquals(category, result.getCategory());

        verify(productRepository).save(product);
    }

    @Test
    void add_codigoDuplicado_lanzaError() {
        Product product = createValidProduct();

        mockActiveCategory();

        when(productRepository.existsByCodeIgnoreCase("COD001"))
                .thenReturn(true);

        RuntimeException error = assertThrows(
                RuntimeException.class,
                () -> productService.add(product));

        assertEquals("Ya existe un producto con ese código", error.getMessage());

        verify(productRepository, never()).save(any(Product.class));
    }

    @Test
    void add_nombreVacio_lanzaError() {
        Product product = createValidProduct();
        product.setName("   ");

        RuntimeException error = assertThrows(
                RuntimeException.class,
                () -> productService.add(product));

        assertEquals("El nombre del producto es obligatorio", error.getMessage());

        verify(productRepository, never()).save(any(Product.class));
    }

    @Test
    void add_codigoVacio_lanzaError() {
        Product product = createValidProduct();
        product.setCode(" ");

        RuntimeException error = assertThrows(
                RuntimeException.class,
                () -> productService.add(product));

        assertEquals("El código del producto es obligatorio", error.getMessage());
    }

    @Test
    void add_precioNegativo_lanzaError() {
        Product product = createValidProduct();
        product.setUnitPrice(-1);

        RuntimeException error = assertThrows(
                RuntimeException.class,
                () -> productService.add(product));

        assertEquals("El precio de venta no puede ser negativo", error.getMessage());
    }

    @Test
    void add_existenciasNegativas_lanzaError() {
        Product product = createValidProduct();
        product.setProductAmount(-1);

        RuntimeException error = assertThrows(
                RuntimeException.class,
                () -> productService.add(product));

        assertEquals("La cantidad no puede ser negativa", error.getMessage());
    }

    @Test
    void add_categoriaInexistente_lanzaError() {
        Product product = createValidProduct();

        when(productCategoryRepository.findById(1))
                .thenReturn(Optional.empty());

        RuntimeException error = assertThrows(
                RuntimeException.class,
                () -> productService.add(product));

        assertEquals("La categoría no existe", error.getMessage());
    }

    @Test
    void add_categoriaDesactivada_lanzaError() {
        Product product = createValidProduct();

        category.setActive(false);
        mockActiveCategory();

        RuntimeException error = assertThrows(
                RuntimeException.class,
                () -> productService.add(product));

        assertEquals("La categoría está desactivada", error.getMessage());
    }

    @Test
    void add_productoNulo_lanzaError() {
        RuntimeException error = assertThrows(
                RuntimeException.class,
                () -> productService.add((Product) null));

        assertEquals("Los datos del producto son obligatorios", error.getMessage());
    }

    //  actualizar productos 

    @Test
    void update_productoValido_actualizaDatos() {
        Product existing = createProduct(1, "COD001", "Nombre anterior", 20);
        Product updated = createProduct(1, "COD002", "Nombre nuevo", 20);

        mockActiveCategory();

        when(productRepository.findById(1))
                .thenReturn(Optional.of(existing));

        when(productRepository.existsByCodeIgnoreCaseAndIdNot("COD002", 1))
                .thenReturn(false);

        when(productRepository.save(any(Product.class)))
                .thenAnswer(call -> call.getArgument(0));

        Product result = productService.update(1, updated);

        assertEquals("COD002", result.getCode());
        assertEquals("Nombre nuevo", result.getName());

        verify(productRepository).save(existing);
    }

    @Test
    void update_productoInexistente_lanzaError() {
        Product updated = createValidProduct();

        mockActiveCategory();

        when(productRepository.findById(99))
                .thenReturn(Optional.empty());

        RuntimeException error = assertThrows(
                RuntimeException.class,
                () -> productService.update(99, updated));

        assertEquals("El producto no existe", error.getMessage());
    }

    @Test
    void update_codigoDuplicado_lanzaError() {
        Product existing = createProduct(1, "COD001", "Producto A", 10);
        Product updated = createProduct(1, "COD002", "Producto A", 10);

        mockActiveCategory();

        when(productRepository.findById(1))
                .thenReturn(Optional.of(existing));

        when(productRepository.existsByCodeIgnoreCaseAndIdNot("COD002", 1))
                .thenReturn(true);

        RuntimeException error = assertThrows(
                RuntimeException.class,
                () -> productService.update(1, updated));

        assertEquals("Ya existe otro producto con ese código", error.getMessage());

        verify(productRepository, never()).save(any(Product.class));
    }

    @Test
    void update_productoDesactivado_lanzaError() {
        Product existing = createProduct(1, "COD001", "Producto A", 10);
        existing.setActive(false);

        Product updated = createValidProduct();

        mockActiveCategory();

        when(productRepository.findById(1))
                .thenReturn(Optional.of(existing));

        RuntimeException error = assertThrows(
                RuntimeException.class,
                () -> productService.update(1, updated));

        assertEquals("No se puede actualizar un producto desactivado", error.getMessage());
    }

    //  desactivar y reactivar productos 

    @Test
    void deleteById_productoActivo_loDesactiva() {
        Product product = createProduct(1, "COD001", "Producto A", 10);

        when(productRepository.findById(1))
                .thenReturn(Optional.of(product));

        when(productRepository.save(any(Product.class)))
                .thenAnswer(call -> call.getArgument(0));

        productService.deleteById(1);

        assertFalse(product.isActive());
        verify(productRepository).save(product);
    }

    @Test
    void deleteById_productoInexistente_lanzaError() {
        when(productRepository.findById(99))
                .thenReturn(Optional.empty());

        RuntimeException error = assertThrows(
                RuntimeException.class,
                () -> productService.deleteById(99));

        assertEquals("El producto no existe", error.getMessage());
    }

    @Test
    void deleteById_productoYaDesactivado_lanzaError() {
        Product product = createProduct(1, "COD001", "Producto A", 10);
        product.setActive(false);

        when(productRepository.findById(1))
                .thenReturn(Optional.of(product));

        RuntimeException error = assertThrows(
                RuntimeException.class,
                () -> productService.deleteById(1));

        assertEquals("El producto ya está desactivado", error.getMessage());

        verify(productRepository, never()).save(any(Product.class));
    }

    @Test
    void reactivate_productoInactivo_loActiva() {
        Product product = createProduct(1, "COD001", "Producto A", 10);
        product.setActive(false);

        when(productRepository.findById(1))
                .thenReturn(Optional.of(product));

        when(productRepository.save(any(Product.class)))
                .thenAnswer(call -> call.getArgument(0));

        Product result = productService.reactivate(1);

        assertTrue(result.isActive());
        verify(productRepository).save(product);
    }

    @Test
    void reactivate_productoYaActivo_lanzaError() {
        Product product = createProduct(1, "COD001", "Producto A", 10);

        when(productRepository.findById(1))
                .thenReturn(Optional.of(product));

        RuntimeException error = assertThrows(
                RuntimeException.class,
                () -> productService.reactivate(1));

        assertEquals("El producto ya está activo", error.getMessage());
    }

    //  búsquedas 

    @Test
    void searchByName_nombreValido_devuelveProductos() {
        Product product = createProduct(1, "COD001", "Concentrado para perro", 10);

        when(productRepository.findByNameContainingIgnoreCaseAndActiveTrue("Concentrado"))
                .thenReturn(List.of(product));

        List<Product> result = productService.searchByName(" Concentrado ");

        assertEquals(1, result.size());
        assertEquals("Concentrado para perro", result.get(0).getName());
    }

    @Test
    void searchByName_nombreVacio_lanzaError() {
        RuntimeException error = assertThrows(
                RuntimeException.class,
                () -> productService.searchByName("  "));

        assertEquals("Debe ingresar un nombre para buscar", error.getMessage());
    }

    @Test
    void searchByCode_codigoValido_devuelveProducto() {
        Product product = createProduct(1, "COD001", "Producto A", 10);

        when(productRepository.findByCodeIgnoreCaseAndActiveTrue("COD001"))
                .thenReturn(Optional.of(product));

        Optional<Product> result = productService.searchByCode(" COD001 ");

        assertTrue(result.isPresent());
        assertEquals("Producto A", result.get().getName());
    }

    @Test
    void searchByCode_codigoVacio_lanzaError() {
        RuntimeException error = assertThrows(
                RuntimeException.class,
                () -> productService.searchByCode(" "));

        assertEquals("Debe ingresar un código para buscar", error.getMessage());
    }

    //  estado de existencias 

    @Test
    void getStockStatus_cantidadesDevuelvenEstadoCorrecto() {
        assertEquals("Crítico", productService.getStockStatus(0));
        assertEquals("Crítico", productService.getStockStatus(5));
        assertEquals("Bajo", productService.getStockStatus(6));
        assertEquals("Bajo", productService.getStockStatus(19));
        assertEquals("Bueno", productService.getStockStatus(20));
    }

    @Test
    void getStockStatus_cantidadNegativa_lanzaError() {
        RuntimeException error = assertThrows(
                RuntimeException.class,
                () -> productService.getStockStatus(-1));

        assertEquals(
                "La cantidad de existencias no puede ser negativa",
                error.getMessage());
    }

    @Test
    void getCriticalStockProducts_devuelveSoloProductosConStockCritico() {
        List<Product> products = List.of(
                createProduct(1, "COD001", "Producto A", 5),
                createProduct(2, "COD002", "Producto B", 10),
                createProduct(3, "COD003", "Producto C", 0));

        when(productRepository.findByActiveTrue()).thenReturn(products);

        List<Product> result = productService.getCriticalStockProducts();

        assertEquals(2, result.size());
        assertTrue(result.stream().allMatch(p -> p.getProductAmount() <= 5));
    }

    @Test
    void getLowStockProducts_devuelveSoloProductosConStockBajo() {
        List<Product> products = List.of(
                createProduct(1, "COD001", "Producto A", 5),
                createProduct(2, "COD002", "Producto B", 10),
                createProduct(3, "COD003", "Producto C", 19),
                createProduct(4, "COD004", "Producto D", 20));

        when(productRepository.findByActiveTrue()).thenReturn(products);

        List<Product> result = productService.getLowStockProducts();

        assertEquals(2, result.size());
        assertTrue(result.stream().allMatch(
                p -> p.getProductAmount() > 5 && p.getProductAmount() < 20));
    }
}
