interface ProductsStatsProps {
  totalProducts: number;
  criticalStockCount: number;
  movementsTodayCount: number;
}

export default function ProductsStats({
  totalProducts,
  criticalStockCount,
  movementsTodayCount,
}: ProductsStatsProps) {
  return (
    <div className="row g-3 mt-3 mb-4 mx-1">

      {/* productos activos */}
      <div className="col-md-4">
        <div className="card border-0 shadow-sm rounded-4 p-3 h-100">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <p className="text-muted mb-1">Productos activos</p>
              <h3 className="fw-bold mb-0">{totalProducts}</h3>
            </div>
            <i className="bi bi-box-seam fs-2 text-success"></i>
          </div>
        </div>
      </div>

      {/* stock crítico */}
      <div className="col-md-4">
        <div className="card border-0 shadow-sm rounded-4 p-3 h-100">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <p className="text-muted mb-1">Stock crítico</p>
              <h3 className="fw-bold mb-0">{criticalStockCount}</h3>
            </div>
            <i className="bi bi-exclamation-triangle fs-2 text-warning"></i>
          </div>
        </div>
      </div>

      {/* movimientos de hoy */}
      <div className="col-md-4">
        <div className="card border-0 shadow-sm rounded-4 p-3 h-100">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <p className="text-muted mb-1">Movimientos hoy</p>
              <h3 className="fw-bold mb-0">{movementsTodayCount}</h3>
            </div>
            <i className="bi bi-arrow-left-right fs-2 text-primary"></i>
          </div>
        </div>
      </div>

    </div>
  );
}