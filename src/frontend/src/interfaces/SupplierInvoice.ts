export default interface SupplierInvoice {
  id: number;
  date: string;
  totalAmount: number;
  state: string;
  condition: string;
  period: number;
  dueDate: string;
  idSupplier: number;
}