import { useState } from "react";
import type Client from "../../../interfaces/Client";
import type CreditData from "../../../interfaces/CreditData";
import { formatCurrency } from "../../../utils/formatCurrency";
import Button from "../../atoms/Button";
import Input from "../../atoms/Input";
import Label from "../../atoms/Label";

interface CreditModalProps {
    total: number; 
    clients: Client[]; 
    data: CreditData; 
    onChange: (data: CreditData) => void; 
    onNewClient: () => void; 
    onConfirm: () => void; 
    onClose: () => void; 
}

function CreditModal({ total, clients, data, onChange, onNewClient, onConfirm, onClose }: CreditModalProps) {
    const [search, setSearch] = useState("");

    // clientes que coinciden con la cédula o el nombre escrito
    const text = search.trim().toLowerCase();
    const visibleClients = clients.filter((c) => text === "" || c.id.includes(text) || c.name.toLowerCase().includes(text));

    const initial = data.initialPayment === "" ? 0 : Number(data.initialPayment);
    const monthly = Number(data.monthlyInstallment);
    const balance = total - initial;

    // fecha de hoy como AAAA-MM-DD para compararla con la fecha límite
    const now = new Date();
    const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

    // primer problema que impide confirmar (vacío si todo está bien)
    let problem = "";
    if (data.clientId === "") {
        problem = "Selecciona un cliente";
    } else if (initial < 0 || initial >= total) {
        problem = "El abono inicial debe ser menor al total";
    } else if (data.monthlyInstallment === "" || monthly <= 0) {
        problem = "Indica el abono mensual";
    } else if (monthly > balance) {
        problem = "El abono mensual no puede ser mayor al saldo pendiente";
    } else if (data.dueDate === "") {
        problem = "Indica la fecha límite de pago";
    } else if (data.dueDate <= today) {
        problem = "La fecha límite debe ser posterior a hoy";
    }

    const installments = problem === "" ? Math.ceil(balance / monthly) : 0;

    return (
        <div className="modal d-block" tabIndex={-1} role="dialog" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
            <div className="modal-dialog modal-dialog-centered modal-lg modal-dialog-scrollable">
                <div className="modal-content">

                    <div className="modal-header">
                        <h5 className="modal-title">Venta a crédito</h5>
                        <button type="button" className="btn-close" aria-label="Cerrar" onClick={onClose}></button>
                    </div>

                    <div className="modal-body">
                        <div className="row g-4">

                            <div className="col-md-6">
                                <div className="d-flex justify-content-between align-items-center mb-2">
                                    <strong>Cliente</strong>
                                    <button type="button" className="btn btn-link btn-sm text-success text-decoration-none" onClick={onNewClient}>
                                        <i className="bi bi-plus-lg me-1" aria-hidden="true"></i>
                                        Nuevo cliente
                                    </button>
                                </div>

                                <Input placeholder="Buscar por cédula o nombre" value={search} onChange={(e) => setSearch(e.target.value)} />

                                <div className="list-group mt-2" style={{ maxHeight: "260px", overflowY: "auto" }}>
                                    {visibleClients.length === 0 && <p className="text-muted small p-3 mb-0">No hay clientes que coincidan.</p>}
                                    {visibleClients.map((client) => (
                                        <button
                                            key={client.id}
                                            type="button"
                                            className={`list-group-item list-group-item-action ${client.id === data.clientId ? "border-success bg-success-subtle" : ""}`}
                                            onClick={() => onChange({ ...data, clientId: client.id })}
                                        >
                                            <div className="fw-semibold">{client.name}</div>
                                            <small className="text-muted">Cédula {client.id} · {client.phone}</small>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="col-md-6">
                                <div className="d-flex justify-content-between mb-3">
                                    <span className="text-muted">Total de la venta</span>
                                    <strong>{formatCurrency(total)}</strong>
                                </div>

                                <div className="mb-3">
                                    <Label text="Abono inicial (opcional)" />
                                    <div className="input-group">
                                        <span className="input-group-text">₡</span>
                                        <Input type="number" placeholder="0" value={data.initialPayment} onChange={(e) => onChange({ ...data, initialPayment: e.target.value })} />
                                    </div>
                                </div>

                                <div className="d-flex justify-content-between mb-3">
                                    <span className="text-muted">Saldo pendiente</span>
                                    <strong>{formatCurrency(balance > 0 ? balance : 0)}</strong>
                                </div>

                                <div className="mb-3">
                                    <Label text="Abono mensual" />
                                    <div className="input-group">
                                        <span className="input-group-text">₡</span>
                                        <Input type="number" placeholder="0" value={data.monthlyInstallment} onChange={(e) => onChange({ ...data, monthlyInstallment: e.target.value })} />
                                    </div>
                                </div>

                                <div className="mb-2">
                                    <Label text="Fecha límite de pago" />
                                    <Input type="date" value={data.dueDate} onChange={(e) => onChange({ ...data, dueDate: e.target.value })} />
                                </div>

                                {installments > 0 && (
                                    <small className="text-muted">
                                        Se terminaría de pagar en {installments === 1 ? "1 abono" : `${installments} abonos`} mensuales.
                                    </small>
                                )}
                            </div>

                        </div>
                    </div>

                    <div className="modal-footer">
                        {problem !== "" && <small className="text-muted me-auto">{problem}</small>}
                        <Button variant="outline" onClick={onClose}>
                            Cancelar
                        </Button>
                        <Button variant="success" disabled={problem !== ""} onClick={onConfirm}>
                            Confirmar crédito
                        </Button>
                    </div>

                </div>
            </div>
        </div>
    );
}

export default CreditModal;