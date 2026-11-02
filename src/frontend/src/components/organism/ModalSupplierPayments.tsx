import type SupplierInvoice from "../../interfaces/SupplierInvoice";
import type SupplierPayment from "../../interfaces/SupplierPayment";

interface ModalSupplierPaymentsProps {
    show: boolean;
    onClose: () => void;
    supplierInvoice: SupplierInvoice | null;
    payments: SupplierPayment[];
    loading: boolean;
}

export function ModalSupplierPayments({
    show,
    onClose,
    supplierInvoice,
    payments,
    loading,
}: ModalSupplierPaymentsProps) {
    if (!show || !supplierInvoice) return null;

    const formatCurrency = (amount: number) =>
        `₡${amount.toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        })}`;
    const totalPaid = payments.reduce((total, payment) => total + payment.amount, 0);
    const pendingAmount = Math.max(supplierInvoice.totalAmount - totalPaid, 0);

    return (
        <div className="modal fade show d-block" tabIndex={-1} style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">Pagos de la factura</h5>
                        <button
                            type="button"
                            className="btn-close"
                            aria-label="Cerrar"
                            onClick={onClose}
                        />
                    </div>
                    <div className="modal-body">
                        {loading ? (
                            <div className="d-flex justify-content-center align-items-center gap-2 text-primary py-4" role="status">
                                <span className="spinner-border spinner-border-sm" aria-hidden="true"></span>
                                <span>Cargando pagos...</span>
                            </div>
                        ) : payments.length === 0 ? (
                            <p className="text-center mb-0">No hay pagos registrados.</p>
                        ) : (
                            <div className="table-responsive">
                                <table className="table table-sm">
                                    <thead>
                                        <tr>
                                            <th>Fecha</th>
                                            <th>Monto</th>
                                            <th>Descripción</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {payments.map((payment) => (
                                            <tr key={payment.id}>
                                                <td>{payment.paymentDate}</td>
                                                <td>{formatCurrency(payment.amount)}</td>
                                                <td>{payment.description || "Sin descripción"}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot>
                                        <tr>
                                            <th colSpan={2} className="text-end">Total abonado:</th>
                                            <th>{formatCurrency(totalPaid)}</th>
                                        </tr>
                                        <tr>
                                            <th colSpan={2} className="text-end">Pendiente:</th>
                                            <th>{formatCurrency(pendingAmount)}</th>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        )}
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" onClick={onClose}>
                            Cerrar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
