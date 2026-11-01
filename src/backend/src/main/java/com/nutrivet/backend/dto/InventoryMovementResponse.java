package com.nutrivet.backend.dto;

import java.time.LocalDate;
import com.nutrivet.backend.domain.InventoryMovement;

public record InventoryMovementResponse(int id,String type,int amount,LocalDate movementDate,String reason,int idInvoice,String invoiceNumber,ProductMovementResponse product) {
    public record ProductMovementResponse(int id,String name,String code) {}

    public static InventoryMovementResponse from (InventoryMovement movement,String invoiceNumber) {
        return new InventoryMovementResponse(
            movement.getId(),
            movement.getType(),
            movement.getAmount(),
            movement.getMovementDate(),
            movement.getReason(),
            movement.getIdInvoice() != null ? movement.getIdInvoice() : 0,
            invoiceNumber,
            new ProductMovementResponse(
                movement.getProduct().getId(),
                movement.getProduct().getName(),
                movement.getProduct().getCode()
            )
        );
    }
}