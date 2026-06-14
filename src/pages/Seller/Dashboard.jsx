import { useState, useEffect } from "react";
import { getSellerDashboardRevenue } from "./sellerApi";
import "./Seller.css";

function Dashboard() {
  // Khởi tạo state là object rỗng
  const [stats, setStats] = useState({ total_revenue: 0, orders_count: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRevenue = async () => {
      setLoading(true);
      try {
        const response = await getSellerDashboardRevenue();
        
        // Kiểm tra đúng cấu trúc data nhận được
        if (response && response.success && response.data) {
          setStats(response.data); 
        }
      } catch (error) {
        console.error("Lỗi tải thống kê:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRevenue();
  }, []);

  return (
    <div>
      <div className="seller-header">
        <h1>Thống kê Doanh thu</h1>
      </div>

      {loading ? (
        <p>Đang tải dữ liệu...</p>
      ) : (
        <div className="dashboard-stats">
          <div className="stat-card">
            <h3>Tổng Doanh Thu</h3>
            {/* Hiển thị trực tiếp giá trị từ object */}
            <p>{Number(stats.total_revenue).toLocaleString("vi-VN")} đ</p>
          </div>
          <div className="stat-card">
            <h3>Tổng Đơn Hàng</h3>
            <p>{stats.orders_count}</p>
          </div>
          <div className="stat-card">
            <h3>Sản Phẩm Hết Hàng</h3>
            <p>--</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;