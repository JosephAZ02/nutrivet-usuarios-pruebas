import type { InvoiceResponse } from "../../../interfaces/Sale";
import { buildTicketText } from "../../../utils/ticketText";

interface InvoiceTicketProps {
    invoice: InvoiceResponse; //factura que se imprime
}

// versión en texto plano de la factura para impresoras de tickets de 80 mm (solo se ve al imprimir)
function InvoiceTicket({ invoice }: InvoiceTicketProps) {
    return <pre id="ticket-print">{buildTicketText(invoice)}</pre>;
}

export default InvoiceTicket;