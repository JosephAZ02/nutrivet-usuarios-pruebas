import { useEffect, useState } from "react";
import type Supplier from "../../interfaces/Supplier";
import type SupplierInvoice from "../../interfaces/SupplierInvoice";
import type { SupplierPaymentCreate } from "../../interfaces/SupplierPayment";
import Button from "../atoms/Button";

const currencyFormatter = new Intl.NumberFormat("es-CR", {
    style: "currency",
    currency: "CRC",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
});

interface ModalPaymentSupplierInvoiceProps {
    show: boolean;
    onClose: () => void;
    supplierInvoice: SupplierInvoice | null;
    supplier?: Supplier | null;
    onSave: (payment: SupplierPaymentCreate) => void;
    saving: boolean;
    message?: { type: string; text: string } | null;
}




export function ModalPaymentSupplierInvoice({
    show,
    onClose,
    supplierInvoice,
    supplier,
    onSave,
    saving,
    message,
}: ModalPaymentSupplierInvoiceProps) {
    const [amount, setAmount] = useState("");
    const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split("T")[0]);
    const [description, setDescription] = useState("");
    const [validationError, setValidationError] = useState("");

    useEffect(() => {
        if (show) {
            setAmount("");
            setPaymentDate(new Date().toISOString().split("T")[0]);
            setDescription("");
            setValidationError("");
        }
    }, [show, supplierInvoice]);

    if (!show || !supplierInvoice) return null;

    const handleSubmit = () => {
        const paymentAmount = Number(amount);

        if (!paymentAmount || paymentAmount <= 0) {
            setValidationError("El monto debe ser mayor que cero.");
            return;
        }

        if (paymentAmount > supplierInvoice.pendingAmount) {
            setValidationError("El monto no puede superar el total pendiente.");
            return;
        }

        if (!paymentDate) {
            setValidationError("La fecha del pago es obligatoria.");
            return;
        }

        onSave({
            amount: paymentAmount,
            paymentDate,
            description: description.trim(),
            idSupplierInvoice: supplierInvoice.id,
        });


    };

    return (
        <div className="modal fade show d-block" tabIndex={-1} style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">Registrar Pago</h5>
                        <button type="button" className="btn-close" aria-label="Cerrar" onClick={onClose} />
                    </div>
                    <div className="modal-body">
                        <div className="mb-3">
                            <h6>Factura del proveedor</h6>
                            <p><strong>Proveedor:</strong> {supplier?.name ?? "No disponible"}</p>
                            <p><strong>Fecha:</strong> {supplierInvoice.date}</p>
                            <p><strong>Total pendiente:</strong> {currencyFormatter.format(supplierInvoice.pendingAmount)}</p>
                        </div>

                        <div className="mb-3">
                            <label htmlFor="supplier-payment-amount" className="form-label">Monto a abonar</label>
                            <input
                                id="supplier-payment-amount"
                                type="text"
                                className="form-control"
                                inputMode="decimal"
                                placeholder={currencyFormatter.format(0)}
                                value={amount}
                                onChange={(event) => {
                                    const nextAmount = event.target.value
                                        .replace(/[^\d.,]/g, "")
                                        .replace(",", ".");

                                    if (/^\d*(\.\d{0,2})?$/.test(nextAmount)) {
                                        setAmount(nextAmount);
                                    }
                                }}
                                disabled={saving}
                            />
                        </div>

                        <div className="mb-3">
                            <label htmlFor="supplier-payment-date" className="form-label">Fecha del pago</label>
                            <input
                                id="supplier-payment-date"
                                type="date"
                                className="form-control"
                                value={paymentDate}
                                onChange={(event) => setPaymentDate(event.target.value)}
                                disabled={saving}
                            />
                        </div>

                        <div className="mb-3">
                            <label htmlFor="supplier-payment-description" className="form-label">Descripción</label>
                            <textarea
                                id="supplier-payment-description"
                                className="form-control"
                                rows={3}
                                value={description}
                                onChange={(event) => setDescription(event.target.value)}
                                disabled={saving}
                            />
                        </div>

                        {validationError && <div className="alert alert-danger py-2">{validationError}</div>}
                        {message && <div className={`alert alert-${message.type} py-2`}>{message.text}</div>}
                    </div>
                    <div className="modal-footer">
                        <Button type="button" variant="secondary" onClick={onClose} disabled={saving}>
                            Cancelar
                        </Button>
                        <Button type="button" onClick={handleSubmit} disabled={saving}>
                            {saving ? "Guardando..." : "Registrar pago"}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}