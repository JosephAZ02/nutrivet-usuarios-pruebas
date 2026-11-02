// src/pages/DashboardPage.tsx
import { useEffect, useState } from 'react';

import { getReportMonthlyIncome, getReportCategorySales, getReportProductSales } from '../services/ReportService';
import type { MonthlyIncome, CategorySales, ProductSales } from '../services/ReportService';
import { getCriticalStockProducts } from '../services/ProductService';
import type Product from '../interfaces/Product';


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

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [income, categories, top, critical] = await Promise.all([
          getReportMonthlyIncome(),
          getReportCategorySales(),
          getReportProductSales(),
          getCriticalStockProducts()
        ]);

        setIncomeData(income || []);
        setCategoryData(categories || []);
        setTopProducts(top || []);
        setCriticalProducts(critical || []);
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
  const ticketPromedio = datosMesActual.cantInvoices > 0 ? datosMesActual.total / datosMesActual.cantInvoices : 0;

  return (
    <div className="container-fluid px-0">


      <div className="d-flex justify-content-between align-items-end mb-4">
        <div>
          <h2 className="fw-bold mb-1">Buenos días</h2>
          <p className="text-muted mb-0">Este es el estado de NutriVet hoy.</p>
        </div>

        <Link className="btn btn-success d-flex align-items-center gap-2" to="/new-sale">
          <i className="bi bi-plus-lg"></i> Nueva venta
        </Link>

      </div>


      <div className="row g-3 mb-4">
        <div className="col-12 col-md-6 col-lg-3">
          <DashboardKpiCard
            title="Ingresos del mes"
            value={`₡${datosMesActual.total.toLocaleString()}`}
            icon={<i className="bi bi-graph-up-arrow fs-4"></i>}
          />
        </div>
        <div className="col-12 col-md-6 col-lg-3">
          <DashboardKpiCard
            title="Facturas emitidas"
            value={datosMesActual.cantInvoices}
            icon={<i className="bi bi-receipt fs-4"></i>}
            color="text-primary"
          />
        </div>
        <div className="col-12 col-md-6 col-lg-3">
          <DashboardKpiCard
            title="Ticket promedio"
            value={`₡${Math.round(ticketPromedio).toLocaleString()}`}
            icon={<i className="bi bi-cash-coin fs-4"></i>}
            color="text-warning"
          />
        </div>
        <div className="col-12 col-md-6 col-lg-3">
          <DashboardKpiCard
            title="Alertas de Stock"
            value={criticalProducts.length}
            icon={<i className="bi bi-exclamation-triangle fs-4"></i>}
            color="text-danger"
            subtitle="Productos críticos"
          />
        </div>
      </div>


      <div className="row g-3 mb-4">
        <div className="col-12 col-lg-8">
          <IncomeChart data={incomeData} />
        </div>
        <div className="col-12 col-lg-4" >
          <Link to="/reports" className="col-12 col-lg-4 text-decoration-none">
            <CategoryDonutChart data={categoryData} />
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