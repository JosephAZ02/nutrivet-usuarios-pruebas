import type Product from "../../../interfaces/Product";

interface ProductsTableProps {
    filteredProducts: Product[];
    currentProducts: Product[];
    productsPerPage: number;
    currentPage: number;
    totalPages: number;
    indexOfFirstProduct: number;
    indexOfLastProduct: number;
    onEdit: (product: Product) => void;
    onDelete: (product: Product) => void;
    onPageChange: (page: number) => void;
}

function ProductsTable({filteredProducts,currentProducts,productsPerPage,currentPage,totalPages,onEdit,onDelete,onPageChange}: ProductsTableProps) {
    return (
        <div className="card border-0 shadow-sm rounded-4">
            <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                    <thead className="table-light">
                        <tr>
                            <th className="ps-4">Producto</th>
                            <th>Categoría</th>
                            <th>Costo</th>
                            <th>Transporte</th>
                            <th>Precio de venta</th>
                            <th>Existencias</th>
                            <th>Estado</th>
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
                                                        src={`http://localhost:8080/uploads/${product.photo}`}
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
                                        <td>{product.category.name}</td>
                                        <td>₡{product.productCost.toLocaleString("es-CR")}</td>
                                        <td>₡{product.transportCost.toLocaleString("es-CR")}</td>
                                        <td>₡{product.unitPrice.toLocaleString("es-CR")}</td>
                                        <td>{product.productAmount}</td>
                                        <td>
                                            <span className={`badge ${stockStatus === "Crítico" ? "bg-danger" : stockStatus === "Bajo"
                                                    ? "bg-warning text-dark"
                                                    : "bg-success"
                                                }`}>
                                                {stockStatus}
                                            </span>
                                        </td>
                                        <td className="text-center">
                                            <button
                                                className="btn btn-sm btn-outline-primary me-2"
                                                onClick={() => onEdit(product)}
                                            >
                                                Editar
                                            </button>

                                            <button
                                                className="btn btn-sm btn-outline-danger"
                                                onClick={() => onDelete(product)}
                                            >
                                                Quitar
                                            </button>
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
            {filteredProducts.length > productsPerPage && (
                <div className="d-flex justify-content-center align-items-center flex-wrap gap-3 mt-3">
    
                    <div className="d-flex gap-2 justify-content-between align-items-center">
                        <button 
                            type="button"
                            className="btn btn-outline-secondary btn-sm"
                            disabled={currentPage === 1}
                            onClick={() => onPageChange(currentPage - 1)}
                        >
                            <i className="bi bi-chevron-left me-1"></i>
                            Anterior
                        </button>

                        <span className="d-flex align-items-center px-2 fw-semibold">
                            {currentPage} / {totalPages}
                        </span>

                        <button 
                            type="button"
                            className="btn btn-outline-secondary btn-sm"
                            disabled={currentPage === totalPages}
                            onClick={() => onPageChange(currentPage + 1)}
                        >
                            Siguiente
                            <i className="bi bi-chevron-right ms-1"></i>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ProductsTable;
