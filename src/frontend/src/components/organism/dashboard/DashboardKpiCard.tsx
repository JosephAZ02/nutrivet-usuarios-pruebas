import type { ReactNode } from 'react';

interface Props {
    title: string;
    value: string | number;
    icon: ReactNode;
    subtitle?: string;
    color?: string;
}

export default function DashboardKpiCard({
    title,
    value,
    icon,
    subtitle,
    color = "text-success"
}: Props) {
    return (
        <div className="card shadow-sm border-0 h-100">
            <div className="card-body d-flex flex-column align-items-center text-center py-3">

                <div className={`rounded-circle bg-light ${color} d-flex align-items-center justify-content-center mb-2`}
                    style={{ width: '32px', height: '32px' }}>{icon}
                </div>
                <p className="text-muted mb-1 small fw-semibold">{title}</p>
                <h4 className="mb-0 fw-bold">{value}</h4>
                {subtitle && (
                    <small className="text-muted mt-1">{subtitle}</small>
                )}
            </div>
        </div>
    );
}