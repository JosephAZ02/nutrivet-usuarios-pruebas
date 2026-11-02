import type { PaymentMethod } from "../../interfaces/Sale";
import Input from "../atoms/Input";
import { formatCurrency } from "../../utils/formatCurrency";


const methods: { label: string; value: PaymentMethod | null }[] = [
    { label: "Efectivo", value: "EFECTIVO" },
    { label: "Tarjeta", value: "TARJETA" },
    { label: "SINPE", value: "SINPE" },
    { label: "Crédito", value: null },
];

interface PaymentSummaryProps {
    total: number;
    paymentMethod: PaymentMethod;
    onMethodChange: (method: PaymentMethod) => void;
    amountReceived: string; //monto que entrega el cliente
    onAmountChange: (amount: string) => void; //se ejecuta al escribir el monto
}

function PaymentSummary({ total, paymentMethod, onMethodChange, amountReceived, onAmountChange }: PaymentSummaryProps) {
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
                        disabled={method.value === null}
                        className={`btn btn-sm flex-fill ${method.value === paymentMethod ? "btn-success" : "btn-outline-secondary"}`}
                        onClick={() => method.value !== null && onMethodChange(method.value)}
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
        </div>
    );
}

export default PaymentSummary;