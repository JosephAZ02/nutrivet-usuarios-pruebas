package com.nutrivet.backend.controller;

import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.nutrivet.backend.service.ReportService;

@RestController

@RequestMapping("/api/reports")

@CrossOrigin(origins = "*")
public class ReportController {

        @Autowired
        private ReportService reportService;

        @GetMapping("/monthlyIncome")
        public List<com.nutrivet.backend.dto.MonthlyIncomeDto> getMonthlyIncome() {
                return this.reportService.monthlyIncome();
        }

        @GetMapping("/categorySales")
        public List<com.nutrivet.backend.dto.CategorySalesDto> getCategorySales() {
                return this.reportService.categorySales();
        }

        @GetMapping("/topProducts")
        public List<com.nutrivet.backend.dto.TopProductDto> getTopProducts() {
                return this.reportService.topProducts();
        }

}