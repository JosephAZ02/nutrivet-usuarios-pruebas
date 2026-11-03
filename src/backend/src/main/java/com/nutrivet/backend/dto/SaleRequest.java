package com.nutrivet.backend.dto;

import java.time.LocalDate;
import java.util.List;


public record SaleRequest(
        String paymentMethod,
        Double amountReceived,
        List<SaleItemRequest> items,
        String clientId,
        Double initialPayment,
        Double monthlyInstallment,
        LocalDate dueDate) {

    // Constructor corto para las ventas que no son a crédito
    public SaleRequest(String paymentMethod, Double amountReceived, List<SaleItemRequest> items) {
        this(paymentMethod, amountReceived, items, null, null, null, null);
    }
}