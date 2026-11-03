package com.nutrivet.backend.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

// Factura completa con encabezado y líneas, lista para mostrar, imprimir o descargar.
// Los últimos cinco datos solo tienen valor cuando la factura es a crédito;
// en las demás facturas vienen en null (o en 0).
// En una factura a crédito, amountReceived es el abono inicial.
public record InvoiceResponse(
        int id,
        String number,
        LocalDateTime date,
        double subtotal,
        double tax,
        double total,
        String paymentMethod,
        double amountReceived,
        double change,
        boolean credit,
        List<InvoiceLineResponse> items,
        String clientId,
        String clientName,
        double balance,
        double monthlyInstallment,
        LocalDate dueDate) {
}