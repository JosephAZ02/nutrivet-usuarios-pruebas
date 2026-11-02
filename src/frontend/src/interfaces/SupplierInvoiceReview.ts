export default interface SupplierInvoiceReview {
  condition: "CASH" | "CREDIT";
  period: number;
  dueDate: string;
}
