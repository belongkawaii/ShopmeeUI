import { useEffect, useState } from "react";
import { adminRequest } from "./adminApi";

const currencyFormat = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
  maximumFractionDigits: 0,
});

function formatCurrency(value) {
  return currencyFormat.format(value || 0);
}

function Dashboard() {
  const [stats, setStats] = useState({
    shops: 0,
    activeShops: 0,
    pendingShops: 0,
    orders: 0,
    totalRevenue: 0,
    totalCommission: 0,
    totalOrdersCompleted: 0,
    totalProductsSold: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setError("");

      try {
        const [shopsResult, activeShopsResult, pendingShopsResult, ordersResult, revenueResult] =
          await Promise.all([
            adminRequest("/admin/shops", { params: { limit: 1 } }),
            adminRequest("/admin/shops", {
              params: { status: "active", limit: 1 },
            }),
            adminRequest("/admin/shops", {
              params: { status: "pending", limit: 1 },
            }),
            adminRequest("/admin/orders", { params: { limit: 1 } }),
            adminRequest("/admin/revenue"),
          ]);

        setStats({
          shops: shopsResult.meta?.total || 0,
          activeShops: activeShopsResult.meta?.total || 0,
          pendingShops: pendingShopsResult.meta?.total || 0,
          orders: ordersResult.meta?.total || 0,
          totalRevenue: revenueResult.data?.total_revenue || 0,
          totalCommission: revenueResult.data?.total_admin_commission || 0,
          totalOrdersCompleted: revenueResult.data?.total_orders_completed || 0,
          totalProductsSold: revenueResult.data?.total_products_sold || 0,
        });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const statCards = [
    {
      label: "Tổng shop",
      value: stats.shops,
      tone: "blue",
    },
    {
      label: "Shop hoạt động",
      value: stats.activeShops,
      tone: "green",
    },
    {
      label: "Shop chờ duyệt",
      value: stats.pendingShops,
      tone: "amber",
    },
    {
      label: "Tổng đơn hàng",
      value: stats.orders,
      tone: "rose",
    },
  ];

  const [activeChart, setActiveChart] = useState("total");

  const startYear = new Date().getMonth() >= 5 ? new Date().getFullYear() : new Date().getFullYear() - 1;
  const startDate = new Date(startYear, 5, 1);
  const currentDate = new Date();

  const revenueMonths = [];
  const buildDate = new Date(startDate);
  while (buildDate <= currentDate) {
    revenueMonths.push(new Date(buildDate));
    buildDate.setMonth(buildDate.getMonth() + 1);
  }

  const formatMonthLabel = (date) => {
    const month = date.getMonth() + 1;
    const year = String(date.getFullYear()).slice(-2);
    return `${month}/${year}`;
  };

  const monthlyTotalRevenue = revenueMonths.map((_, index) =>
    Math.round(stats.totalRevenue * ((index + 1) / revenueMonths.length))
  );
  const monthlyAdminRevenue = revenueMonths.map((_, index) =>
    Math.round(stats.totalCommission * ((index + 1) / revenueMonths.length))
  );

  const activeValues = activeChart === "admin" ? monthlyAdminRevenue : monthlyTotalRevenue;
  const maxValue = Math.max(...activeValues);
  const valueMax = maxValue > 0 ? maxValue : 1;
  const svgWidth = 600;
  const svgHeight = 260;
  const chartPadding = 40;
  const chartWidth = svgWidth - chartPadding * 2;
  const chartHeight = svgHeight - chartPadding * 2;

  const linePoints = activeValues.map((value, index) => {
    const x = chartPadding + (chartWidth * index) / Math.max(revenueMonths.length - 1, 1);
    const y = chartPadding + chartHeight * (1 - value / valueMax);
    return `${x},${y}`;
  });

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <span className="admin-eyebrow">Tổng quan</span>
          <h1>Dashboard</h1>
        </div>
      </div>

      {error && <div className="admin-alert error">{error}</div>}

      <div className="stats-grid">
        {statCards.map((item) => (
          <div className={`stat-card ${item.tone}`} key={item.label}>
            <span>{item.label}</span>
            <strong>{loading ? "..." : item.value}</strong>
          </div>
        ))}
      </div>

      <div className="admin-panel">
        <div className="admin-panel-header">
          <div>
            <h2>Trạng thái hệ thống</h2>
          </div>
        </div>

        <div className="admin-summary-list">
          <div>
            <span>Shop đang chờ xử lý</span>
            <strong>{loading ? "..." : stats.pendingShops}</strong>
          </div>
          <div>
            <span>Tỷ lệ shop hoạt động</span>
            <strong>
              {loading || stats.shops === 0
                ? "0%"
                : `${Math.round((stats.activeShops / stats.shops) * 100)}%`}
            </strong>
          </div>
          <div>
            <span>Đơn hàng ghi nhận</span>
            <strong>{loading ? "..." : stats.orders}</strong>
          </div>
        </div>
      </div>

      <div className="admin-panel admin-revenue-panel">
        <div className="admin-panel-header">
          <div>
            <h2>Doanh thu toàn sàn</h2>
            <p>So sánh doanh thu toàn sàn và doanh thu admin theo VND.</p>
          </div>
        </div>

        <div className="admin-summary-list admin-revenue-grid">
          <div>
            <span>Tổng doanh thu</span>
            <strong>{loading ? "..." : formatCurrency(stats.totalRevenue)}</strong>
          </div>
          <div>
            <span>Doanh thu admin</span>
            <strong>{loading ? "..." : formatCurrency(stats.totalCommission)}</strong>
          </div>
          <div>
            <span>Đơn hàng hoàn tất</span>
            <strong>{loading ? "..." : stats.totalOrdersCompleted}</strong>
          </div>
        </div>

      </div>
    </div>
  );
}

export default Dashboard;
