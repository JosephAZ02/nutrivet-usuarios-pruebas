package com.nutrivet.backend.service;

import com.nutrivet.backend.domain.InventoryMovement;
import com.nutrivet.backend.domain.Product;
import com.nutrivet.backend.repository.InventoryMovementRepository;
import com.nutrivet.backend.repository.ProductRepository;
import com.nutrivet.backend.repository.InvoiceRepository;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;

import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class InventoryMovementServiceTest {

    @Mock
    private InventoryMovementRepository inventoryMovementRepository;

    @Mock
    private ProductRepository productRepository;

    @Mock
    private InvoiceRepository invoiceRepository;

    @InjectMocks
    private InventoryMovementService inventoryMovementService;

    private Product product;

    @BeforeEach
    void setUp() {
        product = new Product();
        product.setId(1);
        product.setCode("PROD001");
        product.setName("Concentrado para perros");
        product.setProductAmount(20);
        product.setActive(true);
    }

    private InventoryMovement createMovement(String type, int amount) {
        InventoryMovement movement = new InventoryMovement();
        movement.setType(type);
        movement.setAmount(amount);
        movement.setReason("Reposición de inventario");
        movement.setProduct(product);
        return movement;
    }

    // consultas

    @Test
    void getAll_devuelveMovimientos() {
        InventoryMovement movement = createMovement("ENTRADA", 10);
        movement.setId(1);
        movement.setMovementDate(LocalDate.now());

        when(inventoryMovementRepository.findAll())
                .thenReturn(List.of(movement));

        var result = inventoryMovementService.getAll();

        assertEquals(1, result.size());
        assertEquals("ENTRADA", result.get(0).type());
        assertEquals(10, result.get(0).amount());
        assertEquals("Concentrado para perros",
                result.get(0).product().name());
    }

    @Test
    void getAll_movimientoConFacturaBuscaNumeroFactura() {
        InventoryMovement movement = createMovement("SALIDA", 5);
        movement.setId(1);
        movement.setIdInvoice(10);
        movement.setMovementDate(LocalDate.now());

        when(inventoryMovementRepository.findAll())
                .thenReturn(List.of(movement));

        when(invoiceRepository.findById(10))
                .thenReturn(Optional.empty());

        var result = inventoryMovementService.getAll();

        assertEquals(1, result.size());
        assertEquals(10, result.get(0).idInvoice());
        assertNull(result.get(0).invoiceNumber());

        verify(invoiceRepository).findById(10);
    }

    @Test
    void getById_movimientoExistente_devuelveMovimiento() {
        InventoryMovement movement = createMovement("ENTRADA", 5);

        when(inventoryMovementRepository.findById(1))
                .thenReturn(Optional.of(movement));

        Optional<InventoryMovement> result =
                inventoryMovementService.getById(1);

        assertTrue(result.isPresent());
        assertEquals("ENTRADA", result.get().getType());
    }

    // registrar entradas

    @Test
    void add_entradaValida_incrementaExistencias() {
        InventoryMovement movement = createMovement("ENTRADA", 10);

        when(productRepository.findById(1))
                .thenReturn(Optional.of(product));

        when(productRepository.save(any(Product.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        when(inventoryMovementRepository.save(any(InventoryMovement.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        InventoryMovement result =
                inventoryMovementService.add(movement);

        assertEquals(30, product.getProductAmount());
        assertEquals("ENTRADA", result.getType());
        assertEquals("Reposición de inventario", result.getReason());
        assertEquals(LocalDate.now(), result.getMovementDate());

        verify(productRepository).save(product);
        verify(inventoryMovementRepository).save(movement);
    }

    @Test
    void add_entradaConDesbordamiento_lanzaExcepcion() {
        product.setProductAmount(Integer.MAX_VALUE);

        InventoryMovement movement = createMovement("ENTRADA", 1);

        when(productRepository.findById(1))
                .thenReturn(Optional.of(product));

        RuntimeException exception = assertThrows(
                RuntimeException.class,
                () -> inventoryMovementService.add(movement)
        );

        assertEquals(
                "La cantidad supera el límite permitido para el inventario",
                exception.getMessage()
        );

        verify(productRepository, never()).save(any(Product.class));
        verify(inventoryMovementRepository, never())
                .save(any(InventoryMovement.class));
    }

    // registrar salidas

    @Test
    void add_salidaValida_disminuyeExistencias() {
        InventoryMovement movement = createMovement("SALIDA", 5);

        when(productRepository.findById(1))
                .thenReturn(Optional.of(product));

        when(productRepository.save(any(Product.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        when(inventoryMovementRepository.save(any(InventoryMovement.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        InventoryMovement result =
                inventoryMovementService.add(movement);

        assertEquals(15, product.getProductAmount());
        assertEquals("SALIDA", result.getType());

        verify(productRepository).save(product);
        verify(inventoryMovementRepository).save(movement);
    }

    @Test
    void add_salidaSinExistenciasSuficientes_lanzaExcepcion() {
        InventoryMovement movement = createMovement("SALIDA", 25);

        when(productRepository.findById(1))
                .thenReturn(Optional.of(product));

        RuntimeException exception = assertThrows(
                RuntimeException.class,
                () -> inventoryMovementService.add(movement)
        );

        assertEquals(
                "No hay existencias suficientes para realizar la salida",
                exception.getMessage()
        );

        assertEquals(20, product.getProductAmount());

        verify(productRepository, never()).save(any(Product.class));
        verify(inventoryMovementRepository, never())
                .save(any(InventoryMovement.class));
    }

    // validaciones de movimiento

    @Test
    void add_movimientoNulo_lanzaExcepcion() {
        RuntimeException exception = assertThrows(
                RuntimeException.class,
                () -> inventoryMovementService.add(null)
        );

        assertEquals(
                "El movimiento no puede estar vacío",
                exception.getMessage()
        );
    }

    @Test
    void add_tipoInvalido_lanzaExcepcion() {
        InventoryMovement movement = createMovement("AJUSTE", 5);

        RuntimeException exception = assertThrows(
                RuntimeException.class,
                () -> inventoryMovementService.add(movement)
        );

        assertEquals(
                "El tipo de movimiento debe ser entrada o salida",
                exception.getMessage()
        );
    }

    @Test
    void add_tipoConEspaciosYMinusculas_normalizaTipo() {
        InventoryMovement movement = createMovement(" entrada ", 5);

        when(productRepository.findById(1))
                .thenReturn(Optional.of(product));

        when(productRepository.save(any(Product.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        when(inventoryMovementRepository.save(any(InventoryMovement.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        InventoryMovement result =
                inventoryMovementService.add(movement);

        assertEquals("ENTRADA", result.getType());
        assertEquals(25, product.getProductAmount());
    }

    @Test
    void add_cantidadCero_lanzaExcepcion() {
        InventoryMovement movement = createMovement("ENTRADA", 0);

        RuntimeException exception = assertThrows(
                RuntimeException.class,
                () -> inventoryMovementService.add(movement)
        );

        assertEquals(
                "La cantidad debe ser mayor que cero",
                exception.getMessage()
        );
    }

    @Test
    void add_cantidadNegativa_lanzaExcepcion() {
        InventoryMovement movement = createMovement("ENTRADA", -5);

        assertThrows(
                RuntimeException.class,
                () -> inventoryMovementService.add(movement)
        );
    }

    @Test
    void add_motivoVacio_lanzaExcepcion() {
        InventoryMovement movement = createMovement("ENTRADA", 5);
        movement.setReason("   ");

        RuntimeException exception = assertThrows(
                RuntimeException.class,
                () -> inventoryMovementService.add(movement)
        );

        assertEquals(
                "Debe indicar el motivo del movimiento",
                exception.getMessage()
        );
    }

    @Test
    void add_productoNulo_lanzaExcepcion() {
        InventoryMovement movement = createMovement("ENTRADA", 5);
        movement.setProduct(null);

        RuntimeException exception = assertThrows(
                RuntimeException.class,
                () -> inventoryMovementService.add(movement)
        );

        assertEquals(
                "Debe indicar un producto válido",
                exception.getMessage()
        );
    }

    @Test
    void add_productoConIdInvalido_lanzaExcepcion() {
        Product invalidProduct = new Product();
        invalidProduct.setId(0);

        InventoryMovement movement = createMovement("ENTRADA", 5);
        movement.setProduct(invalidProduct);

        RuntimeException exception = assertThrows(
                RuntimeException.class,
                () -> inventoryMovementService.add(movement)
        );

        assertEquals(
                "Debe indicar un producto válido",
                exception.getMessage()
        );
    }

    // validaciones de producto

    @Test
    void add_productoInexistente_lanzaExcepcion() {
        InventoryMovement movement = createMovement("ENTRADA", 5);

        when(productRepository.findById(1))
                .thenReturn(Optional.empty());

        RuntimeException exception = assertThrows(
                RuntimeException.class,
                () -> inventoryMovementService.add(movement)
        );

        assertEquals("El producto no existe", exception.getMessage());
    }

    @Test
    void add_productoDesactivado_lanzaExcepcion() {
        product.setActive(false);

        InventoryMovement movement = createMovement("ENTRADA", 5);

        when(productRepository.findById(1))
                .thenReturn(Optional.of(product));

        RuntimeException exception = assertThrows(
                RuntimeException.class,
                () -> inventoryMovementService.add(movement)
        );

        assertEquals(
                "No se pueden registrar movimientos de un producto desactivado",
                exception.getMessage()
        );
    }

    @Test
    void add_existenciasNegativas_lanzaExcepcion() {
        product.setProductAmount(-1);

        InventoryMovement movement = createMovement("ENTRADA", 5);

        when(productRepository.findById(1))
                .thenReturn(Optional.of(product));

        RuntimeException exception = assertThrows(
                RuntimeException.class,
                () -> inventoryMovementService.add(movement)
        );

        assertEquals(
                "El producto tiene existencias inválidas en el inventario",
                exception.getMessage()
        );
    }

    // movimientos por producto
    @Test
    void getMovementsByProduct_productoExistente_devuelveMovimientos() {
        InventoryMovement movement = createMovement("ENTRADA", 5);

        when(productRepository.existsById(1))
                .thenReturn(true);

        when(inventoryMovementRepository
                .findByProduct_IdOrderByMovementDateDesc(1))
                .thenReturn(List.of(movement));

        List<InventoryMovement> result =
                inventoryMovementService.getMovementsByProduct(1);

        assertEquals(1, result.size());
        assertEquals("ENTRADA", result.get(0).getType());
    }

    @Test
    void getMovementsByProduct_productoInexistente_lanzaExcepcion() {
        when(productRepository.existsById(99))
                .thenReturn(false);

        RuntimeException exception = assertThrows(
                RuntimeException.class,
                () -> inventoryMovementService.getMovementsByProduct(99)
        );

        assertEquals("El producto no existe", exception.getMessage());

        verify(inventoryMovementRepository, never())
                .findByProduct_IdOrderByMovementDateDesc(anyInt());
    }
}
