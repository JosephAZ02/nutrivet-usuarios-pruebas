package com.nutrivet.backend.dto;

import java.time.LocalDate;

// Cuenta por cobrar lista para mostrar en pantalla.
public record ReceivableAccountResponse(
        int id,
        int invoiceId,
        String invoiceNumber,
        String clientId,
        String clientName,
        double totalAmount,
        double paidAmount, 
        double balance, 
        double monthlyInstallment,
        LocalDate dueDate,
        String status) { 
}