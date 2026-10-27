
package com.nutrivet.backend.util;

import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.text.DecimalFormat;
import java.text.DecimalFormatSymbols;
import java.text.NumberFormat;
import java.time.LocalDate;
import java.util.List;
import java.util.Locale;

import org.springframework.stereotype.Component;

import com.nutrivet.backend.dto.MonthlyIncomeDto;
import com.nutrivet.backend.dto.CategorySalesDto;
import com.nutrivet.backend.dto.TopProductDto;
import com.openhtmltopdf.pdfboxout.PdfRendererBuilder;

@Component
public class ReportPdf {

    public byte[] generatePdf(

            List<MonthlyIncomeDto> monthlyIncome,
            List<CategorySalesDto> categorySales,
            List<TopProductDto> topProducts) throws Exception {

        // Leer la plantilla HTML
        String html;

        try (InputStream input = getClass().getResourceAsStream(
                "/templates/reporte-nutrivet.html")) {

            html = new String(
                    input.readAllBytes(),
                    StandardCharsets.UTF_8);
        }
        // configurar el formato de moneda para Costa Rica
        DecimalFormatSymbols symbols = new DecimalFormatSymbols(Locale.forLanguageTag("es-CR"));
        symbols.setGroupingSeparator('.');
        symbols.setDecimalSeparator(',');

        DecimalFormat numberFormat = new DecimalFormat("#,##0", symbols);

        // Construir filas de ingresos mensuales
        StringBuilder monthlyRows = new StringBuilder();

        String[] months = {
                "Enero", "Febrero", "Marzo", "Abril",
                "Mayo", "Junio", "Julio", "Agosto",
                "Septiembre", "Octubre", "Noviembre", "Diciembre"
        };

        for (MonthlyIncomeDto item : monthlyIncome) {
            monthlyRows.append("<tr><td>")
                    .append(months[item.getMonth() - 1])
                    .append("</td><td>")
                    .append(numberFormat.format(item.getTotal()))
                    .append("</td></tr>");
        }

        // Construir filas de ventas por categoria
        StringBuilder categoryRows = new StringBuilder();

        for (CategorySalesDto item : categorySales) {
            categoryRows.append("<tr><td>")
                    .append(item.category())
                    .append("</td><td>")
                    .append(numberFormat.format(item.total()))
                    .append("</td></tr>");
        }

        // Construir filas de productos mas vendidos
        StringBuilder productRows = new StringBuilder();

        for (TopProductDto item : topProducts) {
            productRows.append("<tr><td>")
                    .append(item.product())
                    .append("</td><td>")
                    .append(item.quantity())
                    .append("</td></tr>");
        }

        // Reemplazar las variables de la plantilla
        html = html.replace("${year}", String.valueOf(LocalDate.now().getYear()));
        html = html.replace("${monthlyRows}", monthlyRows.toString());
        html = html.replace("${categoryRows}", categoryRows.toString());
        html = html.replace("${productRows}", productRows.toString());

        // Convertir el HTML a PDF
        ByteArrayOutputStream output = new ByteArrayOutputStream();

        PdfRendererBuilder builder = new PdfRendererBuilder();
        builder.withHtmlContent(html, null);
        builder.toStream(output);
        builder.run();

        return output.toByteArray();
    }

}
