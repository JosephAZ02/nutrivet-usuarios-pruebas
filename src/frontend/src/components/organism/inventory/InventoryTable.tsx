import type InventoryMovement from "../../../interfaces/InventoryMovement";

interface InventoryTableProps {
  movements: InventoryMovement[];
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

function formatDate(date: string) {
  const [year, month, day] = date.split("-");
  return `${day}/${month}/${year.slice(-2)}`;
}

export default function InventoryTable({ movements, currentPage, totalPages, onPageChange, }: InventoryTableProps) {
  const maxVisiblePages = 8;
  const startPage = Math.max(1, Math.min(currentPage - Math.floor(maxVisiblePages / 2), totalPages - maxVisiblePages + 1));
  const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

  const pages = Array.from({ length: endPage - startPage + 1 }, (_, index) => startPage + index);

  return (
    <div className="table-responsive">
      <table className="table table-hover align-middle mb-0">
        <thead className="table-light">
          <tr>
            <th className="text-center">Fecha</th>
            <th className="text-center">Producto</th>
            <th className="text-center">Tipo de movimiento</th>
            <th className="text-center">Cantidad</th>
            <th className="text-center">Motivo</th>
            <th className="text-center">Factura</th>
          </tr>
        </thead>

        <tbody>
          {movements.length === 0 ? (
            <tr>
              <td colSpan={6} className="text-center py-4 text-muted">
                No hay movimientos de inventario registrados.
              </td>
            </tr>
          ) : (
            movements.map((movement) => (
              <tr key={movement.id}>
                <td className="text-center">
                  {formatDate(movement.movementDate)}
                </td>

                <td className="text-center">
                  <div className="fw-semibold">{movement.product.name}</div>
                  <small className="text-muted">
                    Código: {movement.product.code}
                  </small>
                </td>

                <td className="text-center">
                  <span
                    className={`badge ${movement.type === "ENTRADA"
                      ? "bg-success"
                      : "bg-danger"
                      }`}
                  >
                    {movement.type}
                  </span>
                </td>

                <td className="text-center">{movement.amount}</td>

                <td className="text-center">{movement.reason}</td>

                <td className="text-center">
                  {movement.invoiceNumber ?? "—"}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
      {totalPages > 1 && (
        <nav aria-label="Paginación de inventario" className="py-3">
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

            {pages.map((page) => (
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

            <li
              className={`page-item ${currentPage === totalPages ? "disabled" : ""
                }`}
            >
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