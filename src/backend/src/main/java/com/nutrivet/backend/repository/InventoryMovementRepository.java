package com.nutrivet.backend.repository;

import com.nutrivet.backend.domain.InventoryMovement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface InventoryMovementRepository extends JpaRepository<InventoryMovement, Integer> {
}
