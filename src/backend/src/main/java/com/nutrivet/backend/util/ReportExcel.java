
package com.nutrivet.backend.util;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.List;

import org.apache.poi.ss.usermodel.CellStyle;
import org.apache.poi.ss.usermodel.FillPatternType;
import org.apache.poi.ss.usermodel.Font;
import org.apache.poi.ss.usermodel.HorizontalAlignment;
import org.apache.poi.ss.usermodel.IndexedColors;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.VerticalAlignment;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Component;

import com.nutrivet.backend.dto.CategorySalesDto;
import com.nutrivet.backend.dto.MonthlyIncomeDto;
import com.nutrivet.backend.dto.TopProductDto;

@Component
public class ReportExcel {

    public byte[] generateExcelReport(List<MonthlyIncomeDto> monthlyIncome,
            List<CategorySalesDto> categorySales,
            List<TopProductDto> topProducts) throws IOException {

        // Implementacion de la generacion del reporte en Excel

        try (Workbook workbook = new XSSFWorkbook()) {

            // estilo de los encabezados

            CellStyle headerStyle = workbook.createCellStyle();
            Font headerFont = workbook.createFont();
            // estilos de la letra del encabezado
            headerFont.setBold(true);
            headerFont.setColor(IndexedColors.WHITE.getIndex());
            headerFont.setFontHeightInPoints((short) 11);

            // estilos del encabezado
            headerStyle.setFont(headerFont);
            headerStyle.setFillForegroundColor(IndexedColors.DARK_TEAL.getIndex());
            headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            headerStyle.setAlignment(HorizontalAlignment.CENTER);
            headerStyle.setVerticalAlignment(VerticalAlignment.CENTER);

            // estilos para las celdas normales
            CellStyle normalStyle = workbook.createCellStyle();
            normalStyle.setAlignment(HorizontalAlignment.CENTER);
            normalStyle.setVerticalAlignment(VerticalAlignment.CENTER);

            // estilos para las filas alternas
            CellStyle alternateStyle = workbook.createCellStyle();
            alternateStyle.setFillForegroundColor(
                    IndexedColors.PALE_BLUE.getIndex());
            alternateStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);

            Sheet incomeSheet = workbook.createSheet("Ingresos Mensuales");

            Row incomeHeader = incomeSheet.createRow(0);
            createCell(incomeHeader, 0, "Mes", headerStyle);
            createCell(incomeHeader, 1, "Ingresos", headerStyle);

            String[] months = {
                    "Enero", "Febrero", "Marzo", "Abril",
                    "Mayo", "Junio", "Julio", "Agosto",
                    "Septiembre", "Octubre", "Noviembre", "Diciembre"
            };

            int rowIndex = 1;

            for (MonthlyIncomeDto item : monthlyIncome) {

                Row row = incomeSheet.createRow(rowIndex++);

                row.createCell(0).setCellValue(months[item.getMonth() - 1]);

                row.createCell(1).setCellValue(item.getTotal());

                CellStyle style = row.getRowNum() % 2 == 0
                        ? alternateStyle
                        : normalStyle;

                row.getCell(0).setCellStyle(style);
                row.getCell(1).setCellStyle(style);
            }
            incomeSheet.autoSizeColumn(0);
            incomeSheet.autoSizeColumn(1);

            Sheet categorySheet = workbook.createSheet("Ventas por Categoría");

            Row categoryHeader = categorySheet.createRow(0);
            createCell(categoryHeader, 0, "Categoría", headerStyle);
            createCell(categoryHeader, 1, "Ventas", headerStyle);

            rowIndex = 1;

            for (CategorySalesDto item : categorySales) {
                Row row = categorySheet.createRow(rowIndex++);
                row.createCell(0).setCellValue(item.category());
                row.createCell(1).setCellValue(item.total());
                // Elegir el estilo segun la fila
                CellStyle style = row.getRowNum() % 2 == 0
                        ? alternateStyle
                        : normalStyle;

                row.getCell(0).setCellStyle(style);
                row.getCell(1).setCellStyle(style);
            }

            // ajustar el contenido
            categorySheet.autoSizeColumn(0);
            categorySheet.autoSizeColumn(1);

            Sheet topProductsSheet = workbook.createSheet("Productos Más Vendidos");

            Row topProductsHeader = topProductsSheet.createRow(0);
            createCell(topProductsHeader, 0, "Producto", headerStyle);
            createCell(topProductsHeader, 1, "Cantidad Vendida", headerStyle);

            rowIndex = 1;

            for (TopProductDto item : topProducts) {
                Row row = topProductsSheet.createRow(rowIndex++);
                row.createCell(0).setCellValue(item.product());
                row.createCell(1).setCellValue(item.quantity());
                // Elegir el estilo según el número de fila
                CellStyle style = row.getRowNum() % 2 == 0
                        ? alternateStyle
                        : normalStyle;

                row.getCell(0).setCellStyle(style);
                row.getCell(1).setCellStyle(style);
            }

            topProductsSheet.autoSizeColumn(0);
            topProductsSheet.autoSizeColumn(1);

            ByteArrayOutputStream output = new ByteArrayOutputStream();// espacio para el excel
            workbook.write(output);// escribir el excel en el espacio

            return output.toByteArray();

        }

    }

    private void createCell(Row row, int column, String value, CellStyle style) {
        var cell = row.createCell(column);
        cell.setCellValue(value);
        cell.setCellStyle(style);
    }
}
