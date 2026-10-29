
import api from './Api';

export interface CategorySales {
    category: string;
    total: number;
}

export interface MonthlyIncome {
    month: string;
    total: number;
    cantInvoices: number;
}

export interface ProductSales {
    position: string;
    product: string;
    category: string;
    volume: number;
    income: number;
}

// reporte de ingresos mensuales
export async function getReportMonthlyIncome(): Promise<MonthlyIncome[]> {
    const response = await api.get<MonthlyIncome[]>('/reports/monthlyIncome');
    return response.data;
}

// reporte de ventas por categoría
export async function getReportCategorySales(): Promise<CategorySales[]> {
    const response = await api.get<CategorySales[]>('/reports/categorySales');
    return response.data;
}

// reporte de ventas por producto
export async function getReportProductSales(): Promise<ProductSales[]> {
    const response = await api.get<ProductSales[]>('/reports/topProducts');
    return response.data;
}