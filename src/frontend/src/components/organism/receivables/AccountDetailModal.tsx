import type ReceivableAccount from "../../../interfaces/ReceivableAccount";
import type ClientInstallment from "../../../interfaces/ClientInstallment";
import { formatCurrency } from "../../../utils/formatCurrency";
import { statusLabel, statusVariant } from "../../../utils/accountStatus";
import Badge from "../../atoms/Badge";
import Button from "../../atoms/Button";

interface AccountDetailModalProps {
    account: ReceivableAccount; //cuenta que se muestra
    installments: ClientInstallment[]; //historial de abonos de la cuenta
    loading: boolean; //true mientras se cargan los abonos
    canRegister: boolean; //true si el usuario tiene permiso para registrar abonos
    onRegister: () => void; //abre la ventana para registrar un abono
    onClose: () => void; //se ejecuta al cerrar la ventana
}

// 2027-03-01 -> 01/03/2027
function formatDate(date: string | null): string {
    return date === null ? "Sin fecha" : date.split("-").reverse().join("/");
}

function AccountDetailModal({ account, installments, loading, canRegister, onRegister, onClose }: AccountDetailModalProps) {
    // porcentaje pagado de la venta, para la barra de progreso
    const percent = account.totalAmount > 0 ? Math.round((account.paidAmount / account.totalAmount) * 100) : 0;

    return (
        <div className="modal d-block" tabIndex={-1} role="dialog" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
            <div className="modal-dialog modal-dialog-centered modal-lg modal-dialog-scrollable">
                <div className="modal-content">

                    <div className="modal-header">
                        <h5 className="modal-title">Cuenta por cobrar · Factura {account.invoiceNumber}</h5>
                        <button type="button" className="btn-close" aria-label="Cerrar" onClick={onClose}></button>
                    </div>

                    <div className="modal-body">
                        <div className="d-flex justify-content-between align-items-start mb-3">
                            <div>
                                <div className="fw-semibold fs-5">{account.clientName}</div>
                                <small className="text-muted">Cédula {account.clientId}</small>
                            </div>
                            <Badge text={statusLabel(account.status)} variant={statusVariant(account.status)} />
                        </div>

                        <div className="row g-3 mb-3">
                            <div className="col-6 col-md-3">
                                <small className="text-muted d-block">Total de la venta</small>
                                <strong>{formatCurrency(account.totalAmount)}</strong>
                            </div>
                            <div className="col-6 col-md-3">
                                <small className="text-muted d-block">Pagado</small>
                                <strong>{formatCurrency(account.paidAmount)}</strong>
                            </div>
                            <div className="col-6 col-md-3">
                                <small className="text-muted d-block">Saldo pendiente</small>
                                <strong>{formatCurrency(account.balance)}</strong>
                            </div>
                            <div className="col-6 col-md-3">
                                <small className="text-muted d-block">Abono mensual</small>
                                <strong>{formatCurrency(account.monthlyInstallment)}</strong>
                            </div>
                        </div>

                        <div className="progress mb-1" role="progressbar" aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100}>
                            <div className="progress-bar bg-success" style={{ width: `${percent}%` }}></div>
                        </div>
                        <div className="d-flex justify-content-between mb-4">
                            <small className="text-muted">{percent}% pagado</small>
                            <small className="text-muted">Fecha límite: {formatDate(account.dueDate)}</small>
                        </div>

                        <h6>Historial de abonos</h6>

                        {loading && (
                            <div className="text-center text-muted py-4">
                                <div className="spinner-border spinner-border-sm text-success me-2" role="status"></div>
                                Cargando abonos...
                            </div>
                        )}

                        {!loading && installments.length === 0 && <p className="text-muted">Esta cuenta todavía no tiene abonos.</p>}

                        {!loading && installments.length > 0 && (
                            <>
                                <table className="table table-sm">
                                    <thead>
                                        <tr>
                                            <th>N°</th>
                                            <th>Fecha</th>
                                            <th className="text-end">Monto</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {installments.map((installment, index) => (
                                            <tr key={installment.id}>
                                                <td>{index + 1}</td>
                                                <td>{formatDate(installment.installmentDate)}</td>
                                                <td className="text-end">{formatCurrency(installment.amount)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                <small className="text-muted">Si la venta tuvo abono inicial, es el primero de la lista.</small>
                            </>
                        )}
                    </div>

                    <div className="modal-footer">
                        <Button variant="outline" onClick={onClose}>
                            Cerrar
                        </Button>
                        {canRegister && account.balance > 0 && (
                            <Button variant="success" onClick={onRegister}>
                                <i className="bi bi-cash-coin me-2" aria-hidden="true"></i>
                                Registrar abono
                            </Button>
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
}

export default AccountDetailModal;