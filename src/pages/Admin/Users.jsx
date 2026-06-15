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
  const [message, setMessage] = useState("");
  const [updatingId, setUpdatingId] = useState(null);

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

  async function reloadData() {
  const result = await adminRequest("/admin/users", {
    params: {
      page,
      limit: PAGE_LIMIT,
    },
  });

  setUsers(result.data || []);
  setMeta(result.meta || {});
}
async function updateUserStatus(userId, nextStatus) {
  setUpdatingId(userId);
  setError("");
  setMessage("");

  try {
    const result = await adminRequest(
      `/admin/users/${userId}`,
      {
        method: "PATCH",
        body: {
          status: nextStatus,
        },
      }
    );

    setMessage(
      result.message ||
        "Cập nhật trạng thái người dùng thành công."
    );

    await reloadData();
  } catch (err) {
    setError(err.message);
  } finally {
    setUpdatingId(null);
  }
}

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
      {message && (
        <div className="admin-alert success">
          {message}
        </div>
      )}

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
                <th>Thao tác</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="9" className="admin-empty">
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

                    <td>
                      <div className="admin-actions">
                        {user.role !== "admin" ? (
                          <>
                            {user.status === "active" && (
                              <button
                                className="admin-action-btn danger"
                                disabled={updatingId === user.id}
                                onClick={() =>
                                  updateUserStatus(
                                    user.id,
                                    "blocked"
                                  )
                                }
                              >
                                Khóa
                              </button>
                            )}

                            {user.status === "blocked" && (
                              <button
                                className="admin-action-btn primary"
                                disabled={updatingId === user.id}
                                onClick={() =>
                                  updateUserStatus(
                                    user.id,
                                    "active"
                                  )
                                }
                              >
                                Mở khóa
                              </button>
                            )}

                            {user.status === "pending" && (
                              <>
                                <button
                                  className="admin-action-btn primary"
                                  disabled={updatingId === user.id}
                                  onClick={() =>
                                    updateUserStatus(
                                      user.id,
                                      "active"
                                    )
                                  }
                                >
                                  Duyệt
                                </button>

                                <button
                                  className="admin-action-btn danger"
                                  disabled={updatingId === user.id}
                                  onClick={() =>
                                    updateUserStatus(
                                      user.id,
                                      "blocked"
                                    )
                                  }
                                >
                                  Khóa
                                </button>
                              </>
                            )}
                          </>
                        ) : (
                          <span style={{ color: "#9ca3af", fontSize: "13px" }}>Không thể thao tác</span>
                        )}
                      </div>
                    </td>

                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="9" className="admin-empty">
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