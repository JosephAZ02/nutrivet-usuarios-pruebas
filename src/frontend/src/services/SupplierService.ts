import type Supplier from "../interfaces/Supplier";
import api from "./Api";

export async function getAllSuppliers(): Promise<Supplier[]> {
  const response = await api.get<Supplier[]>("/supplier/all");
  return response.data;
}

export async function getSupplierById(id: number): Promise<Supplier> {
  const response = await api.get<Supplier>(`/supplier/get/${id}`);
  return response.data;
}

export async function addSupplier(supplier: Omit<Supplier, "id">): Promise<Supplier> {
  const response = await api.post<Supplier>("/supplier/add", supplier);
  return response.data;
}

export async function updateSupplier(supplier: Supplier): Promise<Supplier> {
  const response = await api.put<Supplier>("/supplier/update", supplier);
  return response.data;
}

export async function deleteSupplier(id: number): Promise<void> {
  await api.delete(`/supplier/delete/${id}`);
}
