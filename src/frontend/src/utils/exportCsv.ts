
export function exportCsv(//recibe el nombre del archivo, los encabezados y las filas de datos
    fileName: string,
    headers: string[],
    rows: (string | number)[][]
) {
    const escape = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`;//función para envolver cada valor en comillas 

    const csv = [headers, ...rows]
        .map((r) => r.map(escape).join(";"))
        .join("\n");//convierte los encabezados y las filas en una  cadena CSV

    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");//crea un elemento <a> para descargar el archivo CSV
    a.href = url;//establece la URL del archivo CSV como el href del enlace
    a.download = `${fileName}.csv`;
    a.click();
}
