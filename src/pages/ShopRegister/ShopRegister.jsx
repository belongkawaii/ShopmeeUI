import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerShop } from "../Seller/sellerApi";
import "./ShopRegister.css";

function ShopRegister() {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    if (!logoFile) {
      setError("Vui lòng chọn ảnh logo cho cửa hàng.");
      setLoading(false);
      return;
    }

    const data = new FormData();
    data.append("name", formData.name);
    data.append("description", formData.description);
    data.append("logo", logoFile);

    try {
      const response = await registerShop(data);
      
      if (response.success) {
        // 1. Thay đổi thông báo thành công
        setSuccess("Xin chờ quản trị viên duyệt để có thể đăng ký bán hàng.");
        
        // 2. Chuyển hướng về trang chủ "/" sau 2 giây
        setTimeout(() => {
          navigate("/");
          window.location.reload(); 
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
            <label htmlFor="logo">Ảnh Logo cửa hàng *</label>
            <input
              type="file"
              id="logo"
              name="logo"
              accept="image/*"
              onChange={handleFileChange}
              required
            />
            {logoPreview && (
              <div className="logo-preview-wrapper" style={{ marginTop: "12px" }}>
                <img
                  src={logoPreview}
                  alt="Logo Preview"
                  style={{
                    maxWidth: "120px",
                    maxHeight: "120px",
                    borderRadius: "12px",
                    border: "1px dashed var(--admin-blue, #2563eb)",
                    padding: "4px",
                    objectFit: "cover",
                  }}
                />
              </div>
            )}
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