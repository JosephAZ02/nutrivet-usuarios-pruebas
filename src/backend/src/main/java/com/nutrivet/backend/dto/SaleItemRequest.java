package com.nutrivet.backend.dto;

// Para ver qué producto se vende y cuántas unidades en factura.
public record SaleItemRequest(int productId, int quantity) {

}