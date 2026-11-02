import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { InvoiceResponse } from "../interfaces/Sale";
import { BUSINESS } from "./invoiceBusinessInfo";
import { paymentLabel } from "./paymentLabel";

// la fuente del PDF no tiene el símbolo ₡, por eso los montos se escriben con CRC
function money(amount: number): string {
  return "CRC " + clean(new Intl.NumberFormat("es-CR", { maximumFractionDigits: 2 }).format(amount));
}

// cambia los espacios especiales por espacios normales para que el PDF los dibuje bien
function clean(text: string): string {
  return text.replace(/\s/g, " ");
}

// genera y descarga la factura en PDF
export function exportInvoicePdf(invoice: InvoiceResponse): void {
  const doc = new jsPDF();

  // encabezado del negocio
  doc.setFontSize(14);
  doc.text(BUSINESS.name, 105, 16, { align: "center" });
  doc.setFontSize(10);
  doc.text(`Cédula jurídica: ${BUSINESS.idNumber}`, 105, 22, { align: "center" });
  doc.text(`Tel: ${BUSINESS.phone}`, 105, 27, { align: "center" });
  doc.text(BUSINESS.address, 105, 32, { align: "center" });

  // número y fecha
  doc.setFontSize(11);
  doc.text(`Factura N° ${invoice.number}`, 14, 44);
  doc.text(clean(new Date(invoice.date).toLocaleString("es-CR")), 196, 44, { align: "right" });

   // tabla de productos
  autoTable(doc, {
    head: [[
      "Código",
      "Descripción",
      { content: "Cant.", styles: { halign: "center" } },
      { content: "Precio unitario", styles: { halign: "right" } },
      { content: "Total", styles: { halign: "right" } },
    ]],
    body: invoice.items.map((line) => [
      line.productCode,
      line.productName,
      line.quantity,
      money(line.unitPrice),
      money(line.total),
    ]),
    startY: 49,
    columnStyles: { 2: { halign: "center" }, 3: { halign: "right" }, 4: { halign: "right" } },
  });

  // totales y pago, debajo de la tabla
  let y = (doc as any).lastAutoTable.finalY + 10;

  function addLine(label: string, value: string, bold = false) {
    doc.setFont("helvetica", bold ? "bold" : "normal");
    doc.text(label, 130, y);
    doc.text(value, 196, y, { align: "right" });
    y = y + 6;
  }

  addLine("Subtotal", money(invoice.subtotal));
  addLine("IVA", money(invoice.tax));
  addLine("Total", money(invoice.total), true);
  y = y + 4;
    addLine("Método de pago", paymentLabel(invoice.paymentMethod));
  if (invoice.paymentMethod === "EFECTIVO") {
    addLine("Monto recibido", money(invoice.amountReceived));
    addLine("Vuelto", money(invoice.change));
  }

  // leyenda final
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text("Comprobante interno, no válido como factura electrónica. ¡Gracias por su compra!", 105, y + 12, { align: "center" });

  doc.save(`Factura-${invoice.number}.pdf`);
}