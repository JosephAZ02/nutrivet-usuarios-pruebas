
export type ReportType =
    | "ventas-categoria"
    | "ingresos-mensuales"
    | "productos-mas-vendidos";

export interface ReportTabItem {
    id: ReportType;
    label: string;
}