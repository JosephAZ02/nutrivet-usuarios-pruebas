import type { ReportTabItem, ReportType } from "../../interfaces/Report";
import ReportTab from "../molecules/ReportTab";

const TABS: ReportTabItem[] = [
    { id: "ventas-categoria", label: "Ventas por categoría" },
    { id: "ingresos-mensuales", label: "Ingresos mensuales" },
    { id: "productos-mas-vendidos", label: "Productos más vendidos" },
];

interface ReportTabsProps {
    activeReport: ReportType;
    onReportChange: (id: ReportType) => void;
}

function ReportTabs({ activeReport, onReportChange }: ReportTabsProps) {
    return (
        <section >

            <ReportTab tabs={TABS} activeId={activeReport} onChange={onReportChange} />
        </section >
    );
}
export default ReportTabs;