
export interface SaleItemRequest {
  productId: number;
  quantity: number;
}

export type PaymentMethod = "EFECTIVO" | "TARJETA" | "SINPE" | "CREDITO";

export interface SaleRequest {
  paymentMethod: PaymentMethod;
  amountReceived: number | null; // solo se usa en efectivo
  items: SaleItemRequest[];
  // los siguientes datos solo se envían en una venta a crédito
  clientId?: string; 
  initialPayment?: number | null; 
  monthlyInstallment?: number; 
  dueDate?: string; 
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
  amountReceived: number; // en crédito es el abono inicial
  change: number;
  credit: boolean;
  items: InvoiceLine[];
  // los siguientes datos solo tienen valor si la factura es a crédito
  clientId: string | null;
  clientName: string | null;
  balance: number; // saldo pendiente
  monthlyInstallment: number;
  dueDate: string | null;
}