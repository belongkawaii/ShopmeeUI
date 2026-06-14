import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerShop } from "../Seller/sellerApi";
import "./ShopRegister.css";

function ShopRegister() {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    logo_url: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await registerShop(formData);
      
      if (response.success) {
        // 1. Thay đổi thông báo thành công
        setSuccess("Xin chờ quản trị viên duyệt để có thể đăng ký bán hàng.");
        
        // Lưu ý: Đã xóa phần tự động set role = 'seller' ở localStorage
        // vì tài khoản cần admin duyệt ở phía Backend trước.

        // 2. Chuyển hướng về trang chủ "/" sau 2 giây
        setTimeout(() => {
          navigate("/");
          window.location.reload(); // Giữ lại reload để reset lại các state chung (ví dụ: header)
        }, 2000); 
      } else {
        setError(response.message || "Đã xảy ra lỗi khi đăng ký.");
      }
    } catch (err) {
      setError("Không thể kết nối đến máy chủ.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="shop-register-container">
      <div className="shop-register-card">
        <h2>Đăng Ký Mở Shop</h2>
        <p>Bắt đầu kinh doanh trên Shopmee ngay hôm nay!</p>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <form onSubmit={handleSubmit} className="shop-register-form">
          <div className="form-group">
            <label htmlFor="name">Tên cửa hàng *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="VD: Shop Quần Áo Đẹp"
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Mô tả cửa hàng *</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              placeholder="VD: Chuyên cung cấp quần áo thời trang..."
              rows="4"
            ></textarea>
          </div>

          <div className="form-group">
            <label htmlFor="logo_url">URL Logo (Không bắt buộc)</label>
            <input
              type="text"
              id="logo_url"
              name="logo_url"
              value={formData.logo_url}
              onChange={handleChange}
              placeholder="https://example.com/logo.png"
            />
          </div>

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? "Đang xử lý..." : "Đăng ký ngay"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default ShopRegister;