import api from "./Api";
import type Product from "../interfaces/Product";
import type {ProductCreatePayload,ProductUpdatePayload} from "../interfaces/ProductPayload";

// obtener los productos activos
export async function getAllProducts(): Promise<Product[]> {
  const response = await api.get<Product[]>("/product/all");
  return response.data;
}

// obtener por id
export async function getProductById(id: number): Promise<Product> {
  const response = await api.get<Product>(`/product/get/${id}`);
  return response.data;
}

// registrar producto
export async function addProduct(product: ProductCreatePayload,image?: File | null): Promise<Product> {
  const formData = new FormData();

  formData.append("product",new Blob([JSON.stringify(product)], {
      type: "application/json"})
  );

  if (image) {
    formData.append("image", image);
  }

  const response = await api.post<Product>("/product/add", formData);
  return response.data;
}

// actualizar producto
export async function updateProduct(id: number, product: ProductUpdatePayload, image?: File | null, removeImage: boolean = false): Promise<Product> {
  const formData = new FormData();

  formData.append("product",new Blob([JSON.stringify(product)], {
      type: "application/json"})
  );

  if (image) {
    formData.append("image", image);
  }

  formData.append("removeImage", String(removeImage));

  const response = await api.put<Product>(`/product/update/${id}`,formData);

  return response.data;
}

// desactivar producto
export async function deleteProduct(id: number): Promise<string> {
  const response = await api.delete<string>(`/product/delete/${id}`);
  return response.data;
}

// buscar por nombre
export async function searchProductsByName(name: string): Promise<Product[]> {
  const response = await api.get<Product[]>("/product/search/name", {params: { name }});

  return response.data;
}

// buscar por código
export async function searchProductByCode(code: string): Promise<Product> {
  const response = await api.get<Product>("/product/search/code", {params: { code }});

  return response.data;
}

// obtener estado del stock
export async function getProductStockStatus(id: number): Promise<string> {
  const response = await api.get<string>(`/product/stock-status/${id}`);
  return response.data;
}

// obtener productos con inventario crítico
export async function getCriticalStockProducts(): Promise<Product[]> {
  const response = await api.get<Product[]>("/product/critical-stock");
  return response.data;
}

// obtener productos con inventario bajo
export async function getLowStockProducts(): Promise<Product[]> {
  const response = await api.get<Product[]>("/product/low-stock");
  return response.data;
}