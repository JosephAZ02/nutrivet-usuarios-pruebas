package com.nutrivet.backend.repository;

import com.nutrivet.backend.domain.InventoryMovement;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface InventoryMovementRepository extends JpaRepository<InventoryMovement, Integer> {
    
    List<InventoryMovement> findByProduct_IdOrderByMovementDateDesc(int productId);

}
