package com.nutrivet.backend.dto;

import java.time.LocalDateTime;
import java.util.List;

// Factura completa con encabezado y líneas, lista para mostrar, imprimir o descargar.
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
        List<InvoiceLineResponse> items) {
}