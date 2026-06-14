import { useState, useEffect, Fragment } from "react";
import { getSellerOrders, updateSellerOrder } from "./sellerApi";
import { useSellerAlert } from "../../layouts/SellerLayout";
import { API_BASE_URL } from "../../config";
import "./Seller.css";

function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrders, setExpandedOrders] = useState({});
  const { showAlert, showConfirm } = useSellerAlert();

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

  const handleUpdateStatus = async (id, nextStatus) => {
    const statusLabels = {
      confirmed: "Xác nhận đơn hàng",
      shipping: "Bắt đầu giao hàng",
      delivered: "Hoàn thành đơn hàng",
      cancelled: "Hủy đơn hàng"
    };

    const confirmed = await showConfirm(`Bạn có chắc chắn muốn thực hiện hành động: "${statusLabels[nextStatus]}"?`);
    if (!confirmed) {
      return;
    }

    try {
      const response = await updateSellerOrder(id, nextStatus);
      if (response.success) {
        await showAlert("Cập nhật trạng thái thành công!", "success");
        fetchOrders();
      } else {
        await showAlert(response.message || "Cập nhật thất bại.", "error");
      }
    } catch (error) {
      console.error(error);
      await showAlert("Có lỗi xảy ra khi cập nhật!", "error");
    }
  };

  const toggleOrderExpand = (orderId) => {
    setExpandedOrders((prev) => ({
      ...prev,
      [orderId]: !prev[orderId],
    }));
  };

  const getProductImageUrl = (imagePath) => {
    if (!imagePath) return "https://placehold.co/80x80?text=No+Image";
    if (imagePath.startsWith("http")) return imagePath;
    return `${API_BASE_URL}/storage/${imagePath}`;
  };

  const getStatusBadgeStyle = (status) => {
    switch (status) {
      case "pending":
        return { backgroundColor: "#fef3c7", color: "#d97706", border: "1px solid #fde68a", display: "inline-block", padding: "4px 10px", borderRadius: "12px", fontSize: "12px", fontWeight: "600" };
      case "confirmed":
        return { backgroundColor: "#dbeafe", color: "#2563eb", border: "1px solid #bfdbfe", display: "inline-block", padding: "4px 10px", borderRadius: "12px", fontSize: "12px", fontWeight: "600" };
      case "shipping":
        return { backgroundColor: "#e0f2fe", color: "#0284c7", border: "1px solid #bae6fd", display: "inline-block", padding: "4px 10px", borderRadius: "12px", fontSize: "12px", fontWeight: "600" };
      case "delivered":
        return { backgroundColor: "#d1fae5", color: "#059669", border: "1px solid #a7f3d0", display: "inline-block", padding: "4px 10px", borderRadius: "12px", fontSize: "12px", fontWeight: "600" };
      case "cancelled":
        return { backgroundColor: "#fee2e2", color: "#dc2626", border: "1px solid #fecaca", display: "inline-block", padding: "4px 10px", borderRadius: "12px", fontSize: "12px", fontWeight: "600" };
      default:
        return { backgroundColor: "#f3f4f6", color: "#4b5563", border: "1px solid #e5e7eb", display: "inline-block", padding: "4px 10px", borderRadius: "12px", fontSize: "12px", fontWeight: "600" };
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case "pending":
        return "Chờ duyệt";
      case "confirmed":
        return "Đã xác nhận";
      case "shipping":
        return "Đang giao";
      case "delivered":
        return "Đã giao";
      case "cancelled":
        return "Đã hủy";
      default:
        return status;
    }
  };

  return (
    <div>
      <div className="seller-header">
        <h1>Quản lý Đơn hàng</h1>
      </div>

      <div className="seller-card">
        {loading ? (
          <p>Đang tải dữ liệu thực từ server...</p>
        ) : (
          <div className="seller-table-container">
            <table className="seller-table">
              <thead>
                <tr>
                  <th>Mã ĐH</th>
                  <th>Khách hàng</th>
                  <th>Tổng tiền</th>
                  <th>Ngày đặt</th>
                  <th>Thanh toán</th>
                  <th>Trạng thái</th>
                  <th style={{ textAlign: "right" }}>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => {
                  const customerName = order.user?.name || order.user?.email || "Khách hàng ẩn danh";
                  const isExpanded = !!expandedOrders[order.id];
                  const paymentMethodLabel = order.payment_method === "cod" ? "COD" : "Online";
                  const paymentStatusLabel = order.payment_status === "paid" ? "Đã TT" : "Chưa TT";

                  return (
                    <Fragment key={order.id}>
                      <tr style={{ borderBottom: "1px solid #e5e7eb" }}>
                        <td style={{ fontWeight: "600" }}>#{order.id}</td>
                        <td>
                          <div>
                            <strong>{customerName}</strong>
                            {order.user?.email && <small style={{ display: "block", color: "#6b7280" }}>{order.user.email}</small>}
                          </div>
                        </td>
                        <td style={{ fontWeight: "600", color: "#1e3a8a" }}>
                          {Number(order.total_amount).toLocaleString("vi-VN")} đ
                        </td>
                        <td>{new Date(order.created_at).toLocaleDateString("vi-VN")}</td>
                        <td>
                          <span style={{ fontSize: "12px", padding: "2px 6px", borderRadius: "4px", backgroundColor: order.payment_status === "paid" ? "#d1fae5" : "#fee2e2", color: order.payment_status === "paid" ? "#065f46" : "#991b1b" }}>
                            {paymentMethodLabel} ({paymentStatusLabel})
                          </span>
                        </td>
                        <td>
                          <span style={getStatusBadgeStyle(order.status)}>
                            {getStatusLabel(order.status)}
                          </span>
                        </td>
                        <td style={{ textAlign: "right" }}>
                          <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", flexWrap: "wrap" }}>
                            <button
                              className="seller-btn"
                              style={{ backgroundColor: "#f3f4f6", color: "#374151", border: "1px solid #d1d5db" }}
                              onClick={() => toggleOrderExpand(order.id)}
                            >
                              {isExpanded ? "Thu gọn" : "Chi tiết"}
                            </button>

                            {order.status === "pending" && (
                              <>
                                <button
                                  className="seller-btn"
                                  style={{ backgroundColor: "#3b82f6", color: "white" }}
                                  onClick={() => handleUpdateStatus(order.id, "confirmed")}
                                >
                                  Xác nhận
                                </button>
                                <button
                                  className="seller-btn seller-btn-danger"
                                  onClick={() => handleUpdateStatus(order.id, "cancelled")}
                                >
                                  Hủy đơn
                                </button>
                              </>
                            )}

                            {order.status === "confirmed" && (
                              <>
                                <button
                                  className="seller-btn"
                                  style={{ backgroundColor: "#0284c7", color: "white" }}
                                  onClick={() => handleUpdateStatus(order.id, "shipping")}
                                >
                                  Giao hàng
                                </button>
                                <button
                                  className="seller-btn seller-btn-danger"
                                  onClick={() => handleUpdateStatus(order.id, "cancelled")}
                                >
                                  Hủy đơn
                                </button>
                              </>
                            )}

                            {order.status === "shipping" && (
                              <button
                                className="seller-btn"
                                style={{ backgroundColor: "#10b981", color: "white" }}
                                onClick={() => handleUpdateStatus(order.id, "delivered")}
                              >
                                Đã giao
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                      
                      {isExpanded && (
                        <tr style={{ backgroundColor: "#f9fafb" }}>
                          <td colSpan="7" style={{ padding: "15px 25px", borderBottom: "1px solid #e5e7eb" }}>
                            <div style={{ backgroundColor: "white", padding: "18px", borderRadius: "8px", border: "1px solid #e5e7eb", boxShadow: "inset 0 2px 4px rgba(0,0,0,0.02)" }}>
                              <h4 style={{ margin: "0 0 12px 0", fontSize: "14px", color: "#111827", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <span>Danh sách sản phẩm của đơn hàng #{order.id}</span>
                                {order.description && (
                                  <span style={{ fontSize: "12px", fontWeight: "normal", color: "#ef4444" }}>
                                    Ghi chú: {order.description}
                                  </span>
                                )}
                              </h4>
                              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                                <thead>
                                  <tr style={{ borderBottom: "2px solid #f3f4f6" }}>
                                    <th style={{ padding: "8px 0", textAlign: "left", fontSize: "12px", color: "#6b7280", fontWeight: "600" }}>Sản phẩm</th>
                                    <th style={{ padding: "8px 0", textAlign: "left", fontSize: "12px", color: "#6b7280", fontWeight: "600" }}>Phân loại</th>
                                    <th style={{ padding: "8px 0", textAlign: "right", fontSize: "12px", color: "#6b7280", fontWeight: "600" }}>Đơn giá</th>
                                    <th style={{ padding: "8px 0", textAlign: "center", fontSize: "12px", color: "#6b7280", fontWeight: "600" }}>Số lượng</th>
                                    <th style={{ padding: "8px 0", textAlign: "right", fontSize: "12px", color: "#6b7280", fontWeight: "600" }}>Thành tiền</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {order.items?.map((item) => {
                                    const variant = item.product_variant || item.productVariant;
                                    const product = variant?.product;
                                    const itemPrice = Number(item.unit_price || 0);
                                    const itemQty = Number(item.quantity || 0);
                                    const itemTotal = itemPrice * itemQty;
                                    const image = product?.images?.[0]?.image || "";

                                    return (
                                      <tr key={item.id} style={{ borderBottom: "1px solid #f3f4f6" }}>
                                        <td style={{ padding: "8px 0", display: "flex", alignItems: "center", gap: "10px" }}>
                                          <img
                                            src={getProductImageUrl(image)}
                                            alt={product?.name || "Product"}
                                            style={{ width: "36px", height: "36px", borderRadius: "4px", objectFit: "cover", border: "1px solid #e5e7eb" }}
                                          />
                                          <span style={{ fontSize: "13px", fontWeight: "500", color: "#374151" }}>
                                            {product?.name || "Sản phẩm không rõ"}
                                          </span>
                                        </td>
                                        <td style={{ padding: "8px 0", fontSize: "12px", color: "#6b7280" }}>
                                          {variant?.variant_name || "Mặc định"}
                                        </td>
                                        <td style={{ padding: "8px 0", textAlign: "right", fontSize: "13px", color: "#374151" }}>
                                          {itemPrice.toLocaleString("vi-VN")} đ
                                        </td>
                                        <td style={{ padding: "8px 0", textAlign: "center", fontSize: "13px", color: "#374151" }}>
                                          x{itemQty}
                                        </td>
                                        <td style={{ padding: "8px 0", textAlign: "right", fontSize: "13px", fontWeight: "600", color: "#111827" }}>
                                          {itemTotal.toLocaleString("vi-VN")} đ
                                        </td>
                                      </tr>
                                    );
                                  })}
                                  {(!order.items || order.items.length === 0) && (
                                    <tr>
                                      <td colSpan="5" style={{ textAlign: "center", padding: "10px", color: "#9ca3af", fontSize: "12px" }}>
                                        Không có dữ liệu mặt hàng
                                      </td>
                                    </tr>
                                  )}
                                </tbody>
                              </table>
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })}
                {orders.length === 0 && (
                  <tr>
                    <td colSpan="7" style={{ textAlign: "center", padding: "30px", color: "#6b7280" }}>
                      Chưa có đơn hàng nào của Shop.
                  </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default Orders;