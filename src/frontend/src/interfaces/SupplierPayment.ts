export default interface SupplierPayment {
  id: number;
  amount: number;
  paymentDate: string;
  description: string;
  idSupplierInvoice: number;
  idUser: number;
}

export type SupplierPaymentCreate = Omit<SupplierPayment, "id" | "idUser">;
