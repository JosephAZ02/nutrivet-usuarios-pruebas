package com.nutrivet.backend.controller;

import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.nutrivet.backend.domain.InventoryMovement;
import com.nutrivet.backend.service.InventoryMovementService;

@RestController
@RequestMapping("/api/inventoryMovement")
@CrossOrigin(origins = "*")
public class InventoryMovementController {

    private final InventoryMovementService inventoryMovementService;

    public InventoryMovementController(InventoryMovementService inventoryMovementService) {
        this.inventoryMovementService = inventoryMovementService;
    }

    // endpoint de consultar movimientos de un producto en especifico

    @GetMapping("/product/{productId}")
    public ResponseEntity<?> getMovementsByProduct(@PathVariable Integer productId) {
        try {
            return ResponseEntity.ok(inventoryMovementService.getMovementsByProduct(productId));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }

    @GetMapping("/all")
    public ResponseEntity<List<InventoryMovement>> getAllInventoryMovements() {
        return ResponseEntity.ok(inventoryMovementService.getAll());
    }

    @GetMapping("/get/{id}")
    public ResponseEntity<?> getInventoryMovementById(@PathVariable Integer id) {
        return inventoryMovementService.getById(id).<ResponseEntity<?>>map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).body("No se encontró el movimiento de inventario"));
    }

    @PostMapping("/add")
    public ResponseEntity<?> addInventoryMovement(@RequestBody InventoryMovement inventoryMovement) {
        try {
            InventoryMovement savedMovement = inventoryMovementService.add(inventoryMovement);
            return ResponseEntity.status(HttpStatus.CREATED).body(savedMovement);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    /*
     * @DeleteMapping("/delete/{id}")
     * public ResponseEntity<?> deleteInventoryMovement(@PathVariable Integer id) {
     * try {
     * inventoryMovementService.deleteById(id);
     * return ResponseEntity.noContent().build();
     * } catch (RuntimeException e) {
     * return ResponseEntity.badRequest().body("No se pudo eliminar el movimiento");
     * }
     * }
     */
}
