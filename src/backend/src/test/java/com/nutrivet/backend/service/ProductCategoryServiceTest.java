package com.nutrivet.backend.service;

import com.nutrivet.backend.domain.ProductCategory;
import com.nutrivet.backend.repository.ProductCategoryRepository;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;

import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ProductCategoryServiceTest {

    @Mock
    private ProductCategoryRepository productCategoryRepository;

    @InjectMocks
    private ProductCategoryService productCategoryService;

    private ProductCategory category;

    @BeforeEach
    void setUp() {
        category = new ProductCategory();
        category.setId(1);
        category.setName("Concentrados");
        category.setActive(true);
    }

    // consultas

    @Test
    void getActiveCategories_devuelveCategoriasActivas() {
        when(productCategoryRepository.findByActiveTrue())
                .thenReturn(List.of(category));

        List<ProductCategory> result =
                productCategoryService.getActiveCategories();

        assertEquals(1, result.size());
        assertEquals("Concentrados", result.get(0).getName());

        verify(productCategoryRepository).findByActiveTrue();
    }

    @Test
    void getAll_devuelveTodasLasCategorias() {
        ProductCategory inactive = new ProductCategory();
        inactive.setId(2);
        inactive.setName("Medicamentos");
        inactive.setActive(false);

        when(productCategoryRepository.findAll())
                .thenReturn(List.of(category, inactive));

        List<ProductCategory> result = productCategoryService.getAll();

        assertEquals(2, result.size());
        verify(productCategoryRepository).findAll();
    }

    @Test
    void getById_categoriaExistente_devuelveCategoria() {
        when(productCategoryRepository.findById(1))
                .thenReturn(Optional.of(category));

        Optional<ProductCategory> result =
                productCategoryService.getById(1);

        assertTrue(result.isPresent());
        assertEquals("Concentrados", result.get().getName());
    }

    @Test
    void getById_categoriaInexistente_devuelveVacio() {
        when(productCategoryRepository.findById(99))
                .thenReturn(Optional.empty());

        Optional<ProductCategory> result =
                productCategoryService.getById(99);

        assertTrue(result.isEmpty());
    }

    // agergar categorías

    @Test
    void add_categoriaValida_guardaCategoria() {
        when(productCategoryRepository.existsByNameIgnoreCase("Concentrados"))
                .thenReturn(false);

        when(productCategoryRepository.save(any(ProductCategory.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        ProductCategory result =
                productCategoryService.add(category);

        assertEquals("Concentrados", result.getName());
        assertTrue(result.isActive());

        verify(productCategoryRepository).save(category);
    }

    @Test
    void add_nombreVacio_lanzaExcepcion() {
        category.setName("   ");

        RuntimeException exception = assertThrows(
                RuntimeException.class,
                () -> productCategoryService.add(category)
        );

        assertEquals(
                "El nombre de la categoría es obligatorio",
                exception.getMessage()
        );

        verify(productCategoryRepository, never())
                .save(any(ProductCategory.class));
    }

    @Test
    void add_nombreNulo_lanzaExcepcion() {
        category.setName(null);

        assertThrows(
                RuntimeException.class,
                () -> productCategoryService.add(category)
        );

        verify(productCategoryRepository, never())
                .save(any(ProductCategory.class));
    }

    @Test
    void add_nombreMayorA100Caracteres_lanzaExcepcion() {
        category.setName("A".repeat(101));

        RuntimeException exception = assertThrows(
                RuntimeException.class,
                () -> productCategoryService.add(category)
        );

        assertEquals(
                "El nombre no puede superar los 100 caracteres",
                exception.getMessage()
        );

        verify(productCategoryRepository, never())
                .save(any(ProductCategory.class));
    }

    @Test
    void add_nombreDuplicado_lanzaExcepcion() {
        when(productCategoryRepository.existsByNameIgnoreCase("Concentrados"))
                .thenReturn(true);

        RuntimeException exception = assertThrows(
                RuntimeException.class,
                () -> productCategoryService.add(category)
        );

        assertEquals(
                "Ya existe una categoría con ese nombre",
                exception.getMessage()
        );

        verify(productCategoryRepository, never())
                .save(any(ProductCategory.class));
    }

    // actualizar categorías

    @Test
    void update_categoriaValida_actualizaNombre() {
        ProductCategory updatedCategory = new ProductCategory();
        updatedCategory.setName("Alimentos");

        when(productCategoryRepository.findById(1))
                .thenReturn(Optional.of(category));

        when(productCategoryRepository.existsByNameIgnoreCaseAndIdNot(
                "Alimentos", 1))
                .thenReturn(false);

        when(productCategoryRepository.save(any(ProductCategory.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        ProductCategory result =
                productCategoryService.update(1, updatedCategory);

        assertEquals("Alimentos", result.getName());
        assertEquals(1, result.getId());

        verify(productCategoryRepository).save(category);
    }

    @Test
    void update_categoriaInexistente_lanzaExcepcion() {
        ProductCategory updatedCategory = new ProductCategory();
        updatedCategory.setName("Alimentos");

        when(productCategoryRepository.findById(99))
                .thenReturn(Optional.empty());

        RuntimeException exception = assertThrows(
                RuntimeException.class,
                () -> productCategoryService.update(99, updatedCategory)
        );

        assertEquals("La categoría no existe", exception.getMessage());

        verify(productCategoryRepository, never())
                .save(any(ProductCategory.class));
    }

    @Test
    void update_nombreDuplicado_lanzaExcepcion() {
        ProductCategory updatedCategory = new ProductCategory();
        updatedCategory.setName("Medicamentos");

        when(productCategoryRepository.findById(1))
                .thenReturn(Optional.of(category));

        when(productCategoryRepository.existsByNameIgnoreCaseAndIdNot(
                "Medicamentos", 1))
                .thenReturn(true);

        RuntimeException exception = assertThrows(
                RuntimeException.class,
                () -> productCategoryService.update(1, updatedCategory)
        );

        assertEquals(
                "Ya existe otra categoría con ese nombre",
                exception.getMessage()
        );

        verify(productCategoryRepository, never())
                .save(any(ProductCategory.class));
    }

    @Test
    void update_nombreVacio_lanzaExcepcion() {
        ProductCategory updatedCategory = new ProductCategory();
        updatedCategory.setName("");

        assertThrows(
                RuntimeException.class,
                () -> productCategoryService.update(1, updatedCategory)
        );

        verify(productCategoryRepository, never())
                .findById(anyInt());
    }

    // desactivar categorías

    @Test
    void deactivate_categoriaExistente_desactivaCategoria() {
        when(productCategoryRepository.findById(1))
                .thenReturn(Optional.of(category));

        when(productCategoryRepository.save(any(ProductCategory.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        productCategoryService.deactivate(1);

        assertFalse(category.isActive());

        verify(productCategoryRepository).save(category);
    }

    @Test
    void deactivate_categoriaInexistente_lanzaExcepcion() {
        when(productCategoryRepository.findById(99))
                .thenReturn(Optional.empty());

        RuntimeException exception = assertThrows(
                RuntimeException.class,
                () -> productCategoryService.deactivate(99)
        );

        assertEquals("La categoría no existe", exception.getMessage());

        verify(productCategoryRepository, never())
                .save(any(ProductCategory.class));
    }
}
