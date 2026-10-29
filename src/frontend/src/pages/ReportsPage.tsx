import { useEffect, useState } from "react";
import type { ReportType } from "../interfaces/Report";
import { getReportCategorySales, getReportMonthlyIncome, getReportProductSales } from "../services/ReportService";
import ReportTabs from "../components/organism/ReportTabs";
import ReportResults from "../components/organism/ReportResults";
import { exportCsv } from "../utils/exportCsv";
import { exportPdf } from "../utils/exportPdf";
import Button from "../components/atoms/Button";
import { Route } from "react-router-dom";
import Chart from "../utils/Chart";

<Route path="/reportes" element={<ReportsPage />} />

function ReportsPage() {
    const [activeReport, setActiveReport] = useState<ReportType>("ventas-categoria");
    const [loading, setLoading] = useState(false);
    const [headers, setHeaders] = useState<string[]>([]);
    const [rows, setRows] = useState<(string | number)[][]>([]);
    const [error, setError] = useState("");




    const titles: Record<ReportType, string> = {
        "ventas-categoria": "Ventas por categoría",
        "ingresos-mensuales": "Ingresos mensuales",
        "productos-mas-vendidos": "Productos más vendidos",
    };

    useEffect(() => {
        setError("");
        let cancelled = false;
        setLoading(true);

        async function fetchData() {
            try {
                if (activeReport === "ventas-categoria") {

                    const data = await getReportCategorySales();
                    if (cancelled) return;
                    const total = data.reduce((sum, d) => sum + d.total, 0);


                    setHeaders(["Categoría", "Total vendido", "Porcentaje del total"]);
                    setRows(data.map((d) => [d.category, d.total, total > 0
                        ? `${((d.total / total) * 100).toFixed(1)}%`
                        : "0%",]));
                } else if (activeReport === "ingresos-mensuales") {

                    const data = await getReportMonthlyIncome();
                    if (cancelled) return;
                    setHeaders(["Mes", "Ingresos", "Cantidad de facturas", "Promedio de ingresos por factura"]);
                    setRows(data.map((d) => [d.month, d.total, d.cantInvoices, d.cantInvoices > 0 ? (d.total / d.cantInvoices) : "0"]));

                } else {

                    const data = await getReportProductSales();
                    if (cancelled) return;
                    setHeaders(["Posición", "Producto", "Categoría", "Volumen de ventas", "Ingresos generados"]);
                    setRows(data.map((d) => [d.position, d.product, d.category, d.volume, d.income]));
                }
            } catch (error) {
                if (!cancelled) {
                    console.error("Error al obtener los datos del reporte:", error);
                    setHeaders([]);
                    setRows([]);
                    setError("No se pudo cargar el reporte");
                }

            } finally {
                if (!cancelled) {
                    setLoading(false);
                }

            }
        }

        fetchData();
        return () => { cancelled = true; };
    }, [activeReport]);

    const handleExportCsv = () => {
        exportCsv(activeReport, headers, rows);
    };
    const handleExportPdf = () => {
        exportPdf(activeReport, titles[activeReport], headers, rows);
    };

    return (
        <div className="reports-page">

            <ReportTabs activeReport={activeReport} onReportChange={setActiveReport} />
            <div className="report-export-actions">
                <div className="title-section">
                    <span >AÑO ACTUAL</span>
                    <h2>{titles[activeReport]}</h2>

                </div>


                <div className="report-actions-container">
                    <Button type="button" onClick={handleExportCsv} disabled={loading || rows.length === 0}>
                        Exportar CSV
                    </Button>
                    <Button type="button" onClick={handleExportPdf} disabled={loading || rows.length === 0}>
                        Exportar PDF
                    </Button>
                    <div className="reports-chart">
                        <Chart data={activeReport === "productos-mas-vendidos" ? rows.slice(0, 5).map((row) => ({ label: row[1], value: Number(row[3]) })) : rows.map((row) => ({ label: row[0], value: Number(row[1]) }))} type={activeReport === "ingresos-mensuales" ? "vertical" : "horizontal"} currency={activeReport !== "productos-mas-vendidos"} />
                    </div>
                </div>
                {loading && <p>Cargando datos...</p>}
                {error && <p>{error}</p>}
                {!loading && !error && (
                    <ReportResults title={titles[activeReport]} headers={headers} rows={rows} />
                )}
            </div>
        </div>
    );
}

export default ReportsPage;