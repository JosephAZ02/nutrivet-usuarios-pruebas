import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export function exportPdf(//recibe el nombre del archivo, el título, los encabezados y las filas de datos
    fileName: string,
    title: string,
    headers: string[],
    rows: (string | number)[][],
): void {
    const doc = new jsPDF();//crea un nuevo documento PDF

    doc.text(title, 14, 15);
    autoTable(doc, {//agrega una tabla al documento PDF
        head: [headers],
        body: rows,
        startY: 22,
    });
    doc.save(`${fileName}.pdf`);
}
