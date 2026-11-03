package com.nutrivet.backend.reports;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Locale.Category;
import java.util.Optional;

import org.apache.poi.ss.formula.functions.Count;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;

import com.nutrivet.backend.domain.Invoice;
import com.nutrivet.backend.domain.InvoiceDetail;
import com.nutrivet.backend.domain.Product;
import com.nutrivet.backend.dto.CategorySalesDto;
import com.nutrivet.backend.dto.MonthlyIncomeDto;
import com.nutrivet.backend.dto.TopProductDto;
import com.nutrivet.backend.repository.InvoiceDetailRepository;
import com.nutrivet.backend.repository.InvoiceRepository;
import com.nutrivet.backend.repository.ProductRepository;
import com.nutrivet.backend.service.ReportService;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class ReportServiceTest {

    private static final int YEAR = LocalDate.now().getYear();

    @Mock
    private InvoiceRepository invoiceRepository;
    @Mock
    private InvoiceDetailRepository detailRepository;
    @Mock
    private ProductRepository productRepository;

    @InjectMocks
    private ReportService reportService;

    private Invoice invoice(int id, LocalDate date, double total) {// Simula una factura
        Invoice invoice = mock(Invoice.class);
        when(invoice.getId()).thenReturn(id);
        when(invoice.getDate()).thenReturn(LocalDateTime.of(date, java.time.LocalTime.NOON));
        when(invoice.getTotal()).thenReturn(total);
        return invoice;
    }

    private InvoiceDetail detail(int idInvoice, int idProduct, int amount, double total) {
        InvoiceDetail detail = mock(InvoiceDetail.class);
        when(detail.getIdInvoice()).thenReturn(idInvoice);
        when(detail.getIdProduct()).thenReturn(idProduct);
        when(detail.getAmount()).thenReturn(Double.valueOf(amount));
        when(detail.getTotal()).thenReturn(total);
        return detail;
    }

    private Product product(int id, String name, String categoryName) {
        // Simula un producto
        Product product;
        if (categoryName == null) {
            // Simula un producto sin categoría
            product = mock(Product.class); // getCategory() devuelve null por defecto
        } else {
            // Simula un producto con categoría
            product = mock(Product.class, org.mockito.Mockito.RETURNS_DEEP_STUBS);// retorna un mock de Product
            when(product.getCategory().getName()).thenReturn(categoryName);// getCategory() devuelve un mock de
                                                                           // Category, y getName() devuelve
                                                                           // categoryName
        }
        when(product.getId()).thenReturn(id);
        when(product.getName()).thenReturn(name);
        return product;
    }

    private LocalDate thisYear(int month) {
        return LocalDate.of(YEAR, month, 15);
    }

    private LocalDate lastYear(int month) {
        return LocalDate.of(YEAR - 1, month, 15);
    }

    @Test // prueba que si no hay facturas, se devuelven 12 meses con ingresos 0
    void monthlyIncomeWithoutInvoicesReturns12oMnthsAtZero() {
        when(invoiceRepository.findAll()).thenReturn(List.of());

        List<MonthlyIncomeDto> result = reportService.monthlyIncome();

        assertEquals(12, result.size());
        for (int i = 0; i < 12; i++) {
            assertEquals(new MonthlyIncomeDto(i + 1, 0.0, 0), result.get(i));
        }
    }

    @Test // prueba que si hay facturas, se suman los totales y se cuentan las facturas
          // por mes
    void monthlyIncome_sumTotalsAndCountInvoicesPerMonth() {
        when(invoiceRepository.findAll()).thenReturn(List.of(
                invoice(1, thisYear(1), 100000.0),
                invoice(2, thisYear(1), 50000.0),
                invoice(3, thisYear(3), 25000.0)));

        List<MonthlyIncomeDto> result = reportService.monthlyIncome();

        assertEquals(12, result.size());
        assertEquals(new MonthlyIncomeDto(1, 150000.0, 2), result.get(0));
        assertEquals(new MonthlyIncomeDto(2, 0.0, 0), result.get(1));
        assertEquals(new MonthlyIncomeDto(3, 25000.0, 1), result.get(2));
    }

    @Test
    // prueba que se ignoren las facturas de otro año
    void monthlyIncome_IgnoreinvoicesFromAnotherYear() {
        when(invoiceRepository.findAll()).thenReturn(List.of(
                invoice(1, lastYear(1), 999999.0),
                invoice(2, thisYear(2), 1000.0)));

        List<MonthlyIncomeDto> result = reportService.monthlyIncome();

        assertEquals(new MonthlyIncomeDto(1, 0.0, 0), result.get(0));
        assertEquals(new MonthlyIncomeDto(2, 1000.0, 1), result.get(1));
    }

    @Test
    // prueba que se devuelva una lista vacia si no hay datos
    void categorySales_sinDatos_devuelveListaVacia() {
        when(invoiceRepository.findAll()).thenReturn(List.of());
        when(productRepository.findAll()).thenReturn(List.of());
        when(detailRepository.findAll()).thenReturn(List.of());

        assertTrue(reportService.categorySales().isEmpty());
    }

    @Test // prueba que se sumen las ventas por categoría y se ordenen de mayor a menor
    void categorySales_sumaPorCategoriaYOrdenaDeMayorAMenor() {
        when(invoiceRepository.findAll()).thenReturn(List.of(
                invoice(1, thisYear(5), 0), invoice(2, thisYear(6), 0)));
        when(productRepository.findAll()).thenReturn(List.of(
                product(1, "Concentrado perro adulto 20kg", "Alimentos"),
                product(2, "Antibiótico inyectable 100ml", "Medicamentos")));
        when(detailRepository.findAll()).thenReturn(List.of(
                detail(1, 1, 1, 30000.0),
                detail(1, 2, 1, 50000.0),
                detail(2, 1, 1, 40000.0)));

        List<CategorySalesDto> result = reportService.categorySales();

        // Alimentos = 30000 + 40000 = 70000 ; Medicamentos = 50000
        assertEquals(List.of(
                new CategorySalesDto("Alimentos", 70000.0),
                new CategorySalesDto("Medicamentos", 50000.0)), result);
    }

    @Test // prueba que la categoría con más ventas va primero
    void categorySales_TheCategoryWithTheMostSalesGoesFirst() {
        when(invoiceRepository.findAll()).thenReturn(List.of(invoice(1, thisYear(1), 0)));
        when(productRepository.findAll()).thenReturn(List.of(
                product(1, "Collar ajustable", "Accesorios"),
                product(2, "Pelota de caucho", "Juguetes")));
        when(detailRepository.findAll()).thenReturn(List.of(
                detail(1, 1, 1, 3500.0),
                detail(1, 2, 1, 9000.0)));

        List<CategorySalesDto> result = reportService.categorySales();

        assertEquals("Juguetes", result.get(0).category());
        assertEquals(9000.0, result.get(0).total());
        assertEquals(2, result.size());
    }

    @Test
    // prueba que si no hay datos, se devuelve una lista vacía
    void topProducts_returnsEmptyList() {
        when(invoiceRepository.findAll()).thenReturn(List.of());
        when(detailRepository.findAll()).thenReturn(List.of());

        assertTrue(reportService.topProducts().isEmpty());
    }

    @Test // prueba que se ordenen los productos por cantidad vendida y se asigne la
          // posicion
    void topProducts_ordenaPorCantidadVendidaYAsignaPosicion() {
        Product concentrado = product(1, "Concentrado perro adulto 20kg", "Alimentos");
        Product vitaminas = product(2, "Vitaminas en gotas 30ml", "Medicamentos");

        when(invoiceRepository.findAll()).thenReturn(List.of(invoice(1, thisYear(7), 0)));
        when(detailRepository.findAll()).thenReturn(List.of(
                detail(1, 1, 2, 55000.0), // producto 1: 2 unidades
                detail(1, 1, 3, 82500.0), // producto 1: 3 unidades más -> 5 en total
                detail(1, 2, 8, 49600.0))); // producto 2: 8 unidades
        when(productRepository.findById(1)).thenReturn(Optional.of(concentrado));
        when(productRepository.findById(2)).thenReturn(Optional.of(vitaminas));

        List<TopProductDto> result = reportService.topProducts();

        assertEquals(List.of(
                new TopProductDto(1, "Vitaminas en gotas 30ml", "Medicamentos", 8.0, 49600.0),
                new TopProductDto(2, "Concentrado perro adulto 20kg", "Alimentos", 5.0, 137500.0)),
                result);
    }

    @Test
    // prueba que si un producto no tiene categoría, se use "Sin categoría"
    void topProducts_productoSinCategoria_usaSinCategoria() {
        Product producto = product(1, "Producto suelto", null);

        when(invoiceRepository.findAll()).thenReturn(List.of(invoice(1, thisYear(8), 0)));
        when(detailRepository.findAll()).thenReturn(List.of(detail(1, 1, 1, 2000.0)));
        when(productRepository.findById(1)).thenReturn(Optional.of(producto));

        List<TopProductDto> result = reportService.topProducts();

        assertEquals(List.of(
                new TopProductDto(1, "Producto suelto", "Sin categoría", 1.0, 2000.0)), result);
    }
}