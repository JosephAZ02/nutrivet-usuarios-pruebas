import type Product from "../../../interfaces/Product";
import api from "../../../services/Api";



interface ProductsTableProps {
    filteredProducts: Product[];
    currentProducts: Product[];
    currentPage: number;
    totalPages: number;
    indexOfFirstProduct: number;
    indexOfLastProduct: number;
    onEdit: (product: Product) => void;
    onDelete: (product: Product) => void;
    onPageChange: (page: number) => void;
    showInactiveProducts: boolean;
    onReactivate: (product: Product) => void;
}


function ProductsTable({ filteredProducts, currentProducts, currentPage, totalPages, onEdit, onDelete, onPageChange, showInactiveProducts, onReactivate }: ProductsTableProps) {
    const maxVisiblePages = 8;

    const startPage = Math.max(1, Math.min(currentPage - Math.floor(maxVisiblePages / 2), totalPages - maxVisiblePages + 1));
    const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    const pages = Array.from({ length: endPage - startPage + 1 }, (_, index) => startPage + index);

    return (
        <div className="card border-0 shadow-sm rounded-4">
            <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                    <thead className="table-light">
                        <tr>
                            <th className="ps-4">Producto</th>
                            <th className="text-center">Categoría</th>
                            <th className="text-center">Costo</th>
                            <th className="text-center">Transporte</th>
                            <th className="text-center">Precio de venta</th>
                            <th className="text-center">Existencias</th>
                            <th className="text-center">Estado</th>
                            <th className="text-center">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredProducts.length > 0 ? (
                            currentProducts.map((product) => {
                                const stockStatus = product.productAmount <= 5 ? "Crítico" : product.productAmount < 20 ? "Bajo" : "Bueno";
                                return (
                                    <tr key={product.id}>
                                        <td className="ps-4">
                                            <div className="d-flex align-items-center gap-3">
                                                {product.photo ? (
                                                    <img
                                                        src={`${api.defaults.baseURL?.replace(/\/api\/?$/, "")}/uploads/${product.photo}`}
                                                        alt={product.name}
                                                        style={{
                                                            width: "55px",
                                                            height: "55px",
                                                            objectFit: "cover",
                                                            borderRadius: "10px"
                                                        }}
                                                    />
                                                ) : (
                                                    <div
                                                        className="bg-light rounded-3 d-flex align-items-center justify-content-center text-muted"
                                                        style={{
                                                            width: "55px",
                                                            height: "55px",
                                                            flexShrink: 0
                                                        }}
                                                    >
                                                        <i className="bi bi-image fs-4"></i>
                                                    </div>
                                                )}
                                                <div>
                                                    <div className="fw-semibold">
                                                        {product.name}
                                                    </div>
                                                    <small className="text-muted">
                                                        Código: {product.code}
                                                    </small>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="text-center">{product.category.name}</td>
                                        <td className="text-center">₡{product.productCost.toLocaleString("es-CR")}</td>
                                        <td className="text-center">₡{product.transportCost.toLocaleString("es-CR")}</td>
                                        <td className="text-center">₡{product.unitPrice.toLocaleString("es-CR")}</td>
                                        <td className="text-center">{product.productAmount}</td>
                                        <td className="text-center">
                                            <span className={`badge ${stockStatus === "Crítico" ? "bg-danger" : stockStatus === "Bajo"
                                                ? "bg-warning text-dark"
                                                : "bg-success"
                                                }`}>
                                                {stockStatus}
                                            </span>
                                        </td>
                                        <td className="text-center">
                                            {showInactiveProducts ? (
                                                <button
                                                    type="button"
                                                    className="btn btn-sm btn-outline-success"
                                                    onClick={() => onReactivate(product)}
                                                >
                                                    <i className="bi bi-arrow-counterclockwise me-1"></i>
                                                    Reactivar
                                                </button>
                                            ) : (
                                                <>
                                                    <button
                                                        type="button"
                                                        className="btn btn-sm btn-outline-primary me-2"
                                                        onClick={() => onEdit(product)}
                                                    >
                                                        Editar
                                                    </button>

                                                    <button
                                                        type="button"
                                                        className="btn btn-sm btn-outline-danger"
                                                        onClick={() => onDelete(product)}
                                                    >
                                                        Quitar
                                                    </button>
                                                </>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })
                        ) : (
                            <tr>
                                <td colSpan={8} className="text-center py-5 text-muted">
                                    No se encontraron productos.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* control de paginación */}
            {totalPages > 1 && (
                <nav aria-label="Paginación de productos" className="py-3">
                    <ul className="pagination pagination-sm justify-content-center mb-0 flex-wrap">

                        <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                            <button
                                type="button"
                                className="page-link"
                                disabled={currentPage === 1}
                                onClick={() => onPageChange(currentPage - 1)}
                            >
                                Anterior
                            </button>
                        </li>

                        {pages.map(page => (
                            <li
                                key={page}
                                className={`page-item ${currentPage === page ? "active" : ""}`}
                            >
                                <button
                                    type="button"
                                    className="page-link"
                                    onClick={() => onPageChange(page)}
                                >
                                    {page}
                                </button>
                            </li>
                        ))}

                        <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
                            <button
                                type="button"
                                className="page-link"
                                disabled={currentPage === totalPages}
                                onClick={() => onPageChange(currentPage + 1)}
                            >
                                Siguiente
                            </button>
                        </li>

                    </ul>
                </nav>
            )}
        </div>
    );
}

export default ProductsTable;
