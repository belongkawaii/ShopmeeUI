import { useState, useEffect } from "react";
import { getSellerProducts } from "./sellerApi";
import "./Seller.css";

function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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

    fetchProducts();
  }, []);

  return (
    <div>
      <div className="seller-header">
        <h1>Quản lý Sản phẩm</h1>
        <button className="seller-btn seller-btn-primary">+ Thêm Sản Phẩm</button>
      </div>

      <div className="seller-card">
        {loading ? (
          <p>Đang tải dữ liệu thực từ server...</p>
        ) : (
          <table className="seller-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Sản phẩm</th>
                <th>Giá</th>
                <th>Tồn kho</th>
                <th>Trạng thái</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id}>
                  <td>{product.id}</td>
                  <td style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    {/* Giả sử API trả về field 'image_url' hoặc 'image' */}
                    <img 
                      src={product.image || product.image_url} 
                      alt={product.name} 
                      style={{ width: "40px", height: "40px", borderRadius: "4px", objectFit: "cover" }} 
                    />
                    {product.name}
                  </td>
                  <td>{Number(product.price).toLocaleString("vi-VN")} đ</td>
                  <td>{product.stock}</td>
                  <td>
                    <span className={`status-badge status-${product.status}`}>
                      {product.status === "active" ? "Đang bán" : "Hết hàng"}
                    </span>
                  </td>
                  <td>
                    <button className="seller-btn" style={{ marginRight: "10px", backgroundColor: "#e5e7eb" }}>Sửa</button>
                    <button className="seller-btn seller-btn-danger">Xóa</button>
                  </td>
                </tr>
              ))}
              {products.length === 0 && (
                <tr>
                  <td colSpan="6" style={{ textAlign: "center", padding: "20px" }}>
                    Chưa có sản phẩm nào
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default Products;