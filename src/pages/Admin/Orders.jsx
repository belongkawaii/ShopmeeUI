import { useEffect, useState } from "react";

function Orders() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    async function loadOrders() {
      try {
        const token = localStorage.getItem("token");

        const response = await fetch(
          "http://127.0.0.1:8000/api/v1/admin/orders",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const result = await response.json();

        if (result.success) {
          setOrders(result.data || []);
        } else {
          console.error(result.message);
          setOrders([]);
        }
      } catch (error) {
        console.error(
          "Lỗi lấy danh sách đơn hàng:",
          error
        );
      }
    }

    loadOrders();
  }, []);

  return (
    <div>
      <h1>Quản lý đơn hàng</h1>

      <table className="admin-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Khách hàng</th>
            <th>Trạng thái</th>
            <th>Thanh toán</th>
            <th>Số sản phẩm</th>
            <th>Ngày tạo</th>
          </tr>
        </thead>

        <tbody>
          {orders.length > 0 ? (
            orders.map((order) => (
              <tr key={order.id}>
                <td>{order.id}</td>

                <td>
                  {order.user?.name || "N/A"}
                </td>

                <td>{order.status}</td>

                <td>
                  {order.payment_status}
                </td>

                <td>
                  {order.items_count}
                </td>

                <td>
                  {order.created_at}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6">
                Không có đơn hàng nào
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default Orders;