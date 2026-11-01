import api from "./Api";
import type InventoryMovement from "../interfaces/InventoryMovement";


export async function getAllInventoryMovements(): Promise<InventoryMovement[]> {
  const response = await api.get<InventoryMovement[]>("/inventoryMovement/all");
  return response.data;
}

export async function addInventoryMovement(movement: {
  type: string;
  amount: number;
  reason: string;
  product: {
    id: number;
  };
  idInvoice: number | null;
}
): Promise<InventoryMovement> {
  const response = await api.post<InventoryMovement>("/inventoryMovement/add", movement);
  return response.data;
}