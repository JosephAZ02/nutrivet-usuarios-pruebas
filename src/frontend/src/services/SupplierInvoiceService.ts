import type SupplierInvoice from "../interfaces/SupplierInvoice";
import type { SupplierPaymentCreate } from "../interfaces/SupplierPayment";
import type SupplierPayment from "../interfaces/SupplierPayment";
import type SupplierInvoiceReview from "../interfaces/SupplierInvoiceReview";
import api from "./Api";


//registro de facturas de proveedor

export async function getInvoiceList(): Promise<SupplierInvoice[]> {
    const response = await api.get<SupplierInvoice[]>("/supplierInvoice/all");
    return response.data;
}
export async function getOverdue(): Promise<SupplierInvoice[]> {
    const response = await api.get<SupplierInvoice[]>("/supplierInvoice/overdue");
    return response.data;
}
export async function updateMarkPaid(id: number): Promise<SupplierInvoice> {
    const response = await api.put<SupplierInvoice>(`/supplierInvoice/${id}/markPaid`);
    return response.data;
}
export async function updateMarkUnCancelled(id: number): Promise<SupplierInvoice> {
    const response = await api.put<SupplierInvoice>(`/supplierInvoice/${id}/markCancelled`);
    return response.data;
}
export async function saveSupplierInvoice(supplierInvoice: SupplierInvoice): Promise<SupplierInvoice> {
    const response = await api.post<SupplierInvoice>("/supplierInvoice/add", supplierInvoice);
    return response.data;
}
export async function deleteSupplierInvoice(supplierInvoice: SupplierInvoice): Promise<SupplierInvoice> {
    const response = await api.delete<SupplierInvoice>(`/supplierInvoice/delete/${supplierInvoice.id}`);
    return response.data;
}

export async function reviewSupplierInvoice(
    id: number,
    review: SupplierInvoiceReview
): Promise<SupplierInvoice> {
    const response = await api.put<SupplierInvoice>(`/supplierInvoice/${id}/review`, review);
    return response.data;
}

export async function rejectSupplierInvoice(id: number): Promise<SupplierInvoice> {
    const response = await api.put<SupplierInvoice>(`/supplierInvoice/${id}/markCancelled`);
    return response.data;
}


//Pagos de factura de proveedor 


export async function getAllSupplierPayments(): Promise<SupplierPayment[]> {
    const response = await api.get<SupplierPayment[]>("/supplierPayment/all");
    return response.data;
}

export async function getSupplierPaymentsByInvoiceId(id: number): Promise<SupplierPayment[]> {
    const response = await api.get<SupplierPayment[]>(`/supplierPayment/paymentInvoiceSupplier/${id}`);
    return response.data;
}

export async function saveSupplierPayment(supplierPayment: SupplierPaymentCreate): Promise<SupplierPayment> {
    const response = await api.post<SupplierPayment>("/supplierPayment/add", supplierPayment);
    return response.data;
}
