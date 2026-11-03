import { useState } from "react";
import type ReceivableAccount from "../../../interfaces/ReceivableAccount";
import { formatCurrency } from "../../../utils/formatCurrency";
import Button from "../../atoms/Button";
import Input from "../../atoms/Input";
import Label from "../../atoms/Label";

interface InstallmentModalProps {
    account: ReceivableAccount; 
    saving: boolean; 
    onSave: (amount: number) => void; 
    onClose: () => void; 
}

function InstallmentModal({ account, saving, onSave, onClose }: InstallmentModalProps) {
    // el monto empieza con el abono mensual acordado 
    const [amount, setAmount] = useState(String(Math.min(account.monthlyInstallment, account.balance)));

    const value = Number(amount);

    // primer problema que impide registrar el abono
    let problem = "";
    if (amount === "" || value <= 0) {
        problem = "Indica el monto del abono";
    } else if (Number(value.toFixed(2)) !== value) {
        problem = "El monto solo puede tener hasta 2 decimales";
    } else if (value > account.balance) {
        problem = "El abono no puede ser mayor al saldo pendiente";
    }

    const newBalance = problem === "" ? account.balance - value : account.balance;

    return (
        <div className="modal d-block" tabIndex={-1} role="dialog" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content">

                    <div className="modal-header">
                        <h5 className="modal-title">Registrar abono</h5>
                        <button type="button" className="btn-close" aria-label="Cerrar" onClick={onClose}></button>
                    </div>

                    <div className="modal-body">
                        <div className="mb-3">
                            <div className="fw-semibold">{account.clientName}</div>
                            <small className="text-muted">Cédula {account.clientId} · Factura {account.invoiceNumber}</small>
                        </div>

                        <div className="bg-light rounded-3 p-3 mb-3">
                            <div className="d-flex justify-content-between">
                                <span className="text-muted">Saldo pendiente</span>
                                <strong>{formatCurrency(account.balance)}</strong>
                            </div>
                            <div className="d-flex justify-content-between">
                                <span className="text-muted">Abono mensual acordado</span>
                                <span>{formatCurrency(account.monthlyInstallment)}</span>
                            </div>
                        </div>

                        <div className="mb-2">
                            <Label text="Monto del abono" />
                            <div className="input-group">
                                <span className="input-group-text">₡</span>
                                <Input type="number" placeholder="0" value={amount} onChange={(e) => setAmount(e.target.value)} autoFocus />
                            </div>
                        </div>

                        <div className="d-flex gap-2 mb-3">
                            <button type="button" className="btn btn-outline-success btn-sm" onClick={() => setAmount(String(Math.min(account.monthlyInstallment, account.balance)))}>
                                Abono mensual
                            </button>
                            <button type="button" className="btn btn-outline-success btn-sm" onClick={() => setAmount(String(account.balance))}>
                                Pagar todo el saldo
                            </button>
                        </div>

                        <div className="d-flex justify-content-between border-top pt-2">
                            <span className="text-muted">Saldo después del abono</span>
                            <strong>{formatCurrency(newBalance)}</strong>
                        </div>
                    </div>

                    <div className="modal-footer">
                        {problem !== "" && <small className="text-muted me-auto">{problem}</small>}
                        <Button variant="outline" onClick={onClose} disabled={saving}>
                            Cancelar
                        </Button>
                        <Button variant="success" disabled={problem !== "" || saving} onClick={() => onSave(value)}>
                            {saving ? "Registrando..." : "Registrar abono"}
                        </Button>
                    </div>

                </div>
            </div>
        </div>
    );
}

export default InstallmentModal;