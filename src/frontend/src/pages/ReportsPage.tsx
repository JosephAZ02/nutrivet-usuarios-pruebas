import { useEffect, useState } from "react";
import type { ReportType } from "../interfaces/Report";
import { getReportCategorySales, getReportMonthlyIncome, getReportProductSales } from "../services/ReportService";
import ReportTabs from "../components/organism/ReportTabs";
import ReportResults from "../components/organism/ReportResults";
import { exportCsv } from "../utils/exportCsv";
import { exportPdf } from "../utils/exportPdf";
import Button from "../components/atoms/Button";
import Chart from "../utils/Chart";
import BartChar from "../utils/BarChart";
import "./ReportsPage.css";

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
        setRows([]);
        setHeaders([]);
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
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: 16,
                    padding: "20px 20px 0",
                    marginBottom: 40,
                }}
            >
                <div >
                    <h2 style={{ margin: 0, textAlign: "left", fontWeight: "bold" }}>
                        Reportes y estadísticas
                    </h2>
                    <h3 style={{
                        textAlign: "left", fontWeight: 400, fontSize: 16, color: "#6b7a74"
                    }}>
                        Resumen del año {new Date().getFullYear()}
                    </h3>
                </div>

                <div style={{ display: "flex", gap: 10 }}>
                    <Button type="button" onClick={handleExportCsv} disabled={loading || rows.length === 0}>
                        <i className="bi bi-download me-2" aria-hidden="true"></i>
                        Exportar CSV
                    </Button>
                    <Button type="button" variant="secondary" onClick={handleExportPdf} disabled={loading || rows.length === 0}>
                        <i className="bi bi-printer me-2" aria-hidden="true"></i>
                        Exportar PDF
                    </Button>
                </div>
            </div>

            <ReportTabs activeReport={activeReport} onReportChange={setActiveReport} />




            <div className={"card title-section"}>
                <h2>{activeReport == "productos-mas-vendidos" ? "Resumen de ingresos" : titles[activeReport]}</h2>
                <p>Resumen de los datos del año {new Date().getFullYear()}</p>
                <p>actualizados al {new Date().toLocaleDateString("es-CR")}, {new Date().toLocaleTimeString("es-CR")}</p>
            </div>



            <div className="report-actions-container">
                {loading ? (
                    <div className="d-flex flex-column justify-content-center align-items-center gap-2 w-100" role="status" aria-live="polite">
                        <div className="spinner-border text-primary" aria-hidden="true"></div>
                        <span className="text-primary">Cargando datos...</span>
                    </div>
                ) : activeReport === "productos-mas-vendidos" ? (
                    <BartChar
                        title={titles[activeReport]}
                        subtitle="Unidades vendidas por producto"
                        data={rows.slice(0, 5).map((row) => ({
                            label: String(row[1]),
                            value: Number(row[3]),
                        }))}
                    />
                ) : (
                    <div className="reports-chart">
                        <Chart data={rows.map((row) => ({ label: row[0], value: Number(row[1]) }))} type={activeReport === "ingresos-mensuales" ? "vertical" : "horizontal"} />
                    </div>
                )}
            </div>
            {error && <p>{error}</p>}
            {!loading && !error && (
                <ReportResults title={titles[activeReport]} headers={headers} rows={rows} />
            )}
        </div>


    );
}

export default ReportsPage;