import { useEffect, useMemo, useState } from "react";
import type Product from "../interfaces/Product";
import type InventoryMovement from "../interfaces/InventoryMovement";
import { getAllProducts } from "../services/ProductService";
import { getAllInventoryMovements, addInventoryMovement, } from "../services/InventoryMovementService";
import InventoryStats from "../components/organism/inventory/InventoryStats";
import InventoryTable from "../components/organism/inventory/InventoryTable";
import InventoryMovementModal from "../components/organism/inventory/InventoryModal";
import Swal from "sweetalert2";

export default function InventoryPage() {
  const [movements, setMovements] = useState<InventoryMovement[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [showModal, setShowModal] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("TODOS");
  const [currentPage, setCurrentPage] = useState(1);

  const movementsPerPage = 8;

  // cargar movimientos y productos
  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const [movementsData, productsData] = await Promise.all([
        getAllInventoryMovements(),
        getAllProducts(),
      ]);

      setMovements(movementsData);
      setProducts(productsData);
    } catch (err) {
      console.error(err);
      setError("No se pudo cargar la información del inventario.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // filtrar movimientos
  const filteredMovements = useMemo(() => {
    return movements.filter((movement) => {
      const search = searchTerm.toLowerCase().trim();
      const formattedDate = movement.movementDate.split("-").reverse().join("/");
      const shortDate = formattedDate.slice(0, 8);
      const matchesSearch =
        movement.product.name.toLowerCase().includes(search) ||
        movement.product.code.toLowerCase().includes(search) ||
        movement.movementDate.includes(search) ||
        formattedDate.includes(search) ||
        shortDate.includes(search);
      const matchesType =
        selectedType === "TODOS" || movement.type === selectedType;
      return matchesSearch && matchesType;
    })
      .sort((a, b) => {
        return b.movementDate.localeCompare(a.movementDate) || b.id - a.id;
      });
  }, [movements, searchTerm, selectedType]);

  // paginación
  const totalPages = Math.ceil(
    filteredMovements.length / movementsPerPage
  );

  const indexOfLastMovement = currentPage * movementsPerPage;
  const indexOfFirstMovement = indexOfLastMovement - movementsPerPage;

  const currentMovements = filteredMovements.slice(
    indexOfFirstMovement,
    indexOfLastMovement
  );

  // registrar una entrada
  const handleAddMovement = async (movement: {type: string;amount: number;reason: string;product: { id: number };idInvoice: number | null;}): Promise<boolean> => {
    try {
      setSaving(true);
      setError("");

      await addInventoryMovement(movement);
      Swal.fire({
        icon: "success",
        title: "Entrada registrada",
        text: "La entrada de inventario se ha registrado correctamente.",
        confirmButtonColor: "#198754",
      });

      setCurrentPage(1);

      await loadData();

      setShowModal(false);

      return true;
    } catch (err: any) {
      console.error(err);

      const errorMessage = err.response?.data;

      setError(
        typeof errorMessage === "string"
          ? errorMessage
          : "No se pudo registrar la entrada de inventario."
      );

      return false;
    } finally {
      setSaving(false);
    }
  };

  // estadísticas
  const totalEntries = movements.filter((movement) => movement.type === "ENTRADA").length;

  const totalExits = movements.filter((movement) => movement.type === "SALIDA").length;

  return (
    <div className="container-fluid py-4">
      {/* encabezado */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-1">Inventario</h2>
          <p className="text-muted mb-0">
            Historial de entradas y salidas de productos.
          </p>
        </div>
      </div>

      {/* Estadísticas */}
      <InventoryStats
        totalMovements={movements.length}
        totalEntries={totalEntries}
        totalExits={totalExits}
      />
      <div className="d-flex justify-content-end mb-3">
        <button
          className="btn btn-success"
          onClick={() => setShowModal(true)}
        >
          <i className="bi bi-plus-lg me-2"></i>
          Registrar entrada
        </button>
      </div>

      {/* mensaje de error */}
      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      {/* tabla e indicadores de búsqueda */}
      <div className="card shadow-sm border-0">
        <div className="card-body">
          <div className="row g-3 mb-4">
            <div className="col-md-8">
              <input
                type="text"
                className="form-control"
                placeholder="Buscar por nombre, código o fecha..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>

            <div className="col-md-4">
              <select
                className="form-select"
                value={selectedType}
                onChange={(e) => {
                  setSelectedType(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="TODOS">Todos los movimientos</option>
                <option value="ENTRADA">Entradas</option>
                <option value="SALIDA">Salidas</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Cargando...</span>
              </div>
              <p className="text-muted mt-2">
                Cargando movimientos de inventario...
              </p>
            </div>
          ) : (
            <>
              <InventoryTable movements={currentMovements} />

              {/* Paginación */}
              {filteredMovements.length > 0 && (
                <div className="d-flex justify-content-center align-items-center flex-wrap gap-3 mt-3">
                  <div className="d-flex justify-content-between align-items-center mt-4">
                    <div className="btn-group">
                      <button
                        className="btn btn-outline-secondary btn-sm"
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage((page) => page - 1)}
                      >
                        Anterior
                      </button>

                      <button className="btn btn-outline-secondary btn-sm" disabled>
                        {currentPage} / {totalPages}
                      </button>

                      <button
                        className="btn btn-outline-secondary btn-sm"
                        disabled={currentPage >= totalPages}
                        onClick={() => setCurrentPage((page) => page + 1)}
                      >
                        Siguiente
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* modal para registrar entradas */}
      <InventoryMovementModal
        products={products}
        show={showModal}
        saving={saving}
        onClose={() => setShowModal(false)}
        onSave={handleAddMovement}
      />
    </div>
  );
}