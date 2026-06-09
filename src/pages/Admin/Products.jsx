import { useEffect, useState } from "react";
import {
  adminRequest,
  formatDateTime,
  getStatusClass,
  getStatusLabel,
  getTotalPages,
} from "./adminApi";

const PAGE_LIMIT = 10;

function Products() {
  const [products, setProducts] = useState([]);
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
const [showHideModal, setShowHideModal] = useState(false);
const [selectedProductId, setSelectedProductId] = useState(null);
const [hideReason, setHideReason] = useState("");

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      setError("");

      try {
        const result = await adminRequest("/admin/products", {
          params: {
            page,
            limit: PAGE_LIMIT,
          },
        });

        setProducts(result.data || []);

        setMeta(
          result.meta || {
            current_page: page,
            per_page: PAGE_LIMIT,
            total: 0,
          }
        );
      } catch (err) {
        setError(err.message);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, [page]);

  async function reloadData() {
    const result = await adminRequest("/admin/products", {
        params: {
        page,
        limit: PAGE_LIMIT,
        },
    });

    setProducts(result.data || []);
    setMeta(result.meta || {});
    }

async function updateProductStatus(
  productId,
  nextStatus
) {
  setUpdatingId(productId);
  setError("");
  setMessage("");

  try {
    const body = {
      status: nextStatus,
    };

    if (nextStatus === "hidden") {
  body.admin_note = hideReason.trim();
}

    const result = await adminRequest(
      `/admin/products/${productId}`,
      {
        method: "PATCH",
        body,
      }
    );

    setMessage(
      result.message ||
        "Cập nhật trạng thái sản phẩm thành công."
    );

    await reloadData();
  } catch (err) {
    setError(err.message);
  } finally {
    setUpdatingId(null);
  }
}

function openHideModal(productId) {
  setSelectedProductId(productId);
  setHideReason("");
  setShowHideModal(true);
}

async function confirmHideProduct() {
  if (!hideReason.trim()) {
    setError("Vui lòng nhập lý do ẩn sản phẩm.");
    return;
  }

  setShowHideModal(false);

  await updateProductStatus(
    selectedProductId,
    "hidden"
  );
}

  const totalPages = getTotalPages(meta);

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <span className="admin-eyebrow">Sản phẩm</span>
          <h1>Quản lý sản phẩm</h1>
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
                <th>Sản phẩm</th>
                <th>Shop</th>
                <th>Danh mục</th>
                <th>Biến thể</th>
                <th>Ảnh</th>
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
              ) : products.length > 0 ? (
                products.map((product) => (
                  <tr key={product.id}>
                    <td>#{product.id}</td>

                    <td>
                      <div className="admin-user-cell">
                        <strong>{product.name}</strong>

                        <span className="admin-description">
                        {product.description}
                        </span>

                        {product.admin_note && (
                        <span
                            style={{
                            color: "#dc2626",
                            fontSize: "12px",
                            marginTop: "4px",
                            }}
                        >
                            Lý do ẩn: {product.admin_note}
                        </span>
                        )}
                      </div>
                    </td>

                    <td>
                      <div className="admin-user-cell">
                        <strong>
                          {product.shop?.name}
                        </strong>

                        <span>
                          {product.shop?.owner?.name}
                        </span>
                      </div>
                    </td>

                    <td>
                      {product.category?.name}
                    </td>

                    <td>
                      {product.variants_count}
                    </td>

                    <td>
                      {product.images_count}
                    </td>

                    <td>
                      <span
                        className={`admin-status-pill ${getStatusClass(
                          product.status
                        )}`}
                      >
                        {getStatusLabel(product.status)}
                      </span>
                    </td>

                    <td>
                      {formatDateTime(
                        product.created_at
                      )}
                    </td>

                    <td>
                    <div className="admin-actions">
                        {product.status === "active" && (
                        <button
                            className="admin-action-btn danger"
                            disabled={
                            updatingId === product.id
                            }
                            onClick={() =>
                            openHideModal(product.id)
                            }
                        >
                            Ẩn
                        </button>
                        )}

                        {product.status === "hidden" && (
                        <button
                            className="admin-action-btn primary"
                            disabled={
                            updatingId === product.id
                            }
                            onClick={() =>
                            updateProductStatus(
                                product.id,
                                "active"
                            )
                            }
                        >
                            Hiện lại
                        </button>
                        )}

                        {product.status === "pending" && (
                        <>
                            <button
                            className="admin-action-btn primary"
                            disabled={
                                updatingId === product.id
                            }
                            onClick={() =>
                                updateProductStatus(
                                product.id,
                                "active"
                                )
                            }
                            >
                            Duyệt
                            </button>

                            <button
                            className="admin-action-btn danger"
                            disabled={
                                updatingId === product.id
                            }
                            onClick={() =>
                            openHideModal(product.id)
                            }
                            >
                            Ẩn
                            </button>
                        </>
                        )}
                    </div>
                    </td>

                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="9" className="admin-empty">
                    Không có dữ liệu sản phẩm
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

      {/* Modal nhập lý do ẩn */}
      {showHideModal && (
        <div className="admin-modal-overlay">
          <div className="admin-modal">
            <h3>Ẩn sản phẩm</h3>

            <p>
              Vui lòng nhập lý do ẩn sản phẩm.
            </p>

            <textarea
              value={hideReason}
              onChange={(e) =>
                setHideReason(e.target.value)
              }
              placeholder="Nhập lý do..."
            />

            <div className="admin-modal-actions">
              <button
                className="admin-action-btn neutral"
                onClick={() =>
                  setShowHideModal(false)
                }
              >
                Hủy
              </button>

              <button
                className="admin-action-btn danger"
                onClick={confirmHideProduct}
              >
                Xác nhận ẩn
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}



export default Products;