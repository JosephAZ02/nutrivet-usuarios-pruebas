import { useEffect, useState } from "react";
import type Client from "../interfaces/Client";
import { addClient, deleteClient, getAllClients, updateClient } from "../services/ClientService";
import { useAuth } from "../context/AuthContext";
import { showConfirm, showError, showSuccess } from "../utils/alerts";
import Button from "../components/atoms/Button";
import Input from "../components/atoms/Input";
import Pagination from "../components/molecules/Pagination";
import ClientFormModal from "../components/organism/sales/ClientFormModal";

const PAGE_SIZE = 8; // clientes por página

export default function ClientsPage() {
  const { hasPermission } = useAuth();
  const canCreate = hasPermission("CLIENT_CREATE");
  const canUpdate = hasPermission("CLIENT_UPDATE");
  const canDelete = hasPermission("CLIENT_DELETE");

  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true); // true mientras se cargan los clientes
  const [searchText, setSearchText] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showForm, setShowForm] = useState(false); // ventana de crear o editar abierta
  const [editingClient, setEditingClient] = useState<Client | undefined>(undefined); // cliente que se edita (vacío al crear uno nuevo)
  const [saving, setSaving] = useState(false);

  // al abrir la pantalla se cargan los clientes
  useEffect(() => {
    async function loadClients() {
      try {
        setClients(await getAllClients());
      } catch (err: any) {
        showError(err, "No se pudieron cargar los clientes");
      } finally {
        setLoading(false);
      }
    }
    loadClients();
  }, []);

  // clientes que coinciden con el texto escrito, ordenados por nombre
  const text = searchText.trim().toLowerCase();
  const visibleClients = clients
    .filter((c) => {
      return (
        text === "" ||
        c.name.toLowerCase().includes(text) ||
        c.id.includes(text) ||
        c.phone.includes(text) ||
        (c.email ?? "").toLowerCase().includes(text)
      );
    })
    .sort((a, b) => a.name.localeCompare(b.name));

  // paginación: solo se muestran los clientes de la página actual
  const totalPages = Math.ceil(visibleClients.length / PAGE_SIZE);
  const page = Math.min(currentPage, Math.max(totalPages, 1));
  const pageClients = visibleClients.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // al cambiar el buscador se vuelve a la primera página
  function handleSearchChange(newText: string) {
    setSearchText(newText);
    setCurrentPage(1);
  }

  function handleNew() {
    setEditingClient(undefined);
    setShowForm(true);
  }

  function handleEdit(client: Client) {
    setEditingClient(client);
    setShowForm(true);
  }

  // guarda el cliente: si se está editando lo actualiza y si no lo crea
  async function handleSave(client: Client) {
    setSaving(true);

    try {
      if (editingClient === undefined) {
        const savedClient = await addClient(client);
        setClients([...clients, savedClient]);
        showSuccess("Cliente registrado", `${savedClient.name} se registró correctamente`);
      } else {
        const savedClient = await updateClient(client);
        setClients(clients.map((c) => (c.id === savedClient.id ? savedClient : c)));
        showSuccess("Cliente actualizado", `Los datos de ${savedClient.name} se actualizaron`);
      }
      setShowForm(false);
    } catch (err: any) {
      showError(err, editingClient === undefined ? "No se pudo registrar el cliente" : "No se pudo actualizar el cliente");
    } finally {
      setSaving(false);
    }
  }

  // elimina el cliente después de confirmar (el backend lo rechaza si tiene cuentas por cobrar)
  async function handleDelete(client: Client) {
    const confirmed = await showConfirm("¿Eliminar el cliente?", `<b>${client.name}</b><br>Cédula ${client.id}`, "Sí, eliminar");
    if (!confirmed) {
      return;
    }

    try {
      await deleteClient(client.id);
      setClients(clients.filter((c) => c.id !== client.id));
      showSuccess("Cliente eliminado", `${client.name} fue eliminado`);
    } catch (err: any) {
      showError(err, "No se pudo eliminar el cliente");
    }
  }

  return (
    <div className="p-4">
      <div className="d-flex justify-content-between align-items-start mb-4">
        <div>
          <small className="text-success fw-semibold text-uppercase">Ventas</small>
          <h1 className="h3 mb-1">Clientes</h1>
          <p className="text-muted mb-0">Administración de los clientes del negocio</p>
        </div>
        {canCreate && (
          <Button variant="success" onClick={handleNew}>
            <i className="bi bi-plus-lg me-2" aria-hidden="true"></i>
            Nuevo cliente
          </Button>
        )}
      </div>

      <div className="card p-3">
        <div className="row mb-3">
          <div className="col-12 col-md-6">
            <div className="input-group">
              <span className="input-group-text bg-white">
                <i className="bi bi-search" aria-hidden="true"></i>
              </span>
              <Input placeholder="Buscar por nombre, cédula, teléfono o correo..." value={searchText} onChange={(e) => handleSearchChange(e.target.value)} />
            </div>
          </div>
        </div>

        {loading && (
          <div className="text-center text-muted py-5">
            <div className="spinner-border text-success mb-2" role="status"></div>
            <p className="mb-0">Cargando clientes...</p>
          </div>
        )}

        {!loading && visibleClients.length === 0 && <p className="text-muted text-center py-4 mb-0">No hay clientes que coincidan.</p>}

        {!loading && visibleClients.length > 0 && (
          <>
            <div className="table-responsive">
              <table className="table align-middle">
                <thead>
                  <tr className="text-muted small text-uppercase">
                    <th>Nombre</th>
                    <th>Cédula</th>
                    <th>Teléfono</th>
                    <th>Correo</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {pageClients.map((client) => (
                    <tr key={client.id}>
                      <td className="fw-semibold">{client.name}</td>
                      <td>{client.id}</td>
                      <td>{client.phone}</td>
                      <td>{client.email ?? <span className="text-muted">—</span>}</td>
                      <td className="text-end text-nowrap">
                        {canUpdate && (
                          <button type="button" className="btn btn-outline-secondary btn-sm me-2" onClick={() => handleEdit(client)}>
                            Editar
                          </button>
                        )}
                        {canDelete && (
                          <button type="button" className="btn btn-outline-danger btn-sm" onClick={() => handleDelete(client)}>
                            Eliminar
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-3">
              <Pagination currentPage={page} totalPages={totalPages} onPageChange={setCurrentPage} />
            </div>
          </>
        )}
      </div>

      {showForm && <ClientFormModal client={editingClient} saving={saving} onSave={handleSave} onClose={() => setShowForm(false)} />}
    </div>
  );
}