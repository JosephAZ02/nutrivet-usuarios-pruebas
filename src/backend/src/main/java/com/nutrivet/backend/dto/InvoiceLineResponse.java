package com.nutrivet.backend.dto;

//Una línea de la factura: qué se vendió, cuántas unidades, a qué precio y cuánto suma.
public record InvoiceLineResponse(
        int productId,
        String productCode,
        String productName,
        int quantity,
        double unitPrice,
        double total) {
}