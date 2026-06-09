import { useEffect, useState } from "react";
import {
  adminRequest,
  formatDateTime,
  getStatusClass,
  getStatusLabel,
  getTotalPages,
} from "./adminApi";

const PAGE_LIMIT = 10;

function Users() {
  const [users, setUsers] = useState([]);
  const [meta, setMeta] = useState({
    current_page: 1,
    per_page: PAGE_LIMIT,
    total: 0,
  });

  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchUsers() {
      setLoading(true);
      setError("");

      try {
        const result = await adminRequest("/admin/users", {
          params: {
            page,
            limit: PAGE_LIMIT,
          },
        });

        setUsers(result.data || []);

        setMeta(
          result.meta || {
            current_page: page,
            per_page: PAGE_LIMIT,
            total: 0,
          }
        );
      } catch (err) {
        setError(err.message);
        setUsers([]);
      } finally {
        setLoading(false);
      }
    }

    fetchUsers();
  }, [page]);

  const totalPages = getTotalPages(meta);

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <span className="admin-eyebrow">Người dùng</span>
          <h1>Quản lý người dùng</h1>
        </div>

        <div className="admin-page-total">
          <span>Tổng</span>
          <strong>{meta.total || 0}</strong>
        </div>
      </div>

      {error && <div className="admin-alert error">{error}</div>}

      <div className="admin-panel">
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Người dùng</th>
                <th>SĐT</th>
                <th>Vai trò</th>
                <th>Shop</th>
                <th>Đơn hàng</th>
                <th>Trạng thái</th>
                <th>Ngày tạo</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" className="admin-empty">
                    Đang tải dữ liệu...
                  </td>
                </tr>
              ) : users.length > 0 ? (
                users.map((user) => (
                  <tr key={user.id}>
                    <td className="admin-id">
                      {user.id.slice(0, 8)}...
                    </td>

                    <td>
                      <div className="admin-user-cell">
                        <strong>{user.name}</strong>
                        <span>{user.email}</span>
                      </div>
                    </td>

                    <td>{user.phone}</td>

                    <td>
                      <span
                        className={`admin-role ${user.role}`}
                      >
                        {user.role}
                      </span>
                    </td>

                    <td>{user.shops_count}</td>

                    <td>{user.orders_count}</td>

                    <td>
                      <span
                        className={`admin-status-pill ${getStatusClass(
                          user.status
                        )}`}
                      >
                        {getStatusLabel(user.status)}
                      </span>
                    </td>

                    <td>{formatDateTime(user.created_at)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="admin-empty">
                    Không có dữ liệu người dùng
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="admin-pagination">
        <button
          className="admin-page-btn"
          disabled={page <= 1}
          onClick={() =>
            setPage((current) =>
              Math.max(current - 1, 1)
            )
          }
        >
          Trước
        </button>

        <span>
          Trang {page} / {totalPages}
        </span>

        <button
          className="admin-page-btn"
          disabled={page >= totalPages}
          onClick={() =>
            setPage((current) =>
              Math.min(current + 1, totalPages)
            )
          }
        >
          Sau
        </button>
      </div>
    </div>
  );
}

export default Users;