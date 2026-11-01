export default interface InventoryMovement {
  id: number;
  type: string;
  amount: number;
  movementDate: string;
  reason: string;
  product: {
    id: number;
    name: string;
    code: string;
  };
  idInvoice: number | null;
}