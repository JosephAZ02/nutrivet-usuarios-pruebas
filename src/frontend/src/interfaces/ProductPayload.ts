export interface ProductCreatePayload {
  code: string;
  name: string;
  category: {
    id: number;
  };
  unitPrice: number;
  productAmount: number;
  productCost: number;
  transportCost: number;
  bulkSale: boolean;
}

export interface ProductUpdatePayload {
  code: string;
  name: string;
  category: {
    id: number;
  };
  unitPrice: number;
  productCost: number;
  transportCost: number;
  bulkSale: boolean;
}

export interface ProductForm {
    code: string;
    name: string;
    category: { id: number };
    unitPrice: number | "";
    productAmount: number | "";
    productCost: number | "";
    transportCost: number | "";
    bulkSale: boolean;
}