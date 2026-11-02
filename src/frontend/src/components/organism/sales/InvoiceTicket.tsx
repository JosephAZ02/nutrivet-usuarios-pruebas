import type { InvoiceResponse } from "../../../interfaces/Sale";
import { BUSINESS } from "../../../utils/invoiceBusinessInfo";
import { formatCurrency } from "../../../utils/formatCurrency";
import { paymentLabel } from "../../../utils/paymentLabel";

interface InvoiceTicketProps {
    invoice: InvoiceResponse; //factura que se imprime
}

// versión compacta de la factura para impresoras de tickets de 80 mm (solo se ve al imprimir)
function InvoiceTicket({ invoice }: InvoiceTicketProps) {
    const date = new Date(invoice.date).toLocaleString("es-CR");
    const method = paymentLabel(invoice.paymentMethod);

    return (
        <div id="ticket-print">
            <div className="ticket-center">
                <strong>{BUSINESS.name}</strong>
                <div>Céd. jurídica: {BUSINESS.idNumber}</div>
                <div>Tel: {BUSINESS.phone}</div>
                <div>{BUSINESS.address}</div>
            </div>

            <hr className="ticket-line" />
            <div>Factura N° {invoice.number}</div>
            <div>{date}</div>
            <hr className="ticket-line" />

            {invoice.items.map((line) => (
                <div key={line.productId} className="ticket-item">
                    <div>{line.productName}</div>
                    <div className="ticket-row">
                        <span>{line.quantity} x {formatCurrency(line.unitPrice)}</span>
                        <span>{formatCurrency(line.total)}</span>
                    </div>
                </div>
            ))}

            <hr className="ticket-line" />
            <div className="ticket-row">
                <span>Subtotal</span>
                <span>{formatCurrency(invoice.subtotal)}</span>
            </div>
            <div className="ticket-row">
                <span>IVA</span>
                <span>{formatCurrency(invoice.tax)}</span>
            </div>
            <div className="ticket-row ticket-total">
                <span>TOTAL</span>
                <span>{formatCurrency(invoice.total)}</span>
            </div>

            <hr className="ticket-line" />
            <div className="ticket-row">
                <span>Pago</span>
                <span>{method}</span>
            </div>
            {invoice.paymentMethod === "EFECTIVO" && (
                <>
                    <div className="ticket-row">
                        <span>Recibido</span>
                        <span>{formatCurrency(invoice.amountReceived)}</span>
                    </div>
                    <div className="ticket-row">
                        <span>Vuelto</span>
                        <span>{formatCurrency(invoice.change)}</span>
                    </div>
                </>
            )}

            <hr className="ticket-line" />
            <div className="ticket-center ticket-small">
                Comprobante interno, no válido como factura electrónica.
                <div>¡Gracias por su compra!</div>
            </div>
        </div>
    );
}

export default InvoiceTicket;