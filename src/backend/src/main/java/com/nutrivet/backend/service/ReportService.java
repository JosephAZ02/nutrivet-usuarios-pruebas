package com.nutrivet.backend.service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.nutrivet.backend.domain.Invoice;
import com.nutrivet.backend.domain.InvoiceDetail;
import com.nutrivet.backend.domain.ProductCategory;
import com.nutrivet.backend.dto.CategorySalesDto;
import com.nutrivet.backend.dto.TopProductDto;
import com.nutrivet.backend.repository.InvoiceDetailRepository;
import com.nutrivet.backend.repository.InvoiceRepository;
import com.nutrivet.backend.repository.ProductCategoryRepository;
import com.nutrivet.backend.repository.ProductRepository;
/* 
@Service
public class ReportService {

    @Autowired
    private InvoiceRepository invoiceRepository;
    @Autowired
    private InvoiceDetailRepository detailRepository;
    @Autowired
    private ProductRepository productRepository;
    @Autowired
    private ProductCategoryRepository categoryRepository;

    public List<com.nutrivet.backend.dto.MonthlyIncomeDto> monthlyIncome() {
        // cuánto se facturó en cada mes del año

        double totals[] = new double[12];

        for (Invoice invoice : invoiceRepository.findAll()) {// recorrer todas las facturas
            if (invoice.getDate().getYear() == LocalDate.now().getYear()) {// filtrar por el año actual
                int month = invoice.getDate().getMonthValue();
                totals[month - 1] += invoice.getTotal();// sumar el total de la factura al mes correspondiente
            }
        }

        List<com.nutrivet.backend.dto.MonthlyIncomeDto> results = new ArrayList<>();

        for (int i = 0; i < 12; i++) {
            results.add(new com.nutrivet.backend.dto.MonthlyIncomeDto(i + 1, totals[i]));// agregar el mes y el total al
                                                                                         // resultado
        }

        return results;
    }

    public List<com.nutrivet.backend.dto.CategorySalesDto> categorySales() {

        // buscar los productos por factura
        // buscar la categoría de cada producto
        // sumar las ventas por categoría
        Map<String, Double> totals = new HashMap<>();

        for (InvoiceDetail detail : detailRepository.findAll()) {// recorrer todos los detalles de factura
            Invoice invoice = invoiceRepository.findById(detail.getIdInvoice()).get();// buscar la factura del detalle

            if (detail.getIdInvoice() == invoice.getId()) {// verificar que el detalle pertenece a la factura

                com.nutrivet.backend.domain.Product product = productRepository.findById(detail.getIdProduct()).get();
                if (product == null)// validar que exista el producto y la categoría
                    continue;
                if (product.getIdCategoryProduct() == null)
                    continue;

                ProductCategory category = categoryRepository.findById(product.getIdCategoryProduct()).get();
                if (category == null)
                    continue;

                String name = category.getName();
                double current = totals.getOrDefault(name, 0.0);
                totals.put(name, current + detail.getTotal());

            }
        }

        List<com.nutrivet.backend.dto.CategorySalesDto> results = new ArrayList<>();
        for (String key : totals.keySet()) {// guardar los resultados en el DTO
            Double value = totals.get(key);

            results.add(
                    new CategorySalesDto(key, value));
        }
        return results;
    }

    public List<TopProductDto> topProducts() {
        Map<Integer, Double> quantities = new HashMap<>();

        for (Invoice invoice : invoiceRepository.findAll()) {// recorrer todas las ventas
            if (invoice.getDate().getYear() == LocalDate.now().getYear()) {// filtrar por el año actual

                for (InvoiceDetail detail : detailRepository.findAll()) {// recorrer todos los detalles de factura
                    if (detail.getIdInvoice() == invoice.getId()) {// verificar que el detalle pertenece a la factura
                        // sumar la cantidad de cada producto
                        int productId = detail.getIdProduct();
                        double currentQuantity = quantities.getOrDefault(productId, 0.0);

                        quantities.put(productId, currentQuantity + detail.getAmount());
                    }
                }

            }
        }

        List<TopProductDto> results = new ArrayList<>();

        for (int productId : quantities.keySet()) {
            Double quantity = quantities.get(productId);
            com.nutrivet.backend.domain.Product product = productRepository.findById(productId).get();
            if (product != null) {
                results.add(new TopProductDto(product.getName(), quantity));
            }
        }

        return results;
    }
}
    */