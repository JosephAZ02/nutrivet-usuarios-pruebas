import type Product from "./Product";

// una línea del detalle de venta antes de cobrar: el producto y cuántas unidades lleva
export default interface CartItem {
  product: Product;
  quantity: number;
}