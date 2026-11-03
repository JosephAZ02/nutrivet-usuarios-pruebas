import type { InvoiceResponse } from "../interfaces/Sale";
import { BUSINESS } from "./invoiceBusinessInfo";
import { paymentLabel } from "./paymentLabel";

// caracteres por línea del ticket de 80 mm
const WIDTH = 48;


function toAscii(text: string): string {
    return text
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[¡¿]/g, "")
        .replace(/[\u00a0\u202f]/g, " ")
        .replace(/[^\x20-\x7E]/g, "?");
}


function money(amount: number): string {
    return "CRC " + toAscii(new Intl.NumberFormat("es-CR", { maximumFractionDigits: 2 }).format(amount));
}


function wrap(text: string): string[] {
    const lines: string[] = [];
    let current = "";

    for (const word of text.split(" ")) {
        if (current !== "" && current.length + 1 + word.length > WIDTH) {
            lines.push(current);
            current = word;
        } else {
            current = current === "" ? word : current + " " + word;
        }
    }
    lines.push(current);

    return lines;
}

// texto centrado en el ancho del ticket (si es largo, en varias líneas)
function center(text: string): string[] {
    return wrap(text).map((line) => " ".repeat(Math.floor((WIDTH - line.length) / 2)) + line);
}

// texto a la izquierda y monto a la derecha en la misma línea
function row(left: string, right: string): string {
    const spaces = WIDTH - left.length - right.length;
    if (spaces < 1) {
        return left + "\n" + " ".repeat(Math.max(WIDTH - right.length, 0)) + right;
    }
    return left + " ".repeat(spaces) + right;
}

// arma el ticket completo como texto plano
export function buildTicketText(invoice: InvoiceResponse): string {
    const line = "-".repeat(WIDTH);
    const date = toAscii(new Date(invoice.date).toLocaleString("es-CR"));
    const lines: string[] = [];

    lines.push(...center(toAscii(BUSINESS.name)));
    lines.push(...center(toAscii("Cod. juridica: " + BUSINESS.idNumber)));
    lines.push(...center(toAscii("Tel: " + BUSINESS.phone)));
    lines.push(...center(toAscii(BUSINESS.address)));

    lines.push(line);
    lines.push("Factura No. " + invoice.number);
    lines.push(date);
    lines.push(line);

    for (const item of invoice.items) {
        lines.push(...wrap(toAscii(item.productName)));
        lines.push(row(item.quantity + " x " + money(item.unitPrice), money(item.total)));
    }

    lines.push(line);
    lines.push(row("Subtotal", money(invoice.subtotal)));
    lines.push(row("IVA", money(invoice.tax)));
    lines.push(row("TOTAL", money(invoice.total)));

    lines.push(line);
    lines.push(row("Pago", toAscii(paymentLabel(invoice.paymentMethod))));
    if (invoice.paymentMethod === "EFECTIVO") {
        lines.push(row("Recibido", money(invoice.amountReceived)));
        lines.push(row("Vuelto", money(invoice.change)));
    }

    lines.push(line);
    lines.push(...center(toAscii("Comprobante interno, no válido como factura electrónica.")));
    lines.push(...center(toAscii("¡Gracias por su compra!")));

    return lines.join("\n");
}