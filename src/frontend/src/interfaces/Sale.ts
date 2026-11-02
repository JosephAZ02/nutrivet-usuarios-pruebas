// se envía al backend para registrar una venta
export interface SaleItemRequest {
  productId: number;
  quantity: number;
}

export type PaymentMethod = "EFECTIVO" | "TARJETA" | "SINPE";

export interface SaleRequest {
  paymentMethod: PaymentMethod;
  amountReceived: number | null; // solo se usa en efectivo
  items: SaleItemRequest[];
}


export interface InvoiceLine {
  productId: number;
  productCode: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface InvoiceResponse {
  id: number;
  number: string;
  date: string;
  subtotal: number;
  tax: number;
  total: number;
  paymentMethod: string;
  amountReceived: number;
  change: number;
  credit: boolean;
  items: InvoiceLine[];
}