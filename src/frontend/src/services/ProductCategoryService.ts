import api from "./Api";
import type ProductCategory from "../interfaces/ProductCategory";

// obtener categorías
export async function getAllProductCategories(): Promise<ProductCategory[]> {
  const response = await api.get<ProductCategory[]>("/productCategory/all");
  return response.data;
}

// obtener por id
export async function getProductCategoryById(id: number): Promise<ProductCategory> {
  const response = await api.get<ProductCategory>(`/productCategory/get/${id}`);
  return response.data;
}

// obtener las categorías activas
export async function getActiveProductCategories(): Promise<ProductCategory[]> {
  const response = await api.get<ProductCategory[]>("/productCategory/active");
  return response.data;
}

// crear categoría
export async function addProductCategory(category: Omit<ProductCategory, "id">): Promise<string> {
  const response = await api.post<string>("/productCategory/add", category);
  return response.data;
}

// actualizar categoría
export async function updateProductCategory(id: number, category: Omit<ProductCategory, "id">): Promise<string> {
  const response = await api.put<string>(`/productCategory/update/${id}`,category);
  return response.data;
}

// desactivar categoría
export async function deactivateProductCategory(id: number): Promise<string> {
  const response = await api.delete<string>(`/productCategory/delete/${id}`);
  return response.data;
}
