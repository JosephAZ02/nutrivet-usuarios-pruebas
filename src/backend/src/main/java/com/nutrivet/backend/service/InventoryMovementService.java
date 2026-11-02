package com.nutrivet.backend.service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.nutrivet.backend.domain.InventoryMovement;
import com.nutrivet.backend.domain.Product;
import com.nutrivet.backend.repository.InventoryMovementRepository;
import com.nutrivet.backend.repository.ProductRepository;
import com.nutrivet.backend.repository.InvoiceRepository;
import com.nutrivet.backend.dto.InventoryMovementResponse;

@Service
public class InventoryMovementService {

    private final InventoryMovementRepository inventoryMovementRepository;
    private final ProductRepository productRepository;
    private final InvoiceRepository invoiceRepository;

    public InventoryMovementService(InventoryMovementRepository inventoryMovementRepository,
            ProductRepository productRepository, InvoiceRepository invoiceRepository) {
        this.inventoryMovementRepository = inventoryMovementRepository;
        this.productRepository = productRepository;
        this.invoiceRepository = invoiceRepository;
    }

    public List<InventoryMovementResponse> getAll() {
        return inventoryMovementRepository.findAll().stream().map(movement -> {
            String invoiceNumber = null;

            if (movement.getIdInvoice() != null) {
                invoiceNumber = invoiceRepository.findById(movement.getIdInvoice()).map(invoice -> invoice.getNumber()).orElse(null);
            }
            System.out.println("ID factura: " + movement.getIdInvoice()
        + " | Número factura: " + invoiceNumber);

            return InventoryMovementResponse.from(movement,invoiceNumber);
        }).toList();
    }

    public Optional<InventoryMovement> getById(Integer id) {
        return inventoryMovementRepository.findById(id);
    }

    @Transactional
    public InventoryMovement add(InventoryMovement inventoryMovement) {

        if (inventoryMovement == null) {
            throw new RuntimeException("El movimiento no puede estar vacío");
        }
        String type = inventoryMovement.getType();
        if (type != null) {
            type = type.trim();
        }

        if (type == null || (!type.equalsIgnoreCase("ENTRADA") && !type.equalsIgnoreCase("SALIDA"))) {
            throw new RuntimeException("El tipo de movimiento debe ser entrada o salida");
        }

        inventoryMovement.setType(type.toUpperCase());

        if (inventoryMovement.getAmount() <= 0) {
            throw new RuntimeException("La cantidad debe ser mayor que cero");
        }

        if (inventoryMovement.getReason() == null || inventoryMovement.getReason().trim().isEmpty()) {
            throw new RuntimeException("Debe indicar el motivo del movimiento");
        }
        inventoryMovement.setReason(inventoryMovement.getReason().trim());

        if (inventoryMovement.getProduct() == null || inventoryMovement.getProduct().getId() <= 0) {
            throw new RuntimeException("Debe indicar un producto válido");
        }

        Product product = productRepository.findById(inventoryMovement.getProduct().getId())
                .orElseThrow(() -> new RuntimeException("El producto no existe"));

        if (!product.isActive()) {
            throw new RuntimeException("No se pueden registrar movimientos de un producto desactivado");
        }

        if (product.getProductAmount() < 0) {
            throw new RuntimeException("El producto tiene existencias inválidas en el inventario");
        }

        int amount = inventoryMovement.getAmount();
        // actualizar existencias
        if (inventoryMovement.getType().equals("ENTRADA")) {
            try {
                product.setProductAmount(Math.addExact(product.getProductAmount(), amount)); // validacion para que lo
                                                                                             // que ingrese no se
                                                                                             // desborde el limite de un
                                                                                             // entero
            } catch (ArithmeticException e) {
                throw new RuntimeException("La cantidad supera el límite permitido para el inventario");
            }
        } else {
            if (product.getProductAmount() < amount) {
                throw new RuntimeException("No hay existencias suficientes para realizar la salida");
            }

            product.setProductAmount(product.getProductAmount() - amount);
        }

        productRepository.save(product); // guardar el producto actualizado
        inventoryMovement.setMovementDate(LocalDate.now()); // ponerle fecha actual

        inventoryMovement.setProduct(product); // asociar el producto

        return inventoryMovementRepository.save(inventoryMovement); // guardar movimiento
    }

    public List<InventoryMovement> getMovementsByProduct(int productId) {
        if (!productRepository.existsById(productId)) {
            throw new RuntimeException("El producto no existe");
        }
        return inventoryMovementRepository.findByProduct_IdOrderByMovementDateDesc(productId);
    }

    /*
     * public void deleteById(Integer id) {
     * inventoryMovementRepository.deleteById(id);
     * }
     */
}
