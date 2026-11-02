export default interface SupplierInvoice {
  id: number;
  date: string;
  totalAmount: number;
  pendingAmount: number;
  state: string;
  condition: string;
  period: number | null;
  dueDate: string;
  idSupplier: number;
}