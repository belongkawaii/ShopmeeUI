import { useState, useEffect } from "react";
import { getSellerDashboardRevenue, getSellerProducts } from "./sellerApi";
import "./Seller.css";

function Dashboard() {
  const [stats, setStats] = useState({
    total_revenue: 0,
    total_orders_completed: 0,
    total_products_sold: 0,
  });
  const [productsCount, setProductsCount] = useState(0);
  const [lowStockCount, setLowStockCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Date filters
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [datePreset, setDatePreset] = useState("all");

  const fetchRevenue = async (start = startDate, end = endDate) => {
    setLoading(true);
    try {
      const response = await getSellerDashboardRevenue(start, end);
      if (response && response.success && response.data) {
        setStats(response.data);
      }
    } catch (error) {
      console.error("Lỗi tải thống kê doanh thu:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProductsData = async () => {
    try {
      const response = await getSellerProducts();
      if (response && response.success && response.data) {
        const products = response.data;
        setProductsCount(products.length);

        // Calculate low stock products (where total stock of variants <= 5)
        let lowStock = 0;
        products.forEach((p) => {
          const totalStock = p.variants?.reduce(
            (acc, v) => acc + (v.stock_quantity || 0),
            0
          ) || 0;
          if (totalStock <= 5) {
            lowStock++;
          }
        });
        setLowStockCount(lowStock);
      }
    } catch (error) {
      console.error("Lỗi tải danh sách sản phẩm:", error);
    }
  };

  // Load everything on mount
  useEffect(() => {
    fetchRevenue();
    fetchProductsData();
  }, []);

  const handlePresetChange = (preset) => {
    setDatePreset(preset);
    const today = new Date();
    let start = "";
    let end = today.toISOString().split("T")[0];

    if (preset === "today") {
      start = end;
    } else if (preset === "7days") {
      const d = new Date();
      d.setDate(today.getDate() - 7);
      start = d.toISOString().split("T")[0];
    } else if (preset === "30days") {
      const d = new Date();
      d.setDate(today.getDate() - 30);
      start = d.toISOString().split("T")[0];
    } else if (preset === "month") {
      const d = new Date(today.getFullYear(), today.getMonth(), 1);
      const offset = d.getTimezoneOffset();
      const localDate = new Date(d.getTime() - offset * 60 * 1000);
      start = localDate.toISOString().split("T")[0];
    } else if (preset === "all") {
      start = "";
      end = "";
    }

    setStartDate(start);
    setEndDate(end);
    fetchRevenue(start, end);
  };

  const handleCustomDateApply = (e) => {
    e.preventDefault();
    setDatePreset("custom");
    fetchRevenue(startDate, endDate);
  };

  return (
    <div>
      <div className="seller-header">
        <h1>Thống kê Doanh thu</h1>
      </div>

      {/* Date Filter Panel */}
      <div className="seller-card" style={{ marginBottom: "25px" }}>
        <form onSubmit={handleCustomDateApply} className="filter-form">
          <div className="filter-group">
            <label>Khoảng thời gian</label>
            <select
              value={datePreset}
              onChange={(e) => handlePresetChange(e.target.value)}
              className="filter-select"
            >
              <option value="all">Tất cả thời gian</option>
              <option value="today">Hôm nay</option>
              <option value="7days">7 ngày qua</option>
              <option value="30days">30 ngày qua</option>
              <option value="month">Tháng này</option>
              <option value="custom">Tùy chọn ngày...</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Từ ngày</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setDatePreset("custom");
              }}
              className="filter-input"
            />
          </div>

          <div className="filter-group">
            <label>Đến ngày</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setDatePreset("custom");
              }}
              className="filter-input"
            />
          </div>

          <button type="submit" className="seller-btn seller-btn-primary filter-submit-btn">
            Lọc báo cáo
          </button>
        </form>
      </div>

      {loading ? (
        <p>Đang tải dữ liệu thống kê thực từ server...</p>
      ) : (
        <div className="dashboard-stats">
          <div className="stat-card stat-card-revenue">
            <div className="stat-card-icon">💰</div>
            <div>
              <h3>Tổng Doanh Thu</h3>
              <p>{Number(stats.total_revenue || 0).toLocaleString("vi-VN")} đ</p>
            </div>
          </div>

          <div className="stat-card stat-card-orders">
            <div className="stat-card-icon">✅</div>
            <div>
              <h3>Đơn Hoàn Thành</h3>
              <p>{stats.total_orders_completed || 0} đơn</p>
            </div>
          </div>

          <div className="stat-card stat-card-sold">
            <div className="stat-card-icon">📦</div>
            <div>
              <h3>Sản Phẩm Đã Bán</h3>
              <p>{stats.total_products_sold || 0} món</p>
            </div>
          </div>

          <div className="stat-card stat-card-products">
            <div className="stat-card-icon">🏷️</div>
            <div>
              <h3>Tổng Sản Phẩm</h3>
              <p>{productsCount} sản phẩm</p>
            </div>
          </div>

          <div className="stat-card stat-card-lowstock" style={{ borderLeft: lowStockCount > 0 ? "4px solid #ef4444" : "none" }}>
            <div className="stat-card-icon">⚠️</div>
            <div>
              <h3>Sắp Hết Hàng</h3>
              <p style={{ color: lowStockCount > 0 ? "#ef4444" : "inherit" }}>
                {lowStockCount} sản phẩm
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;