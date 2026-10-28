
const url = 'http://localhost:8080/api/reports';
const token = "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJhZG1pbjIiLCJpYXQiOjE3OTMyMTk2NDEsImV4cCI6MTc5MzI1NTY0MX0.0sWNgIWhFw0tzNqYFM0Se3fL2zK2bKZKcssPR-ki_QI";

interface CategorySales {
    category: string;
    total: number;
}

export interface MonthlyIncome {
    month: string;
    total: number;
    cantInvoices: number;
}

interface ProductSales {
    position: string;
    product: string;
    category: string;
    volume: number;
    income: number;
}

//obtener el reporte de ingresos mensuales
export async function getReportMonthlyIncome(): Promise<MonthlyIncome[]> {
    try {
        const result = await fetch(url + "/monthlyIncome", {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const data = await result.json();
        return data;
    } catch (error) {
        console.error("Error fetching monthly income report:", error);
        throw error;
    }
}
//obtener el reporte de ventas por categoría
export async function getReportCategorySales(): Promise<CategorySales[]> {
    const result = await fetch(url + "/categorySales", {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    const data = await result.json();
    return data;
}

//obtener el reporte de ventas por producto
export async function getReportProductSales(): Promise<ProductSales[]> {
    const result = await fetch(url + "/topProducts", {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    const data = await result.json();
    return data;
}
