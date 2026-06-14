import { useState, useEffect } from "react";
import "./Seller.css";

function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Mock data for orders
  const mockOrders = [
    { id: 101, customer: "Nguyễn Văn A", total: 450000, status: "pending", date: "2026-06-14" },
    { id: 102, customer: "Trần Thị B", total: 150000, status: "processing", date: "2026-06-13" },
    { id: 103, customer: "Lê Văn C", total: 850000, status: "completed", date: "2026-06-12" },
  ];

  useEffect(() => {
    setTimeout(() => {
      setOrders(mockOrders);
      setLoading(false);
    }, 500);
  }, []);

  return (
    <div>
      <div className="seller-header">
        <h1>Quản lý Đơn hàng</h1>
      </div>

      <div className="seller-card">
        {loading ? (
          <p>Đang tải dữ liệu...</p>
        ) : (
          <table className="seller-table">
            <thead>
              <tr>
                <th>Mã ĐH</th>
                <th>Khách hàng</th>
                <th>Tổng tiền</th>
                <th>Ngày đặt</th>
                <th>Trạng thái</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id}>
                  <td>#{order.id}</td>
                  <td>{order.customer}</td>
                  <td>{order.total.toLocaleString("vi-VN")} đ</td>
                  <td>{order.date}</td>
                  <td>
                    <span className={`status-badge ${order.status === 'completed' ? 'status-active' : 'status-inactive'}`}>
                      {order.status === "pending" ? "Chờ duyệt" : order.status === "processing" ? "Đang giao" : "Hoàn thành"}
                    </span>
                  </td>
                  <td>
                    <button className="seller-btn seller-btn-primary">Cập nhật</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default Orders;
