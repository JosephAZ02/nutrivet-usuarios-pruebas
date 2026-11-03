package com.nutrivet.backend.dto;

// Datos que envía el frontend para registrar un abono a una cuenta por cobrar.
public record InstallmentRequest(
        int accountId,
        double amount) {
}