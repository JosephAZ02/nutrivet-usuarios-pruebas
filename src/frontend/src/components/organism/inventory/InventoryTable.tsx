import type InventoryMovement from "../../../interfaces/InventoryMovement";

interface InventoryTableProps {
  movements: InventoryMovement[];
}

function formatDate(date: string) {
  const [year, month, day] = date.split("-");
  return `${day}/${month}/${year.slice(-2)}`;
}

export default function InventoryTable({ movements }: InventoryTableProps) {
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
                    className={`badge ${
                      movement.type === "ENTRADA"
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
                  {movement.idInvoice ?? "—"}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
    
  );
}