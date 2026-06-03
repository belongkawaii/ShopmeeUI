import { useEffect, useState } from "react";

function Dashboard() {
  const [stats, setStats] = useState({
    shops: 0,
    orders: 0,
    users: 0,
    products: 0,
  });

  useEffect(() => {
    async function loadData() {
      try {
        const token = localStorage.getItem("token");

        const [shopsRes, ordersRes] = await Promise.all([
          fetch(
            "http://127.0.0.1:8000/api/v1/admin/shops",
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          ),
          fetch(
            "http://127.0.0.1:8000/api/v1/admin/orders",
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          ),
        ]);

        const shops = await shopsRes.json();
        const orders = await ordersRes.json();

        setStats({
          shops: shops.meta?.total || 0,
          orders: orders.meta?.total || 0,
          users: 0,
          products: 0,
        });
      } catch (error) {
        console.error("Lỗi Dashboard:", error);
      }
    }

    loadData();
  }, []);

  return (
    <div>
      <h1>Dashboard</h1>

      <div className="stats-grid">
        <div className="stat-card">
          <h3>{stats.shops}</h3>
          <p>Shops</p>
        </div>

        <div className="stat-card">
          <h3>{stats.orders}</h3>
          <p>Orders</p>
        </div>

        <div className="stat-card">
          <h3>{stats.users}</h3>
          <p>Users</p>
        </div>

        <div className="stat-card">
          <h3>{stats.products}</h3>
          <p>Products</p>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;