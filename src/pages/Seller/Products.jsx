import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getSellerProducts, deleteSellerProduct } from "./sellerApi";
import { useSellerAlert } from "../../layouts/SellerLayout";
import "./Seller.css";

function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { showAlert, showConfirm } = useSellerAlert();

  const fetchProducts = async () => {
    setLoading(true); 
    try {
      const response = await getSellerProducts();
      
      if (response && response.success) {
        setProducts(response.data);
      } else {
        console.error("API trả về lỗi:", response);
      }
    } catch (error) {
      console.error("Lỗi kết nối API:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = async (id) => {
    const confirmed = await showConfirm("Bạn có chắc chắn muốn xóa sản phẩm này?");
    if (!confirmed) {
      return;
    }

    try {
      const result = await deleteSellerProduct(id);
      if (result.success) {
        await showAlert("Xóa sản phẩm thành công!", "success");
        setProducts((prev) => prev.filter((p) => p.id !== id));
      } else {
        await showAlert(result.message || "Xóa sản phẩm thất bại.", "error");
      }
    } catch (error) {
      console.error(error);
      await showAlert("Lỗi khi kết nối máy chủ để xóa sản phẩm.", "error");
    }
  };

  const handleEdit = (productId) => {
    navigate("/seller/edit-product", { state: { tab: "change", productId } });
  };

  const getProductPriceRange = (variants) => {
    if (!variants || variants.length === 0) return "0 đ";
    const prices = variants.map((v) => Number(v.price));
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);

    if (minPrice === maxPrice) {
      return `${minPrice.toLocaleString("vi-VN")} đ`;
    }
    return `${minPrice.toLocaleString("vi-VN")} - ${maxPrice.toLocaleString("vi-VN")} đ`;
  };

  const getProductTotalStock = (variants) => {
    if (!variants || variants.length === 0) return 0;
    return variants.reduce((acc, v) => acc + (v.stock_quantity || 0), 0);
  };

  return (
    <div>
      <div className="seller-header">
        <h1>Quản lý Sản phẩm</h1>
        <button 
          className="seller-btn seller-btn-primary"
          onClick={() => navigate("/seller/edit-product", { state: { tab: "add" } })}
        >
          + Thêm sản phẩm
        </button>
      </div>

      <div className="seller-card">
        {loading ? (
          <p>Đang tải dữ liệu thực từ server...</p>
        ) : (
          <div className="seller-table-container">
            <table className="seller-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Sản phẩm</th>
                  <th>Phân loại</th>
                  <th>Giá</th>
                  <th>Tồn kho</th>
                  <th>Trạng thái</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => {
                  const totalStock = getProductTotalStock(product.variants);
                  const image = product.images?.[0]?.image_url || "https://placehold.co/40x40?text=No+Image";
                  return (
                    <tr key={product.id}>
                      <td>{product.id}</td>
                      <td style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <img 
                          src={image} 
                          alt={product.name} 
                          style={{ width: "50px", height: "50px", borderRadius: "8px", objectFit: "cover", border: "1px solid #e5e7eb" }} 
                        />
                        <strong style={{ color: "#374151" }}>{product.name}</strong>
                      </td>
                      <td>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
                          {product.variants?.map((v) => (
                            <span 
                              key={v.id} 
                              style={{ 
                                fontSize: "11px", 
                                backgroundColor: "#f3f4f6", 
                                color: "#4b5563", 
                                padding: "2px 6px", 
                                borderRadius: "4px",
                                border: "1px solid #e5e7eb"
                              }}
                            >
                              {v.variant_name} ({v.stock_quantity})
                            </span>
                          ))}
                          {(!product.variants || product.variants.length === 0) && (
                            <span style={{ fontSize: "12px", color: "#9ca3af" }}>Chưa tạo</span>
                          )}
                        </div>
                      </td>
                      <td style={{ fontWeight: "600", color: "#1e3a8a" }}>
                        {getProductPriceRange(product.variants)}
                      </td>
                      <td style={{ fontWeight: "600", color: totalStock <= 5 ? "#b91c1c" : "#374151" }}>
                        {totalStock} {totalStock <= 5 && <small style={{ color: "#ef4444", display: "block", fontSize: "10px" }}>Sắp hết hàng!</small>}
                      </td>
                      <td>
                        <span className={`status-badge status-${product.status}`}>
                          {product.status === "active" ? "Đang bán" : 
                           product.status === "pending" ? "Chờ duyệt" : "Tạm ẩn"}
                        </span>
                      </td>
                      <td>
                        <button 
                          className="seller-btn" 
                          style={{ marginRight: "10px", backgroundColor: "#dbeafe", color: "#1e40af" }}
                          onClick={() => handleEdit(product.id)}
                        >
                          Sửa
                        </button>
                        <button 
                          className="seller-btn seller-btn-danger"
                          onClick={() => handleDelete(product.id)}
                        >
                          Xóa
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {products.length === 0 && (
                  <tr>
                    <td colSpan="7" style={{ textAlign: "center", padding: "30px", color: "#6b7280" }}>
                      Chưa có sản phẩm nào. Hãy bấm nút Thêm sản phẩm phía trên để tạo!
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

export default Products;