import { useEffect, useState } from "react";
import { adminRequest } from "./adminApi";


function Dashboard() {
  const [stats, setStats] = useState({
    shops: 0,
    activeShops: 0,
    pendingShops: 0,
    orders: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setError("");

      try {
        const [shopsResult, activeShopsResult, pendingShopsResult, ordersResult] =
          await Promise.all([
            adminRequest("/admin/shops", { params: { limit: 1 } }),
            adminRequest("/admin/shops", {
              params: { status: "active", limit: 1 },
            }),
            adminRequest("/admin/shops", {
              params: { status: "pending", limit: 1 },
            }),
            adminRequest("/admin/orders", { params: { limit: 1 } }),
          ]);

        setStats({
          shops: shopsResult.meta?.total || 0,
          activeShops: activeShopsResult.meta?.total || 0,
          pendingShops: pendingShopsResult.meta?.total || 0,
          orders: ordersResult.meta?.total || 0,
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
    </div>
  );
}

export default Dashboard;
