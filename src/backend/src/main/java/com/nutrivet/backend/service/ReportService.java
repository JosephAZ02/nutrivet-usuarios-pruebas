package com.nutrivet.backend.service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.nutrivet.backend.domain.Invoice;
import com.nutrivet.backend.domain.InvoiceDetail;
import com.nutrivet.backend.domain.Product;
import com.nutrivet.backend.domain.ProductCategory;
import com.nutrivet.backend.dto.CategorySalesDto;
import com.nutrivet.backend.dto.TopProductDto;
import com.nutrivet.backend.repository.InvoiceDetailRepository;
import com.nutrivet.backend.repository.InvoiceRepository;
import com.nutrivet.backend.repository.ProductCategoryRepository;
import com.nutrivet.backend.repository.ProductRepository;

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
        int cantInvoices[] = new int[12];
        for (Invoice invoice : invoiceRepository.findAll()) {// recorrer todas las facturas
            if (invoice.getDate().getYear() == LocalDate.now().getYear()) {// filtrar por el año actual
                int month = invoice.getDate().getMonthValue();
                totals[month - 1] += invoice.getTotal();// sumar el total de la factura al mes correspondiente
                cantInvoices[month - 1]++;// contar la cantidad de facturas por mes
            }
        }

        List<com.nutrivet.backend.dto.MonthlyIncomeDto> results = new ArrayList<>();

        for (int i = 0; i < 12; i++) {
            results.add(new com.nutrivet.backend.dto.MonthlyIncomeDto(i + 1, totals[i], cantInvoices[i]));// agregar el
                                                                                                          // mes
                                                                                                          // y el total
                                                                                                          // al
            // resultado
        }

        return results;
    }

    public List<com.nutrivet.backend.dto.CategorySalesDto> categorySales() {

        // buscar los productos por factura
        // buscar la categoría de cada producto
        // sumar las ventas por categoría
        int year = LocalDate.now().getYear();
        Set<Integer> invoiceIds = new HashSet<>();

        for (Invoice invoice : invoiceRepository.findAll()) {// recorrer todas las facturas y guardar las del año
                                                             // acttual
            if (invoice.getDate().getYear() == year) {
                invoiceIds.add(invoice.getId());
            }
        }

        Map<Integer, Product> products = new HashMap<>();
        for (Product p : productRepository.findAll()) {// obtener todos los productos
            products.put(p.getId(), p);
        }

        Map<String, Double> totals = new HashMap<>();
        for (InvoiceDetail detail : detailRepository.findAll()) {// recorrer todos los detalles de factura
            if (!invoiceIds.contains(detail.getIdInvoice()))// verificar que el detalle pertenece a una factura del año
                                                            // actual
                continue;

            Product product = products.get(detail.getIdProduct());// obtener el producto de esa venta
            if (product == null || product.getCategory() == null)
                continue;

            totals.merge(product.getCategory().getName(), detail.getTotal(), Double::sum);// sumar el total de la venta
                                                                                          // a la categoría
                                                                                          // correspondiente
        }

        List<CategorySalesDto> results = new ArrayList<>();
        for (String category : totals.keySet()) {
            results.add(new CategorySalesDto(category, totals.get(category)));// agregar la categoría y el total al
                                                                              // resultado
        }
        results.sort((a, b) -> Double.compare(b.total(), a.total())); // mayor a menor

        return results;
    }

    public List<TopProductDto> topProducts() {

        Set<Integer> invoiceIds = new HashSet<>();// filtrar las facturas del año actual
        int year = LocalDate.now().getYear();

        for (Invoice invoice : invoiceRepository.findAll()) {
            if (invoice.getDate().getYear() == year) {
                invoiceIds.add(invoice.getId());
            }
        }
        Map<Integer, Double> quantities = new HashMap<>();
        Map<Integer, Double> incomes = new HashMap<>();

        for (InvoiceDetail detail : detailRepository.findAll()) {// recorrer todos los detalles de factura
            if (!invoiceIds.contains(detail.getIdInvoice()))
                continue;

            int productId = detail.getIdProduct();
            quantities.merge(productId, (double) detail.getAmount(), Double::sum);// sumar la cantidad vendida del
                                                                                  // producto
            incomes.merge(productId, (double) detail.getTotal(), Double::sum);
        }
        List<Integer> ids = new ArrayList<>(quantities.keySet());
        ids.sort((a, b) -> Double.compare(quantities.get(b), quantities.get(a)));// ordenar de mayor a menor por
                                                                                 // cantidad vendida

        List<TopProductDto> results = new ArrayList<>();
        int position = 1;
        for (int productId : ids) {
            Product product = productRepository.findById(productId).orElse(null);// buscar el producto por id

            if (product == null)
                continue;

            String category = product.getCategory() != null
                    ? product.getCategory().getName()
                    : "Sin categoría";// obtener nombre de categoria si no tiene entonces asignarle sin categoria

            results.add(new TopProductDto(
                    position++,
                    product.getName(),
                    category,
                    quantities.get(productId),
                    incomes.get(productId)));
        }
        return results;
    }
}
