
import type { ReactNode } from 'react';

interface Props {
    title: string;
    value: string | number;
    icon: ReactNode;
    subtitle?: string;
    color?: string;
}

export default function DashboardKpiCard({ title, value, icon, subtitle, color = "text-success" }: Props) {
    return (
        <div className="card shadow-sm border-0 h-100">
            <div className="card-body d-flex align-items-center">
                <div className={`p-3 rounded-circle me-3 bg-light ${color}`}>
                    {icon}
                </div>
                <div>
                    <p className="text-muted mb-1 small fw-semibold">{title}</p>
                    <h4 className="mb-0 fw-bold">{value}</h4>
                    {subtitle && <small className="text-muted">{subtitle}</small>}
                </div>
            </div>
        </div>
    );
}