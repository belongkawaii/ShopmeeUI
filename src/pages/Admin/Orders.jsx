import { useEffect, useState } from "react";
import {
  adminRequest,
  formatDateTime,
  getStatusClass,
  getStatusLabel,
  getTotalPages,
} from "./adminApi";

const PAGE_LIMIT = 10;

function Orders() {
  const [orders, setOrders] = useState([]);
  const [meta, setMeta] = useState({
    current_page: 1,
    per_page: PAGE_LIMIT,
    total: 0,
  });
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("");
  const [shopIdInput, setShopIdInput] = useState("");
  const [shopId, setShopId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  

  useEffect(() => {
  async function loadOrders() {
    setLoading(true);
    setError("");

    try {
      const result = await adminRequest("/admin/orders", {
        params: {
          page,
          limit: PAGE_LIMIT,
          status,
          shop_id: shopId,
        },
      });

      setOrders(result.data || []);

      setMeta(
        result.meta || {
          current_page: page,
          per_page: PAGE_LIMIT,
          total: 0,
        }
      );
    } catch (err) {
      setError(err.message);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }

  loadOrders();
}, [page, status, shopId]);

  function handleStatusChange(e) {
    setStatus(e.target.value);
    setPage(1);
  }

  function handleApplyShopFilter(e) {
    e.preventDefault();
    setShopId(shopIdInput.trim());
    setPage(1);
  }

  function clearFilters() {
    setStatus("");
    setShopId("");
    setShopIdInput("");
    setPage(1);
  }

  const totalPages = getTotalPages(meta);

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <span className="admin-eyebrow">Đơn hàng</span>
          <h1>Quản lý đơn hàng</h1>
        </div>

        <div className="admin-page-total">
          <span>Tổng</span>
          <strong>{meta.total || 0}</strong>
        </div>
      </div>

      <form className="admin-toolbar" onSubmit={handleApplyShopFilter}>
        <label className="admin-field">
          <span>Trạng thái</span>
          <select value={status} onChange={handleStatusChange}>
            <option value="">Tất cả</option>
            <option value="pending">Chờ xử lý</option>
            <option value="processing">Đang xử lý</option>
            <option value="shipping">Đang giao</option>
            <option value="completed">Hoàn tất</option>
            <option value="cancelled">Đã hủy</option>
          </select>
        </label>

        <label className="admin-field">
          <span>Mã shop</span>
          <input
            type="number"
            min="1"
            placeholder="Nhập ID shop"
            value={shopIdInput}
            onChange={(e) => setShopIdInput(e.target.value)}
          />
        </label>

        <button type="submit" className="admin-action-btn primary">
          Lọc
        </button>

        <button
          type="button"
          className="admin-action-btn neutral"
          onClick={clearFilters}
        >
          Xóa lọc
        </button>
      </form>

      {error && <div className="admin-alert error">{error}</div>}

      <div className="admin-panel">
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Khách hàng</th>
                <th>Trạng thái</th>
                <th>Thanh toán</th>
                <th>Shop</th>
                <th>Sản phẩm</th>
                <th>Ngày tạo</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" className="admin-empty">
                    Đang tải dữ liệu...
                  </td>
                </tr>
              ) : orders.length > 0 ? (
                orders.map((order) => (
                  <tr key={order.id}>
                    <td>#{order.id}</td>
                    <td>
                      <div className="admin-user-cell">
                        <strong>{order.user?.name || "N/A"}</strong>
                        <span>{order.user?.email || "N/A"}</span>
                      </div>
                    </td>
                    <td>
                      <span
                        className={`admin-status-pill ${getStatusClass(
                          order.status
                        )}`}
                      >
                        {getStatusLabel(order.status)}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`admin-status-pill ${getStatusClass(
                          order.payment_status
                        )}`}
                      >
                        {getStatusLabel(order.payment_status)}
                      </span>
                    </td>
                    <td>
                      {order.shop_ids?.length
                        ? order.shop_ids.map((id) => (
                            <span className="admin-chip" key={id}>
                              #{id}
                            </span>
                          ))
                        : "N/A"}
                    </td>
                    <td>{order.items_count || 0}</td>
                    <td>{formatDateTime(order.created_at)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="admin-empty">
                    Không có đơn hàng nào
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="admin-pagination">
        <button
          type="button"
          className="admin-page-btn"
          disabled={page <= 1}
          onClick={() => setPage((current) => Math.max(current - 1, 1))}
        >
          Trước
        </button>

        <span>
          Trang {page} / {totalPages}
        </span>

        <button
          type="button"
          className="admin-page-btn"
          disabled={page >= totalPages}
          onClick={() => setPage((current) => Math.min(current + 1, totalPages))}
        >
          Sau
        </button>
      </div>
    </div>
  );
}

export default Orders;
