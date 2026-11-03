import { useEffect, useState } from "react";
import type Supplier from "../../interfaces/Supplier";
import type SupplierInvoice from "../../interfaces/SupplierInvoice";
import type SupplierInvoiceReview from "../../interfaces/SupplierInvoiceReview";

interface ModalReviewSupplierInvoiceProps {
    show: boolean;
    invoice: SupplierInvoice | null;
    supplier: Supplier | null;
    saving: boolean;
    onClose: () => void;
    onAccept: (review: SupplierInvoiceReview) => void;
    onReject: () => void;
}


const formatDate = (date: string) =>
    new Date(`${date}T00:00:00`).toLocaleDateString("es-CR", {
        day: "numeric",
        month: "short",
        year: "numeric",
    });

export function ModalReviewSupplierInvoice({
    show,
    invoice,
    supplier,
    saving,
    onClose,
    onAccept,
    onReject,
}: ModalReviewSupplierInvoiceProps) {
    const [condition, setCondition] = useState<"CASH" | "CREDIT">("CREDIT");
    const [period, setPeriod] = useState("30");
    const [dueDate, setDueDate] = useState("");

    useEffect(() => {
        if (show && invoice) {
            setCondition("CREDIT");
            setPeriod("30");
            setDueDate("");
        }
    }, [show, invoice]);

    if (!show || !invoice) return null;

    const calculatedDueDate = condition === "CASH"
        ? invoice.date
        : dueDate || (() => {
            const date = new Date(`${invoice.date}T00:00:00`);
            date.setDate(date.getDate() + Number(period));
            return date.toISOString().split("T")[0];
        })();

    const calculatedPeriod = condition === "CASH"
        ? 0
        : period === "custom"
            ? Math.ceil(
                (new Date(`${calculatedDueDate}T00:00:00`).getTime() -
                    new Date(`${invoice.date}T00:00:00`).getTime()) /
                (1000 * 60 * 60 * 24)
            )
            : Number(period);

    const handleAccept = () => {
        onAccept({
            condition,
            period: calculatedPeriod,
            dueDate: calculatedDueDate,
        });
    };

    return (
        <div className="modal fade show d-block" tabIndex={-1} style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content">
                    <div className="modal-header">
                        <div>
                            <span className="text-uppercase text-secondary small fw-semibold">Revisión de factura</span>
                            <h5 className="modal-title">Factura #{invoice.id}</h5>
                            <span className="text-secondary">{supplier?.name ?? "Proveedor no disponible"}</span>
                        </div>
                        <button type="button" className="btn-close" onClick={onClose} aria-label="Cerrar" />
                    </div>
                    <div className="modal-body">
                        <div className="row bg-light rounded-3 p-3 mb-4">
                            <div className="col-6">
                                <span className="text-secondary">Monto</span>
                                <strong className="d-block">₡{invoice.totalAmount.toLocaleString("es-CR", { minimumFractionDigits: 2 })}</strong>
                            </div>
                            <div className="col-6">
                                <span className="text-secondary">Fecha de emisión</span>
                                <strong className="d-block">{invoice.date}</strong>
                            </div>
                        </div>

                        <h6>Condición de pago</h6>
                        <div className="row g-2 mb-4">
                            <div className="col-6">
                                <label className="border rounded-3 p-3 w-100">
                                    <input
                                        className="form-check-input me-2"
                                        type="radio"
                                        checked={condition === "CASH"}
                                        onChange={() => setCondition("CASH")}
                                    />
                                    Contado
                                </label>
                            </div>
                            <div className="col-6">
                                <label className="border rounded-3 p-3 w-100">
                                    <input
                                        className="form-check-input me-2"
                                        type="radio"
                                        checked={condition === "CREDIT"}
                                        onChange={() => setCondition("CREDIT")}
                                    />
                                    Crédito
                                </label>
                            </div>
                        </div>

                        {condition === "CREDIT" && (
                            <>
                                <label htmlFor="invoice-period" className="form-label fw-semibold">Plazo indicado en la factura</label>

                                <div>{invoice.period} días</div>


                                {period === "custom" && (
                                    <input
                                        type="date"
                                        className="form-control mb-3"
                                        value={dueDate}
                                        onChange={(event) => setDueDate(event.target.value)}
                                        min={invoice.date}
                                        disabled={saving}
                                    />
                                )}
                            </>
                        )}

                        <div className="alert alert-success mb-0">
                            <p className="mb-0">
                                Al aceptar, quedará{" "}
                                <strong>{condition === "CASH" ? "pagada" : "pendiente de pago"}</strong>
                                {condition === "CREDIT" && (
                                    <> con vencimiento el <strong className="text-nowrap">{formatDate(calculatedDueDate)}</strong>.</>
                                )}
                            </p>
                        </div>
                    </div>
                    <div className="modal-footer justify-content-between">
                        <button type="button" className="btn btn-outline-danger" onClick={onReject} disabled={saving}>Rechazar factura</button>
                        <div>
                            <button type="button" className="btn btn-outline-secondary me-2" onClick={onClose} disabled={saving}>Cancelar</button>
                            <button type="button" className="btn btn-success" onClick={handleAccept} disabled={saving || (condition === "CREDIT" && period === "custom" && !dueDate)}>
                                {saving ? "Guardando..." : "Aceptar factura"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
