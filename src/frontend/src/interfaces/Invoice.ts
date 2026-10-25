export default interface Invoice {
  id: number;
  number: string;
  date: string;
  subtotal: number;
  total: number;
  paymentMethod: string;
  change: number;
  credit: boolean;
}