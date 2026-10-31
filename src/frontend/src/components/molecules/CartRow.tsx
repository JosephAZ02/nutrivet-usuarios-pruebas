import type CartItem from "../../interfaces/CartItem";
import type Product from "../../interfaces/Product";
import ProductImage from "../atoms/ProductImage";
import QuantityStepper from "./QuantityStepper";
import { formatCurrency } from "../../utils/formatCurrency";
import "./CartRow.css";

interface CartRowProps {
    item: CartItem; //producto del detalle y la cantidad que lleva
    onQuantityChange: (product: Product, quantity: number) => void; //se ejecuta al cambiar la cantidad
}

function CartRow({ item, onQuantityChange }: CartRowProps) {
    const { product, quantity } = item;

    return (
        <div className="d-flex gap-3 py-3 border-bottom">
            <ProductImage photo={product.photo} alt={product.name} className="cart-row-image rounded" />

            <div className="flex-grow-1">
                <div className="d-flex justify-content-between gap-2">
                    <span className="fw-semibold">{product.name}</span>
                    <strong>{formatCurrency(product.unitPrice * quantity)}</strong>
                </div>

                <small className="text-muted d-block mb-2">{formatCurrency(product.unitPrice)} / unidad</small>

                <QuantityStepper quantity={quantity} max={product.productAmount} onChange={(newQuantity) => onQuantityChange(product, newQuantity)} />
            </div>
        </div>
    );
}

export default CartRow;