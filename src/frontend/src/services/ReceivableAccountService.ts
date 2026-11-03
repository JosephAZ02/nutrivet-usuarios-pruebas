import api from "./Api";
import type ReceivableAccount from "../interfaces/ReceivableAccount";
import type ClientInstallment from "../interfaces/ClientInstallment";


export async function getAllAccounts(): Promise<ReceivableAccount[]> {
  const response = await api.get<ReceivableAccount[]>("/receivableAccount/all");
  return response.data;
}


export async function getAccountInstallments(accountId: number): Promise<ClientInstallment[]> {
  const response = await api.get<ClientInstallment[]>(`/receivableAccount/installments/${accountId}`);
  return response.data;
}


export async function addInstallment(accountId: number, amount: number): Promise<ReceivableAccount> {
  const response = await api.post<ReceivableAccount>("/receivableAccount/installment", { accountId, amount });
  return response.data;
}