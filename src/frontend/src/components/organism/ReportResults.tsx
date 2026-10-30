
interface reportResultsProps {
    title: string; //titulo del reporte
    headers: string[]; //encabezados de la tabla
    rows: (string | number)[][]; //datos de la tabla
}

export const formatter = new Intl.NumberFormat("es-CR", {
    style: "currency",
    currency: "CRC",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
});

const isCurrencyValue = (header: string) =>
    /total vendido|ingresos|promedio de ingresos|Promedio de ingresos por factura/i.test(header);

function ReportResults({ headers, rows }: reportResultsProps) {
    return (
        <section className="report-results">

            <div className={`report-table-card ${headers[0] === "Categoría" ? "category-sales-table" : ""}`}>
                <table className="table table-striped table-hover">
                    <thead>
                        <tr>
                            {headers.map((header, index) => (
                                <th key={index}>{header}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((row, index) => (
                            <tr key={index}>
                                {row.map((cell, cellIndex) => (
                                    <td key={cellIndex}>
                                        {isCurrencyValue(headers[cellIndex]) && typeof cell === "number"
                                            ? formatter.format(cell)
                                            : cell}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </section>

    );


}
export default ReportResults;