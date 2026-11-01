interface InventoryStatsProps {totalMovements: number;totalEntries: number;totalExits: number;
}

export default function InventoryStats({totalMovements,totalEntries,totalExits,}: InventoryStatsProps) {
  return (
    <div className="row g-3 mb-4">
      <div className="col-md-4">
        <div className="card shadow-sm border-0 h-100">
          <div className="card-body">
            <h6 className="text-muted">Total de movimientos</h6>
            <h3 className="fw-bold mb-0">{totalMovements}</h3>
          </div>
        </div>
      </div>

      <div className="col-md-4">
        <div className="card shadow-sm border-0 h-100">
          <div className="card-body">
            <h6 className="text-muted">Entradas registradas</h6>
            <h3 className="fw-bold text-success mb-0">{totalEntries}</h3>
          </div>
        </div>
      </div>

      <div className="col-md-4">
        <div className="card shadow-sm border-0 h-100">
          <div className="card-body">
            <h6 className="text-muted">Salidas registradas</h6>
            <h3 className="fw-bold text-danger mb-0">{totalExits}</h3>
          </div>
        </div>
      </div>
    </div>
    
  );
}