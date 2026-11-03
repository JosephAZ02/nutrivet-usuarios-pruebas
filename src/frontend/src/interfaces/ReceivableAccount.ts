
export type AccountStatus = "PENDIENTE" | "VENCIDA" | "PAGADA";

export default interface ReceivableAccount {
  id: number;
  invoiceId: number;
  invoiceNumber: string;
  clientId: string; 
  clientName: string;
  totalAmount: number; 
  paidAmount: number; 
  balance: number; 
  monthlyInstallment: number; 
  dueDate: string | null; 
  status: AccountStatus;
}