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
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" className="admin-empty">
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
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="admin-empty">
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
    </div>
  );
}

export default Products;