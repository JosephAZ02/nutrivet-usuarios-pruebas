
import { useEffect, useState } from 'react';
import { getReportMonthlyIncome, getReportCategorySales, getReportProductSales } from '../services/ReportService';
import type { MonthlyIncome, CategorySales, ProductSales } from '../services/ReportService';
import { getCriticalStockProducts } from '../services/ProductService';
import { getAllInvoices } from '../services/SaleService';
import type Product from '../interfaces/Product';
import type Invoice from '../interfaces/Invoice';

import IncomeChart from '../components/organism/dashboard/IncomeChart';
import CategoryDonutChart from '../components/organism/dashboard/CategoryDonutChart';
import CriticalStockList from '../components/organism/dashboard/CriticalStockList';
import TopProductsList from '../components/organism/dashboard/TopProductsList';
import DashboardKpiCard from '../components/organism/dashboard/DashboardKpiCard';
import { Link } from 'react-router-dom';

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);

  const [incomeData, setIncomeData] = useState<MonthlyIncome[]>([]);
  const [categoryData, setCategoryData] = useState<CategorySales[]>([]);
  const [topProducts, setTopProducts] = useState<ProductSales[]>([]);
  const [criticalProducts, setCriticalProducts] = useState<Product[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [income, categories, top, critical, allInvoices] = await Promise.all([
          getReportMonthlyIncome(),
          getReportCategorySales(),
          getReportProductSales(),
          getCriticalStockProducts(),
          getAllInvoices()
        ]);

        setIncomeData(income || []);
        setCategoryData(categories || []);
        setTopProducts(top || []);
        setCriticalProducts(critical || []);
        setInvoices(allInvoices || []);
      } catch (err) {
        console.error("Error cargando el dashboard", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  if (loading) return <div className="spinner-border text-success mt-5" />;


  const mesActualNum = new Date().getMonth() + 1;
  const datosMesActual = incomeData.find(d => Number(d.month) === mesActualNum) || { total: 0, cantInvoices: 0 };



  const hoyString = new Date().toISOString().split('T')[0];


  const facturasDeHoy = invoices.filter(inv => inv.date.startsWith(hoyString));


  const ingresosDeHoy = facturasDeHoy.reduce((sum, inv) => sum + inv.total, 0);

  return (
    <div className="container-fluid px-0">
      <div className="d-flex justify-content-between align-items-end mb-4">
        <div>
          <h2 className="fw-bold mb-1">Bienvenido</h2>
          <p className="text-muted mb-0">Este es el estado de NutriVet hoy.</p>
        </div>
        <Link to="/new-sale" className="btn btn-success btn-lg d-flex align-items-center gap-2 px-3 py-3 fw-semibold shadow-sm">
          <i className="bi bi-plus-lg"></i> Nueva venta
        </Link>
      </div>

      <div className="row g-3 mb-4">
        <div className="col-12 col-md-6 col-lg-3">
          <div className="border rounded-3 bg-white shadow-sm h-100">
            <DashboardKpiCard
              title="Ingresos del mes"
              value={`₡${datosMesActual.total.toLocaleString()}`}
              icon={<i className="bi bi-graph-up-arrow fs-4"></i>}
              subtitle={`${datosMesActual.cantInvoices} facturas emitidas`}
            />
          </div>
        </div>

        <div className="col-12 col-md-6 col-lg-3">
          <div className="border rounded-3 bg-white shadow-sm h-100">
            <DashboardKpiCard
              title="Ingresos de Hoy"
              value={`₡${ingresosDeHoy.toLocaleString()}`}
              icon={<i className="bi bi-cash-stack fs-4"></i>}
              color="text-success"
              subtitle={`${facturasDeHoy.length} ventas realizadas`}
            />
          </div>
        </div>

        <div className="col-12 col-md-6 col-lg-3">
          <div className="border rounded-3 bg-white shadow-sm h-100">
            <DashboardKpiCard
              title="Facturas de Hoy"
              value={facturasDeHoy.length}
              icon={<i className="bi bi-receipt fs-4"></i>}
              color="text-primary"
              subtitle="Atendidas en caja"
            />
          </div>
        </div>

        <div className="col-12 col-md-6 col-lg-3">
          <div className="border rounded-3 bg-white shadow-sm h-100">
            <DashboardKpiCard
              title="Alertas de Stock"
              value={criticalProducts.length}
              icon={<i className="bi bi-exclamation-triangle fs-4"></i>}
              color="text-danger"
              subtitle="Productos críticos"
            />
          </div>
        </div>
      </div>

      <div className="row g-3 mb-3">
        <div className="col-12 col-lg-7">
          <div className="border rounded-3 p-2 bg-white shadow-sm">
            <IncomeChart data={incomeData} />
          </div>
        </div>

        <div className="col-12 col-lg-5">
          <Link to="/reports" className="text-decoration-none d-block h-100">
            <div className="border rounded-3 p-2 bg-white shadow-sm h-100">
              <CategoryDonutChart data={categoryData} />
            </div>
          </Link>
        </div>
      </div>

      <div className="row g-3">
        <div className="col-12 col-lg-6">
          <CriticalStockList products={criticalProducts} />
        </div>
        <div className="col-12 col-lg-6">
          <TopProductsList products={topProducts} />
        </div>
      </div>
    </div>
  );
}