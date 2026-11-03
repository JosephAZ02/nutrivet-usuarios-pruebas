import { useEffect, useState } from "react";
import type ReceivableAccount from "../interfaces/ReceivableAccount";
import type ClientInstallment from "../interfaces/ClientInstallment";
import { addInstallment, getAccountInstallments, getAllAccounts } from "../services/ReceivableAccountService";
import { useAuth } from "../context/AuthContext";
import { showConfirm, showError, showSuccess } from "../utils/alerts";
import { formatCurrency } from "../utils/formatCurrency";
import { statusLabel, statusVariant } from "../utils/accountStatus";
import Badge from "../components/atoms/Badge";
import Input from "../components/atoms/Input";
import Pagination from "../components/molecules/Pagination";
import AccountDetailModal from "../components/organism/receivables/AccountDetailModal";
import InstallmentModal from "../components/organism/receivables/InstallmentModal";

const PAGE_SIZE = 8; 

const STATUS_FILTERS = ["Con saldo", "Pendientes", "Vencidas", "Pagadas", "Todas"];
const SORT_OPTIONS = ["Fecha límite", "Saldo (mayor primero)", "Cliente (A-Z)"];


function formatDate(date: string | null): string {
  return date === null ? "Sin fecha" : date.split("-").reverse().join("/");
}

export default function ReceivableAccountsPage() {
  const { hasPermission } = useAuth();
  const canRegister = hasPermission("INSTALLMENT_CREATE");

  const [accounts, setAccounts] = useState<ReceivableAccount[]>([]);
  const [loading, setLoading] = useState(true); 
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("Con saldo");
  const [sortBy, setSortBy] = useState("Fecha límite");
  const [currentPage, setCurrentPage] = useState(1);
  const [detailAccount, setDetailAccount] = useState<ReceivableAccount | null>(null); 
  const [installments, setInstallments] = useState<ClientInstallment[]>([]); 
  const [loadingInstallments, setLoadingInstallments] = useState(false);
  const [payAccount, setPayAccount] = useState<ReceivableAccount | null>(null); 
  const [saving, setSaving] = useState(false);

 
  useEffect(() => {
    async function loadAccounts() {
      try {
        setAccounts(await getAllAccounts());
      } catch (err: any) {
        showError(err, "No se pudieron cargar las cuentas por cobrar");
      } finally {
        setLoading(false);
      }
    }
    loadAccounts();
  }, []);


  let totalPending = 0;
  let totalOverdue = 0;
  let withBalance = 0;
  let overdueCount = 0;
  for (const account of accounts) {
    if (account.status !== "PAGADA") {
      totalPending = totalPending + account.balance;
      withBalance = withBalance + 1;
    }
    if (account.status === "VENCIDA") {
      totalOverdue = totalOverdue + account.balance;
      overdueCount = overdueCount + 1;
    }
  }

  // cuentas que se ven según el buscador y el filtro de estado
  const text = searchText.trim().toLowerCase();
  const filtered = accounts.filter((a) => {
    const matchesText =
      text === "" || a.clientName.toLowerCase().includes(text) || a.clientId.includes(text) || a.invoiceNumber.toLowerCase().includes(text);

    let matchesStatus = true;
    if (statusFilter === "Con saldo") {
      matchesStatus = a.status !== "PAGADA";
    } else if (statusFilter === "Pendientes") {
      matchesStatus = a.status === "PENDIENTE";
    } else if (statusFilter === "Vencidas") {
      matchesStatus = a.status === "VENCIDA";
    } else if (statusFilter === "Pagadas") {
      matchesStatus = a.status === "PAGADA";
    }

    return matchesText && matchesStatus;
  });

  // orden de la lista
  const visibleAccounts = [...filtered].sort((a, b) => {
    if (sortBy === "Saldo (mayor primero)") {
      return b.balance - a.balance;
    }
    if (sortBy === "Cliente (A-Z)") {
      return a.clientName.localeCompare(b.clientName);
    }
    // por fecha límite, la más próxima a vencer primero
    return (a.dueDate ?? "9999-12-31").localeCompare(b.dueDate ?? "9999-12-31");
  });

  // paginación: solo se muestran las cuentas de la página actual
  const totalPages = Math.ceil(visibleAccounts.length / PAGE_SIZE);
  const page = Math.min(currentPage, Math.max(totalPages, 1));
  const pageAccounts = visibleAccounts.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // al cambiar el buscador, el filtro o el orden se vuelve a la primera página
  function handleSearchChange(newText: string) {
    setSearchText(newText);
    setCurrentPage(1);
  }

  function handleStatusChange(newStatus: string) {
    setStatusFilter(newStatus);
    setCurrentPage(1);
  }

  function handleSortChange(newSort: string) {
    setSortBy(newSort);
    setCurrentPage(1);
  }

  // pide los abonos de una cuenta y los deja en el detalle
  async function loadInstallments(accountId: number) {
    setLoadingInstallments(true);
    try {
      setInstallments(await getAccountInstallments(accountId));
    } catch (err: any) {
      showError(err, "No se pudo cargar el historial de abonos");
    } finally {
      setLoadingInstallments(false);
    }
  }

  // abre el detalle de una cuenta con su historial
  function handleViewDetail(account: ReceivableAccount) {
    setDetailAccount(account);
    setInstallments([]);
    loadInstallments(account.id);
  }

  // registra el abono en el backend
  async function handleSaveInstallment(amount: number) {
    if (payAccount === null) {
      return;
    }

    const summary =
      `Cliente: <b>${payAccount.clientName}</b><br>` +
      `Abono: <b>${formatCurrency(amount)}</b><br>` +
      `Saldo después del abono: <b>${formatCurrency(payAccount.balance - amount)}</b>`;
    const confirmed = await showConfirm("¿Registrar el abono?", summary, "Sí, registrar");
    if (!confirmed) {
      return;
    }

    setSaving(true);

    try {
      const updated = await addInstallment(payAccount.id, amount);
      setAccounts(accounts.map((a) => (a.id === updated.id ? updated : a)));
      setPayAccount(null);

      // si el detalle de esa cuenta está abierto, se actualiza con el saldo y el historial nuevos
      if (detailAccount !== null && detailAccount.id === updated.id) {
        setDetailAccount(updated);
        loadInstallments(updated.id);
      }

      showSuccess("Abono registrado", `Nuevo saldo pendiente: ${formatCurrency(updated.balance)}`);
    } catch (err: any) {
      showError(err, "No se pudo registrar el abono");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="p-4">
      <small className="text-success fw-semibold text-uppercase">Finanzas</small>
      <h1 className="h3">Cuentas por cobrar</h1>
      <p className="text-muted mb-4">Seguimiento de ventas a crédito y abonos</p>

      <div className="card p-3 mb-4">
        <div className="row g-3 text-center text-md-start">
          <div className="col-6 col-md-3">
            <small className="text-muted d-block">Total pendiente</small>
            <strong className="fs-4">{formatCurrency(totalPending)}</strong>
          </div>
          <div className="col-6 col-md-3">
            <small className="text-muted d-block">Cuentas con saldo</small>
            <strong className="fs-4">{withBalance}</strong>
          </div>
          <div className="col-6 col-md-3">
            <small className="text-muted d-block">Monto vencido</small>
            <strong className="fs-4 text-danger">{formatCurrency(totalOverdue)}</strong>
          </div>
          <div className="col-6 col-md-3">
            <small className="text-muted d-block">Cuentas vencidas</small>
            <strong className="fs-4 text-danger">{overdueCount}</strong>
          </div>
        </div>
      </div>

      <div className="card p-3">
        <div className="row g-2 mb-3">
          <div className="col-12 col-md-6">
            <div className="input-group">
              <span className="input-group-text bg-white">
                <i className="bi bi-search" aria-hidden="true"></i>
              </span>
              <Input placeholder="Buscar por cliente, cédula o factura..." value={searchText} onChange={(e) => handleSearchChange(e.target.value)} />
            </div>
          </div>
          <div className="col-6 col-md-3">
            <select className="form-select" value={statusFilter} onChange={(e) => handleStatusChange(e.target.value)} aria-label="Filtrar por estado">
              {STATUS_FILTERS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
          <div className="col-6 col-md-3">
            <select className="form-select" value={sortBy} onChange={(e) => handleSortChange(e.target.value)} aria-label="Ordenar por">
              {SORT_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  Orden: {option}
                </option>
              ))}
            </select>
          </div>
        </div>

        {loading && (
          <div className="text-center text-muted py-5">
            <div className="spinner-border text-success mb-2" role="status"></div>
            <p className="mb-0">Cargando cuentas...</p>
          </div>
        )}

        {!loading && visibleAccounts.length === 0 && <p className="text-muted text-center py-4 mb-0">No hay cuentas por cobrar que coincidan.</p>}

        {!loading && visibleAccounts.length > 0 && (
          <>
            <div className="table-responsive">
              <table className="table align-middle">
                <thead>
                  <tr className="text-muted small text-uppercase">
                    <th>Cliente</th>
                    <th>Factura</th>
                    <th className="text-end">Total</th>
                    <th className="text-end">Saldo</th>
                    <th className="text-end">Abono mensual</th>
                    <th>Fecha límite</th>
                    <th>Estado</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {pageAccounts.map((account) => (
                    <tr key={account.id}>
                      <td>
                        <div className="fw-semibold">{account.clientName}</div>
                        <small className="text-muted">{account.clientId}</small>
                      </td>
                      <td>{account.invoiceNumber}</td>
                      <td className="text-end">{formatCurrency(account.totalAmount)}</td>
                      <td className="text-end fw-semibold">{formatCurrency(account.balance)}</td>
                      <td className="text-end">{formatCurrency(account.monthlyInstallment)}</td>
                      <td>{formatDate(account.dueDate)}</td>
                      <td>
                        <Badge text={statusLabel(account.status)} variant={statusVariant(account.status)} />
                      </td>
                      <td className="text-end text-nowrap">
                        <button type="button" className="btn btn-outline-secondary btn-sm me-2" onClick={() => handleViewDetail(account)}>
                          Ver detalle
                        </button>
                        {canRegister && account.balance > 0 && (
                          <button type="button" className="btn btn-success btn-sm" onClick={() => setPayAccount(account)}>
                            Abonar
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

      {detailAccount !== null && (
        <AccountDetailModal
          account={detailAccount}
          installments={installments}
          loading={loadingInstallments}
          canRegister={canRegister}
          onRegister={() => setPayAccount(detailAccount)}
          onClose={() => setDetailAccount(null)}
        />
      )}

      {payAccount !== null && <InstallmentModal account={payAccount} saving={saving} onSave={handleSaveInstallment} onClose={() => setPayAccount(null)} />}
    </div>
  );
}