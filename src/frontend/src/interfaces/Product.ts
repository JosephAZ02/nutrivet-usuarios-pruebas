export default interface Product {
  id: number;
  code: string;
  name: string;
  category: string;
  unitPrice: number;
  productAmount: number;
  productCost: number;
  transportCost: number;
  bulkSale: boolean;
  photo: string;
  idCategoryProduct: number;
}