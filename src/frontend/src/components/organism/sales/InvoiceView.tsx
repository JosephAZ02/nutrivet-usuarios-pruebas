import type { InvoiceResponse } from "../../../interfaces/Sale";
import { BUSINESS } from "../../../utils/invoiceBusinessInfo";
import { formatCurrency } from "../../../utils/formatCurrency";
import { paymentLabel } from "../../../utils/paymentLabel";

interface InvoiceViewProps {
    invoice: InvoiceResponse; 
}

function InvoiceView({ invoice }: InvoiceViewProps) {
    const date = new Date(invoice.date).toLocaleString("es-CR");
    const method = paymentLabel(invoice.paymentMethod);

    return (
        <div id="invoice-print">
            <div className="text-center mb-3">
                <h2 className="h5 mb-1">{BUSINESS.name}</h2>
                <small className="d-block">Cédula jurídica: {BUSINESS.idNumber}</small>
                <small className="d-block">Tel: {BUSINESS.phone}</small>
                <small className="d-block">{BUSINESS.address}</small>
            </div>

            <div className="d-flex justify-content-between border-top border-bottom py-2 mb-3">
                <span><strong>Factura N° {invoice.number}</strong></span>
                <span>{date}</span>
            </div>

            <table className="table table-sm">
                <thead>
                    <tr>
                        <th>Código</th>
                        <th>Descripción</th>
                        <th className="text-end">Cant.</th>
                        <th className="text-end">Precio unitario</th>
                        <th className="text-end">Total</th>
                    </tr>
                </thead>
                <tbody>
                    {invoice.items.map((line) => (
                        <tr key={line.productId}>
                            <td>{line.productCode}</td>
                            <td>{line.productName}</td>
                            <td className="text-end">{line.quantity}</td>
                            <td className="text-end">{formatCurrency(line.unitPrice)}</td>
                            <td className="text-end">{formatCurrency(line.total)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <div className="ms-auto" style={{ maxWidth: "260px" }}>
                <div className="d-flex justify-content-between">
                    <span>Subtotal</span>
                    <span>{formatCurrency(invoice.subtotal)}</span>
                </div>
                <div className="d-flex justify-content-between">
                    <span>IVA</span>
                    <span>{formatCurrency(invoice.tax)}</span>
                </div>
                <div className="d-flex justify-content-between border-top mt-1 pt-1">
                    <strong>Total</strong>
                    <strong>{formatCurrency(invoice.total)}</strong>
                </div>

                <div className="d-flex justify-content-between mt-3">
                    <span>Método de pago</span>
                    <span>{method}</span>
                </div>
                {invoice.paymentMethod === "EFECTIVO" && (
                    <>
                        <div className="d-flex justify-content-between">
                            <span>Monto recibido</span>
                            <span>{formatCurrency(invoice.amountReceived)}</span>
                        </div>
                        <div className="d-flex justify-content-between">
                            <span>Vuelto</span>
                            <span>{formatCurrency(invoice.change)}</span>
                        </div>
                    </>
                )}
            </div>

            <p className="text-center text-muted small mt-4 mb-0">
                Comprobante interno, no válido como factura electrónica. ¡Gracias por su compra!
            </p>
        </div>
    );
}

export default InvoiceView;