package com.nutrivet.backend.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.nutrivet.backend.domain.InventoryMovement;
import com.nutrivet.backend.repository.InventoryMovementRepository;

@Service
public class InventoryMovementService {

    @Autowired
    private InventoryMovementRepository inventoryMovementRepository;

    public List<InventoryMovement> getAll() {
        return inventoryMovementRepository.findAll();
    }

    public Optional<InventoryMovement> getById(Integer id) {
        return inventoryMovementRepository.findById(id);
    }

    public InventoryMovement add(InventoryMovement inventoryMovement) {
        return inventoryMovementRepository.save(inventoryMovement);
    }

    public void deleteById(Integer id) {
        inventoryMovementRepository.deleteById(id);
    }
}
