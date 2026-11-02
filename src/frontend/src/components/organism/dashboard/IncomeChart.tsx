// src/components/organism/IncomeChart.tsx
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { MonthlyIncome } from '../../../services/ReportService';

export default function IncomeChart({ data }: { data: MonthlyIncome[] }) {
    const nombresMeses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

    const formattedData = data.map(item => ({
        ...item,
        
        name: nombresMeses[Number(item.month) - 1] || `Mes ${item.month}`,
        total: Number(item.total) || 0
    }));

    return (
        <div className="card shadow-sm border-0 h-100">
            <div className="card-body">
                <h5 className="fw-bold mb-4">Ingresos mensuales</h5>
                <div style={{ width: '100%', height: 300 }}>
                    <ResponsiveContainer>
                        <AreaChart data={formattedData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#198754" stopOpacity={0.8} />
                                    <stop offset="95%" stopColor="#198754" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6c757d' }} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6c757d' }} tickFormatter={(value) => `₡${value / 1000}k`} />
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e9ecef" />
                            <Tooltip
                                formatter={(value) => [
                                    `₡${Number(value ?? 0).toLocaleString('es-CR')}`,
                                    'Ingresos'
                                ]}
                            />
                            <Area type="monotone" dataKey="total" stroke="#198754" strokeWidth={3} fillOpacity={1} fill="url(#colorTotal)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}