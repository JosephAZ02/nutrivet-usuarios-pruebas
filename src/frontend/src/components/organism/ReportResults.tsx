

interface reportResultsProps {
    title: string; //titulo del reporte
    headers: string[]; //encabezados de la tabla
    rows: (string | number)[][]; //datos de la tabla
}

function ReportResults({ title, headers, rows }: reportResultsProps) {
    return (
        <section className="report-results">
            <h2>{title}</h2>
            <table className="table">
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
                                <td key={cellIndex}>{cell}</td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </section>

    );


}
export default ReportResults;