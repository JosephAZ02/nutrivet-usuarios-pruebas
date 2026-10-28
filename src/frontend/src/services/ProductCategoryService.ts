
import api from './Api';
import type ProductCategory from '../interfaces/ProductCategory';

export const ProductCategoryService = {
  getAll: async (): Promise<ProductCategory[]> => {
    const response = await api.get('/productCategory/all');
    return response.data;
  },

  create: async (name: string) => {
    const response = await api.post('/productCategory/add', new URLSearchParams({ name }), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });
    return response.status === 200 || response.status === 201;
  },

  getById: async (productCategoryId: number): Promise<ProductCategory> => {
    const response = await api.get(`/productCategory/get/${productCategoryId}`);
    return response.data;
  },

  update: async (productCategoryId: number, name: string) => {
    const response = await api.put(`/productCategory/update/${productCategoryId}`, new URLSearchParams({ name }), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });
    return response.status === 200;
  },

  delete: async (productCategoryId: number) => {
    const response = await api.delete(`/productCategory/delete/${productCategoryId}`);
    return response.status === 200;
  }
};