import { useEffect, useState } from "react";
import {
  adminRequest,
  formatDateTime,
  getStatusClass,
  getStatusLabel,
  getTotalPages,
} from "./adminApi";

const PAGE_LIMIT = 10;

function Shops() {
  const [shops, setShops] = useState([]);
  const [meta, setMeta] = useState({
    current_page: 1,
    per_page: PAGE_LIMIT,
    total: 0,
  });
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");


useEffect(() => {
  async function fetchShops() {
    setLoading(true);
    setError("");

    try {
      const result = await adminRequest("/admin/shops", {
        params: {
          page,
          limit: PAGE_LIMIT,
          status,
        },
      });

      setShops(result.data || []);
      setMeta(
        result.meta || {
          current_page: page,
          per_page: PAGE_LIMIT,
          total: 0,
        }
      );
    } catch (err) {
      setError(err.message);
      setShops([]);
    } finally {
      setLoading(false);
    }
  }

  fetchShops();
}, [page, status]);

async function reloadData() {
  const result = await adminRequest("/admin/shops", {
    params: {
      page,
      limit: PAGE_LIMIT,
      status,
    },
  });

  setShops(result.data || []);
  setMeta(result.meta || {});
}

  async function updateShopStatus(id, nextStatus) {
    setUpdatingId(id);
    setError("");
    setMessage("");

    try {
      const result = await adminRequest(`/admin/shops/${id}/status`, {
        method: "PATCH",
        body: {
          status: nextStatus,
        },
      });

      setMessage(result.message || "Cập nhật trạng thái shop thành công.");
      await reloadData();
    } catch (err) {
      setError(err.message);
    } finally {
      setUpdatingId(null);
    }
  }

  function handleStatusChange(e) {
    setStatus(e.target.value);
    setPage(1);
    setMessage("");
  }

  const totalPages = getTotalPages(meta);

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <span className="admin-eyebrow">Kiểm duyệt</span>
          <h1>Quản lý shop</h1>
        </div>

        <div className="admin-page-total">
          <span>Tổng</span>
          <strong>{meta.total || 0}</strong>
        </div>
      </div>

      <div className="admin-toolbar">
        <label className="admin-field">
          <span>Trạng thái</span>
          <select value={status} onChange={handleStatusChange}>
            <option value="">Tất cả</option>
            <option value="pending">Chờ duyệt</option>
            <option value="active">Hoạt động</option>
            <option value="rejected">Từ chối</option>
          </select>
        </label>
      </div>

      {error && <div className="admin-alert error">{error}</div>}
      {message && <div className="admin-alert success">{message}</div>}

      <div className="admin-panel">
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Tên shop</th>
                <th>Chủ shop</th>
                <th>Ngày tạo</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="admin-empty">
                    Đang tải dữ liệu...
                  </td>
                </tr>
              ) : shops.length > 0 ? (
                shops.map((shop) => (
                  <tr key={shop.id}>
                    <td>#{shop.id}</td>
                    <td>
                      <strong>{shop.name}</strong>
                    </td>
                    <td>
                      <div className="admin-user-cell">
                        <strong>{shop.owner?.name || "N/A"}</strong>
                        <span>{shop.owner?.email || "N/A"}</span>
                      </div>
                    </td>
                    <td>{formatDateTime(shop.created_at)}</td>
                    <td>
                      <span
                        className={`admin-status-pill ${getStatusClass(
                          shop.status
                        )}`}
                      >
                        {getStatusLabel(shop.status)}
                      </span>
                    </td>
                    <td>
                      <div className="admin-actions">
                        {shop.status !== "active" && (
                          <button
                            className="admin-action-btn primary"
                            type="button"
                            disabled={updatingId === shop.id}
                            onClick={() => updateShopStatus(shop.id, "active")}
                          >
                            Duyệt
                          </button>
                        )}

                        {shop.status !== "rejected" && (
                          <button
                            className="admin-action-btn danger"
                            type="button"
                            disabled={updatingId === shop.id}
                            onClick={() =>
                              updateShopStatus(shop.id, "rejected")
                            }
                          >
                            Từ chối
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="admin-empty">
                    Không có dữ liệu shop
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

export default Shops;
