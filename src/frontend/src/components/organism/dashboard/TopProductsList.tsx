// src/components/organism/TopProductsList.tsx
import type { ProductSales } from '../../../services/ReportService';

export default function TopProductsList({ products }: { products: ProductSales[] }) {
    return (
        <div className="card shadow-sm border-0 h-100">
            <div className="card-body">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h5 className="fw-bold mb-0">Más Vendidos</h5>
                </div>
                <ul className="list-group list-group-flush">
                    {products.slice(0, 5).map((product, index) => (
                        <li key={index} className="list-group-item d-flex justify-content-between align-items-center px-0">
                            <div>
                                <strong>{product.position}. {product.product}</strong>
                                <div className="text-muted small">{product.category}</div>
                            </div>
                            <span className="fw-bold text-success">{product.volume} uds</span>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}