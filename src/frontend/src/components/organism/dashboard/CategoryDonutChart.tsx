
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import type { CategorySales } from "../../../services/ReportService";

const COLORS = ['#198754', '#0d6efd', '#ffc107', '#dc3545', '#6c757d'];

export default function CategoryDonutChart({ data }: { data: CategorySales[] }) {
    return (
        <div className="card shadow-sm border-0 h-100">
            <div className="card-body">
                <h5 className="fw-bold mb-4">Ventas por categoría</h5>
                <div style={{ width: '100%', height: 300 }}>
                    <ResponsiveContainer>
                        <PieChart>
                            <Pie
                                data={data}
                                cx="50%"
                                cy="50%"
                                innerRadius={70}
                                outerRadius={100}
                                paddingAngle={5}
                                dataKey="total"
                                nameKey="category"
                            >
                                {data.map((_, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip formatter={(value) => [`₡${Number(value ?? 0).toLocaleString('es-CR')}`, 'Ingresos']} />
                            <Legend verticalAlign="bottom" height={36} iconType="circle" />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}