import type Product from "../../interfaces/Product";
import ProductImage from "../atoms/ProductImage";
import Badge from "../atoms/Badge";
import { formatCurrency } from "../../utils/formatCurrency";
import "./ProductCard.css";

interface ProductCardProps {
    product: Product; //producto que se muestra en la tarjeta
    onAdd: (product: Product) => void; //se ejecuta al presionar el botón +
}

function ProductCard({ product, onAdd }: ProductCardProps) {
    return (
        <div className="card h-100 overflow-hidden">
            <div className="position-relative">
                <ProductImage photo={product.photo} alt={product.name} className="product-card-image" />
                <div className="position-absolute top-0 end-0 m-2">
                    <Badge text={`${product.productAmount} unid.`} variant="secondary" />
                </div>
            </div>

            <div className="card-body">
                <small className="text-success fw-semibold text-uppercase">{product.category.name}</small>
                <h6 className="mb-0">{product.name}</h6>
                <small className="text-muted">{product.bulkSale ? "A granel" : product.code}</small>

                <div className="d-flex justify-content-between align-items-center mt-3">
                    <strong>{formatCurrency(product.unitPrice)}</strong>
                    <button type="button" className="btn btn-outline-success btn-sm" onClick={() => onAdd(product)} aria-label={`Agregar ${product.name}`}>
                        <i className="bi bi-plus-lg" aria-hidden="true"></i>
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ProductCard;