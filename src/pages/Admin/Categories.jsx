import { useEffect, useState } from "react";
import { adminRequest, formatDateTime } from "./adminApi";
import { API_BASE_URL } from "../../config";
import { useCustomAlert } from "../../context/CustomAlertContext";

function Categories() {
  const { showConfirm, showSuccess, showError } = useCustomAlert();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [editingCategoryId, setEditingCategoryId] = useState(null);
  const [editingCategoryName, setEditingCategoryName] = useState("");
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const fetchCategories = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`${API_BASE_URL}/categories`);
      const result = await response.json();
      if (response.ok && result.success) {
        setCategories(result.data || []);
      } else {
        setError(result.message || "Không thể tải danh sách danh mục.");
      }
    } catch (err) {
      setError("Lỗi kết nối máy chủ khi tải danh mục.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    if (!newCategoryName.trim()) {
      setError("Vui lòng nhập tên danh mục.");
      return;
    }

    setCreating(true);
    setError("");
    setMessage("");

    try {
      const result = await adminRequest("/admin/categories", {
        method: "POST",
        body: {
          name: newCategoryName.trim(),
        },
      });

      if (result.success) {
        setMessage(result.message || "Tạo danh mục thành công!");
        setNewCategoryName("");
        await fetchCategories();
      } else {
        setError(result.message || "Tạo danh mục thất bại.");
      }
    } catch (err) {
      setError(err.message || "Lỗi khi kết nối máy chủ để tạo danh mục.");
    } finally {
      setCreating(false);
    }
  };

  const handleStartEdit = (category) => {
    setEditingCategoryId(category.id);
    setEditingCategoryName(category.name);
    setError("");
    setMessage("");
  };

  const handleCancelEdit = () => {
    setEditingCategoryId(null);
    setEditingCategoryName("");
  };

  const handleUpdateCategory = async (id) => {
    if (!editingCategoryName.trim()) {
      setError("Tên danh mục không được để trống.");
      return;
    }

    setUpdating(true);
    setError("");
    setMessage("");

    try {
      const result = await adminRequest(`/admin/categories/${id}`, {
        method: "PUT",
        body: {
          name: editingCategoryName.trim(),
        },
      });

      if (result.success) {
        showSuccess(result.message || "Cập nhật danh mục thành công!");
        setEditingCategoryId(null);
        setEditingCategoryName("");
        await fetchCategories();
      } else {
        setError(result.message || "Cập nhật danh mục thất bại.");
      }
    } catch (err) {
      setError(err.message || "Lỗi kết nối khi cập nhật danh mục.");
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteCategory = async (id) => {
    setError("");
    setMessage("");

    const confirmed = await showConfirm(
      "Bạn có chắc chắn muốn xóa danh mục này? Hành động này không thể hoàn tác."
    );
    if (!confirmed) return;

    setLoading(true);
    try {
      const result = await adminRequest(`/admin/categories/${id}`, {
        method: "DELETE",
      });

      if (result.success) {
        showSuccess(result.message || "Xóa danh mục sản phẩm thành công!");
        await fetchCategories();
      } else {
        setError(result.message || "Xóa danh mục sản phẩm thất bại.");
      }
    } catch (err) {
      showError(err.message || "Không thể xóa danh mục này.");
      setError(err.message || "Lỗi kết nối khi xóa danh mục.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <span className="admin-eyebrow">Thiết lập</span>
          <h1>Quản lý Danh mục</h1>
        </div>
        <div className="admin-page-total">
          <span>Tổng số</span>
          <strong>{categories.length}</strong>
        </div>
      </div>

      <div className="admin-toolbar" style={{ display: "block", padding: "20px" }}>
        <form onSubmit={handleCreateCategory} style={{ display: "flex", gap: "16px", alignItems: "flex-end" }}>
          <label className="admin-field" style={{ flex: 1 }}>
            <span style={{ marginBottom: "6px", display: "block" }}>Tên danh mục sản phẩm mới</span>
            <input
              type="text"
              placeholder="Ví dụ: Thiết bị điện tử, Thời trang nam..."
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              style={{ width: "100%" }}
              disabled={creating}
              required
            />
          </label>
          <button
            className="admin-action-btn primary"
            type="submit"
            style={{ height: "42px", minHeight: "42px", padding: "0 24px", borderRadius: "8px", cursor: "pointer" }}
            disabled={creating}
          >
            {creating ? "Đang tạo..." : "Thêm danh mục"}
          </button>
        </form>
      </div>

      {error && <div className="admin-alert error" style={{ marginTop: "16px" }}>{error}</div>}
      {message && <div className="admin-alert success" style={{ marginTop: "16px" }}>{message}</div>}

      <div className="admin-panel" style={{ marginTop: "24px" }}>
        <div className="admin-panel-header">
          <h2>Danh sách danh mục sản phẩm</h2>
        </div>
        
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th style={{ width: "120px" }}>Mã ID</th>
                <th>Tên danh mục</th>
                <th style={{ width: "200px" }}>Ngày tạo</th>
                <th style={{ width: "200px" }}>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="4" className="admin-empty" style={{ textAlign: "center", padding: "30px" }}>
                    Đang tải danh mục...
                  </td>
                </tr>
              ) : categories.length > 0 ? (
                categories.map((category) => (
                  <tr key={category.id}>
                    <td>#{category.id}</td>
                    <td>
                      {editingCategoryId === category.id ? (
                        <input
                          type="text"
                          value={editingCategoryName}
                          onChange={(e) => setEditingCategoryName(e.target.value)}
                          disabled={updating}
                          style={{
                            width: "90%",
                            padding: "6px 10px",
                            borderRadius: "6px",
                            border: "1px solid #ddd",
                            fontSize: "14px"
                          }}
                          required
                        />
                      ) : (
                        <strong>{category.name}</strong>
                      )}
                    </td>
                    <td>
                      {formatDateTime(category.created_at)}
                    </td>
                    <td>
                      {editingCategoryId === category.id ? (
                        <div style={{ display: "flex", gap: "8px" }}>
                          <button
                            className="admin-action-btn primary"
                            onClick={() => handleUpdateCategory(category.id)}
                            disabled={updating}
                            style={{
                              padding: "4px 12px",
                              fontSize: "12px",
                              height: "30px",
                              minHeight: "30px",
                              borderRadius: "6px",
                              cursor: "pointer"
                            }}
                          >
                            {updating ? "Đang lưu..." : "Lưu"}
                          </button>
                          <button
                            className="admin-action-btn"
                            onClick={handleCancelEdit}
                            disabled={updating}
                            style={{
                              padding: "4px 12px",
                              fontSize: "12px",
                              height: "30px",
                              minHeight: "30px",
                              borderRadius: "6px",
                              cursor: "pointer",
                              backgroundColor: "#f3f4f6",
                              color: "#4b5563",
                              border: "1px solid #e5e7eb"
                            }}
                          >
                            Hủy
                          </button>
                        </div>
                      ) : (
                        <div style={{ display: "flex", gap: "8px" }}>
                          <button
                            className="admin-action-btn primary outline"
                            onClick={() => handleStartEdit(category)}
                            disabled={loading || creating}
                            style={{
                              padding: "4px 12px",
                              fontSize: "12px",
                              height: "30px",
                              minHeight: "30px",
                              borderRadius: "6px",
                              cursor: "pointer"
                            }}
                          >
                            Sửa
                          </button>
                          <button
                            className="admin-action-btn danger outline"
                            onClick={() => handleDeleteCategory(category.id)}
                            disabled={loading || creating}
                            style={{
                              padding: "4px 12px",
                              fontSize: "12px",
                              height: "30px",
                              minHeight: "30px",
                              borderRadius: "6px",
                              cursor: "pointer",
                              color: "#ef4444",
                              borderColor: "#fecaca"
                            }}
                          >
                            Xóa
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="admin-empty" style={{ textAlign: "center", padding: "30px" }}>
                    Không có danh mục nào.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Categories;
