import api from './Api';

export const ReportService = {
    getMonthlyIncome: async () => {
        const response = await api.get('/reports/monthlyIncome');
        return response.data;
    },

    getCategorySales: async () => {
        const response = await api.get('/reports/categorySales');
        return response.data;
    },

    getProductSales: async () => {
        const response = await api.get('/reports/productSales');
        return response.data;
    },

    createPdfReport: async () => {
        // responseType blob para descargar archivos con Axios
        const response = await api.get('/reports/export/pdf', { responseType: 'blob' });
        return response.data;
    },

    createExcelReport: async () => {
        const response = await api.get('/reports/export/excel', { responseType: 'blob' });
        return response.data;
    }
};