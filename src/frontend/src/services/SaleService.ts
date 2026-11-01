import api from "./Api";
import type { SaleRequest, InvoiceResponse } from "../interfaces/Sale";

// registrar una venta
export async function createSale(sale: SaleRequest): Promise<InvoiceResponse> {
  const response = await api.post<InvoiceResponse>("/invoice/sale", sale);
  return response.data;
}

// obtener una factura completa con sus líneas
export async function getInvoiceDetail(id: number): Promise<InvoiceResponse> {
  const response = await api.get<InvoiceResponse>(`/invoice/detail/${id}`);
  return response.data;
}