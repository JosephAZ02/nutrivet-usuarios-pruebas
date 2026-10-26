
const url = 'https://localhost/reports';

//obtener el reporte de ingresos mensuales
export async function getReportMonthlyIncome() {
    const result = await fetch(url + "/monthlyIncome");
    const data = await result.json();
    return data;
}
//obtener el reporte de ventas por categoría
export async function getReportCategorySales() {
    const result = await fetch(url + "/categorySales");
    const data = await result.json();
    return data;
}

//obtener el reporte de ventas por producto
export async function getReportProductSales() {
    const result = await fetch(url + "/productSales");
    const data = await result.json();
    return data;
}

//crear reporte pdf
export async function createPdfReport() {
    const result = await fetch(url + "/export/pdf");
    const data = await result.blob();
    return data;
}

//crear reporte excel
export async function createExcelReport() {
    const result = await fetch(url + "/export/excel");
    const data = await result.blob();
    return data;
}