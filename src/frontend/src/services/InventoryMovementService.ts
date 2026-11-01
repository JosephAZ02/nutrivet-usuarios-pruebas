import api from "./Api";
import type InventoryMovement from "../interfaces/InventoryMovement";

// obtener todos los movimientos de inventario
export async function getAllInventoryMovements(): Promise<InventoryMovement[]> {
  const response = await api.get<InventoryMovement[]>("/inventoryMovement/all");
  return response.data;
}