export default interface InventoryMovement {
  id: number;
  type: string;
  amount: number;
  movementDate: string;
  idProduct: number;
  idInvoice: number | null;
}