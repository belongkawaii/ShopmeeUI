import { useState, useEffect } from "react";
// Import hàm gọi API thật từ file sellerApi.js
import { getSellerOrders, updateSellerOrder } from "./sellerApi"; 
import "./Seller.css";

function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Hàm lấy danh sách đơn hàng từ API
  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await getSellerOrders(); 
      if (response && response.success) {
        setOrders(response.data);
      }
    } catch (error) {
      console.error("Lỗi khi tải đơn hàng:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Hàm xử lý khi nhấn "Cập nhật" (Ví dụ: chuyển trạng thái từ pending -> processing)
  const handleUpdateStatus = async (id, currentStatus) => {
    const nextStatus = currentStatus === 'pending' ? 'processing' : 'completed';
    try {
      const response = await updateSellerOrder(id, nextStatus);
      if (response.success) {
        alert("Cập nhật trạng thái thành công!");
        fetchOrders(); // Load lại danh sách sau khi cập nhật
      }
    } catch (error) {
      alert("Có lỗi xảy ra khi cập nhật!");
    }
  };

  return (
    <div>
      <div className="seller-header">
        <h1>Quản lý Đơn hàng</h1>
      </div>

      <div className="seller-card">
        {loading ? (
          <p>Đang tải dữ liệu thực...</p>
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
                  <td>{order.customer_name}</td> {/* Kiểm tra field này trong API */}
                  <td>{Number(order.total_amount).toLocaleString("vi-VN")} đ</td>
                  <td>{new Date(order.created_at).toLocaleDateString()}</td>
                  <td>
                    <span className={`status-badge status-${order.status}`}>
                      {order.status === "pending" ? "Chờ duyệt" : 
                       order.status === "processing" ? "Đang giao" : "Hoàn thành"}
                    </span>
                  </td>
                  <td>
                    {order.status !== 'completed' && (
                      <button 
                        className="seller-btn seller-btn-primary"
                        onClick={() => handleUpdateStatus(order.id, order.status)}
                      >
                        Cập nhật
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr>
                  <td colSpan="6" style={{ textAlign: "center", padding: "20px" }}>
                    Chưa có đơn hàng nào
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default Orders;