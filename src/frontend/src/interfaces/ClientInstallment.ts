export default interface ClientInstallment {
  id: number;
  amount: number;
  installmentDate: string;
  idReceivableAccount: number;
  idClient: number;
}