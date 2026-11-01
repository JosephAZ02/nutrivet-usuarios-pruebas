// se envía al backend para registrar una venta
export interface SaleItemRequest {
  productId: number;
  quantity: number;
}

export interface SaleRequest {
  paymentMethod: "EFECTIVO" | "TARJETA";
  amountReceived: number | null; // solo se usa en efectivo para calcular el vuelto
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