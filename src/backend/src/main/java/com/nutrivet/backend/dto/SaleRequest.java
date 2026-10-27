package com.nutrivet.backend.dto;

import java.util.List;


//Venta a registrar por paymentMethod: "EFECTIVO" o "TARJETA".
//amountReceived solo se usa cuando el pago es en efectivo para calcular el vuelto.
public record SaleRequest(String paymentMethod, Double amountReceived, List<SaleItemRequest> items) {
}