import type ProductCategory from "./ProductCategory";

export default interface Product {
  id: number;
  code: string;
  name: string;
  category: ProductCategory;
  unitPrice: number;
  productAmount: number;
  productCost: number;
  transportCost: number;
  bulkSale: boolean;
  photo: string | null;
  active: boolean;
}