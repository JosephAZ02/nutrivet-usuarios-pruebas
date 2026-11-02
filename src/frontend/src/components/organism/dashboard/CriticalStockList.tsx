// src/components/organism/CriticalStockList.tsx
import type Product from '../../../interfaces/Product';

export default function CriticalStockList({ products }: { products: Product[] }) {
    return (
        <div className="card shadow-sm border-0 h-100">
            <div className="card-body">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h5 className="fw-bold mb-0 text-danger">Stock Crítico</h5>
                </div>
                <ul className="list-group list-group-flush">
                    {products.slice(0, 5).map(product => (
                        <li key={product.id} className="list-group-item d-flex justify-content-between align-items-center px-0">
                            <div>
                                <strong>{product.name}</strong>
                                <div className="text-muted small">Código: {product.code}</div>
                            </div>
                            <span className="badge bg-danger rounded-pill">{product.productAmount} uds</span>
                        </li>
                    ))}
                    {products.length === 0 && <p className="text-muted">No hay productos en estado crítico.</p>}
                </ul>
            </div>
        </div>
    );
}