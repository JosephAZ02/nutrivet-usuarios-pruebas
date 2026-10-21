package com.nutrivet.backend.controller;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.nutrivet.backend.domain.InventoryMovement;
import com.nutrivet.backend.service.InventoryMovementService;

@RestController
@RequestMapping("/api/inventoryMovement")
@CrossOrigin(origins = "*")
public class InventoryMovementController {

    @Autowired
    private InventoryMovementService inventoryMovementService;

    @GetMapping("/all")
    public List<InventoryMovement> getAllInventoryMovements() {
        return inventoryMovementService.getAll();
    }

    @GetMapping("/get/{id}")
    public Optional<InventoryMovement> getInventoryMovementById(@PathVariable Integer id) {
        return inventoryMovementService.getById(id);
    }

    @PostMapping("/add")
    public InventoryMovement addInventoryMovement(@RequestBody InventoryMovement inventoryMovement) {
        return inventoryMovementService.add(inventoryMovement);
    }

    @PutMapping("/update")
    public InventoryMovement updateInventoryMovement(@RequestBody InventoryMovement inventoryMovement) {
        return inventoryMovementService.add(inventoryMovement);
    }

    @DeleteMapping("/delete/{id}")
    public void deleteInventoryMovement(@PathVariable int id) {
        inventoryMovementService.deleteById(id);
    }
}
