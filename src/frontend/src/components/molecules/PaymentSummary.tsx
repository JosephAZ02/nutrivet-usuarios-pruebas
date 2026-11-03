import type { PaymentMethod } from "../../interfaces/Sale";
import type CreditData from "../../interfaces/CreditData";
import Input from "../atoms/Input";
import { formatCurrency } from "../../utils/formatCurrency";

const methods: { label: string; value: PaymentMethod }[] = [
    { label: "Efectivo", value: "EFECTIVO" },
    { label: "Tarjeta", value: "TARJETA" },
    { label: "SINPE", value: "SINPE" },
    { label: "Crédito", value: "CREDITO" },
];

interface PaymentSummaryProps {
    total: number; 
    paymentMethod: PaymentMethod; 
    onMethodChange: (method: PaymentMethod) => void;
    amountReceived: string; 
    onAmountChange: (amount: string) => void; 
    creditData: CreditData | null; 
    creditClientName: string; 
    onConfigureCredit: () => void; 
}

function PaymentSummary({ total, paymentMethod, onMethodChange, amountReceived, onAmountChange, creditData, creditClientName, onConfigureCredit }: PaymentSummaryProps) {
    const received = Number(amountReceived);
    const isShort = amountReceived !== "" && received < total; //el monto no alcanza
    const change = amountReceived === "" || isShort ? 0 : received - total;

    return (
        <div>
            <label className="form-label text-muted small">Método de pago</label>
            <div className="d-flex gap-2 mb-3">
                {methods.map((method) => (
                    <button
                        key={method.label}
                        type="button"
                        className={`btn btn-sm flex-fill ${method.value === paymentMethod ? "btn-success" : "btn-outline-secondary"}`}
                        onClick={() => onMethodChange(method.value)}
                    >
                        {method.label}
                    </button>
                ))}
            </div>

            {paymentMethod === "EFECTIVO" && (
                <div className="row g-2">
                    <div className="col-7">
                        <label className="form-label text-muted small">Monto recibido</label>
                        <div className="input-group">
                            <span className="input-group-text">₡</span>
                            <Input type="number" placeholder="0" value={amountReceived} onChange={(e) => onAmountChange(e.target.value)} />
                        </div>
                    </div>
                    <div className="col-5">
                        <label className="form-label text-muted small">Vuelto</label>
                        <div className="form-control bg-light fw-bold">{formatCurrency(change)}</div>
                    </div>
                    {isShort && <small className="text-danger">El monto recibido es menor al total.</small>}
                </div>
            )}

            {paymentMethod === "SINPE" && (
                <small className="text-muted">Confirma que el pago SINPE ingresó antes de completar la venta.</small>
            )}

            {paymentMethod === "CREDITO" && creditData === null && (
                <button type="button" className="btn btn-outline-success w-100" onClick={onConfigureCredit}>
                    Configurar crédito
                </button>
            )}

            {paymentMethod === "CREDITO" && creditData !== null && (
                <div className="bg-light rounded-3 p-3 small">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                        <strong>{creditClientName}</strong>
                        <button type="button" className="btn btn-link btn-sm text-success text-decoration-none p-0" onClick={onConfigureCredit}>
                            Cambiar
                        </button>
                    </div>
                    <div className="d-flex justify-content-between">
                        <span className="text-muted">Abono inicial</span>
                        <span>{formatCurrency(creditData.initialPayment === "" ? 0 : Number(creditData.initialPayment))}</span>
                    </div>
                    <div className="d-flex justify-content-between">
                        <span className="text-muted">Saldo pendiente</span>
                        <span>{formatCurrency(total - (creditData.initialPayment === "" ? 0 : Number(creditData.initialPayment)))}</span>
                    </div>
                    <div className="d-flex justify-content-between">
                        <span className="text-muted">Abono mensual</span>
                        <span>{formatCurrency(Number(creditData.monthlyInstallment))}</span>
                    </div>
                    <div className="d-flex justify-content-between">
                        <span className="text-muted">Fecha límite</span>
                        <span>{creditData.dueDate.split("-").reverse().join("/")}</span>
                    </div>
                </div>
            )}
        </div>
    );
}

export default PaymentSummary;