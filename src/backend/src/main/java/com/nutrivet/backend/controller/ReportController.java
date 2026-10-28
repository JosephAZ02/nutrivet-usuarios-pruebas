package com.nutrivet.backend.controller;
/*
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.ModelAndView;

 * import com.nutrivet.backend.service.ReportService;
 * 
 * @RestController
 * 
 * @RequestMapping("/api/reports")
 * 
 * @CrossOrigin(origins = "*")
 * public class ReportController {
 * 
 * @Autowired
 * private ReportService reportService;
 * private com.nutrivet.backend.util.ReportPdf reportPdf;
 * private com.nutrivet.backend.util.ReportExcel reportExcel;
 * 
 * public ReportController(com.nutrivet.backend.util.ReportPdf reportPdf) {
 * this.reportPdf = reportPdf;
 * this.reportExcel = new com.nutrivet.backend.util.ReportExcel();
 * }
 * 
 * @GetMapping("/monthlyIncome")
 * public List<com.nutrivet.backend.dto.MonthlyIncomeDto> getMonthlyIncome() {
 * return this.reportService.monthlyIncome();
 * }
 * 
 * @GetMapping("/categorySales")
 * public List<com.nutrivet.backend.dto.CategorySalesDto> getCategorySales() {
 * return this.reportService.categorySales();
 * }
 * 
 * @GetMapping("/topProducts")
 * public List<com.nutrivet.backend.dto.TopProductDto> getTopProducts() {
 * return this.reportService.topProducts();
 * }
 * 
 * @GetMapping("/export/pdf")
 * public ResponseEntity<byte[]> exportPdf() throws Exception {
 * var monthlyIncome = reportService.monthlyIncome();
 * var categorySales = reportService.categorySales();
 * var topProducts = reportService.topProducts();
 * 
 * // Generar el PDF pasando los cuatro parámetros
 * byte[] pdf = reportPdf.generatePdf(
 * 
 * monthlyIncome,
 * categorySales,
 * topProducts);
 * 
 * return ResponseEntity.ok()
 * .header(
 * HttpHeaders.CONTENT_DISPOSITION,
 * "attachment; filename=reporte-nutrivet.pdf")
 * .contentType(MediaType.APPLICATION_PDF)
 * .body(pdf);
 * }
 * 
 * @GetMapping("/export/excel")
 * public ResponseEntity<byte[]> exportExcel()
 * throws Exception {
 * 
 * byte[] excel = reportExcel.generateExcelReport(
 * reportService.monthlyIncome(),
 * reportService.categorySales(),
 * reportService.topProducts());
 * 
 * return ResponseEntity.ok()
 * .header(
 * HttpHeaders.CONTENT_DISPOSITION,
 * "attachment; filename=reporte-nutrivet.xlsx")
 * .contentType(MediaType.parseMediaType(
 * "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
 * .body(excel);
 * }
 * 
 * }
 */