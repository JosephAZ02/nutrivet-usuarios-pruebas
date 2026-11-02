import { useEffect, useState } from "react";
import Button from "../atoms/Button";
import Pagination from "../molecules/Pagination";

interface ReportResultsProps {
    title?: string;
    headers: string[];
    rows: (string | number)[][];
    loading?: boolean;
    invoiceIds?: number[];
    onPayment?: (invoiceId: number) => void;
    onViewPayments?: (invoiceId: number) => void;
    reviewInvoiceIds?: number[];
    onReview?: (invoiceId: number) => void;
}

export const formatter = new Intl.NumberFormat("es-CR", {
    style: "currency",
    currency: "CRC",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
});



const isCurrencyValue = (header: string) =>
    /total|saldo pendiente|ingresos|promedio de ingresos/i.test(header);

const getStatusBadgeClass = (status: string) => {
    switch (status.toLowerCase()) {
        case "pagada":
            return "text-bg-success";
        case "pendiente":
            return "text-bg-warning";
        case "vencida":
            return "text-bg-danger";
        case "cancelada":
            return "text-bg-secondary";
        case "por revisar":
            return "text-bg-info";
        default:
            return "text-bg-secondary";
    }
};

function ReportResults({ headers, rows, title, loading = false, invoiceIds, onPayment, onViewPayments, reviewInvoiceIds, onReview }: ReportResultsProps) {
    const rowsPerPage = 8;
    const [currentPage, setCurrentPage] = useState(1);
    const totalPages = Math.ceil(rows.length / rowsPerPage);
    const firstRowIndex = (currentPage - 1) * rowsPerPage;
    const paginatedRows = rows.slice(firstRowIndex, firstRowIndex + rowsPerPage);

    useEffect(() => {
        if (totalPages > 0 && currentPage > totalPages) {
            setCurrentPage(totalPages);
        }
    }, [currentPage, totalPages]);

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
                        {loading ? (
                            <tr>
                                <td colSpan={headers.length} className="text-center py-4">
                                    <div className="d-flex justify-content-center align-items-center gap-2 text-primary" role="status">
                                        <span className="spinner-border spinner-border-sm" aria-hidden="true"></span>
                                        <span>Cargando datos...</span>
                                    </div>
                                </td>
                            </tr>
                        ) : rows.length === 0 ? (
                            <tr>
                                <td colSpan={headers.length} className="text-center">
                                    No hay datos disponibles
                                </td>
                            </tr>
                        ) : paginatedRows.map((row, index) => {
                            const rowIndex = firstRowIndex + index;

                            return (
                                <tr key={rowIndex}>
                                    {row.map((cell, cellIndex) => (
                                        <td key={cellIndex}>
                                            {headers[cellIndex] === "Estado" && typeof cell === "string" ? (
                                                <span className={`badge rounded-pill ${getStatusBadgeClass(cell)} px-3 py-2`}>
                                                    {cell}
                                                </span>
                                            ) : isCurrencyValue(headers[cellIndex]) && typeof cell === "number"
                                                ? formatter.format(cell)
                                                : cell}
                                        </td>
                                    ))}
                                    {title === "Cuentas por pagar" && reviewInvoiceIds?.includes(invoiceIds?.[rowIndex] ?? 0) ? (
                                        <td className="text-nowrap">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                className="btn-sm px-3 py-1 border-warning text-warning-emphasis"
                                                onClick={() => onReview?.(invoiceIds?.[rowIndex] ?? 0)}
                                            >
                                                Revisar factura
                                            </Button>
                                        </td>
                                    ) : title === "Cuentas por pagar" && (
                                        <td>
                                            <div className="d-flex flex-wrap gap-2">
                                                <Button
                                                    type="button"
                                                    variant="success"
                                                    className="btn-sm px-3 py-1"
                                                    onClick={() => onPayment?.(invoiceIds?.[rowIndex] ?? 0)}
                                                >
                                                    Registrar pago
                                                </Button>

                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    className="btn-sm px-3 py-1 border-primary text-primary"
                                                    onClick={() => onViewPayments?.(invoiceIds?.[rowIndex] ?? 0)}
                                                >
                                                    Ver pagos
                                                </Button>
                                            </div>
                                        </td>
                                    )}

                                </tr>
                            );
                        })}

                    </tbody>
                </table>
                {!loading && rows.length > 0 && (
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                    />
                )}
            </div >
        </section >

    );


}
export default ReportResults;