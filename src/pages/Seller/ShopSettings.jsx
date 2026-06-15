import { useState, useEffect } from "react";
import { useSellerAlert } from "../../layouts/SellerLayout";
import { getSellerShop, updateSellerShop } from "./sellerApi";
import "./ShopSettings.css";

function ShopSettings() {
  const { showAlert } = useSellerAlert();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [shop, setShop] = useState(null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState("");

  const fetchShopInfo = async () => {
    setLoading(true);
    try {
      const result = await getSellerShop();
      if (result.success) {
        setShop(result.data);
        setName(result.data.name || "");
        setDescription(result.data.description || "");
        setLogoPreview(result.data.logo_url || "");
      } else {
        showAlert(result.message || "Không thể tải thông tin Shop.", "error");
      }
    } catch (error) {
      console.error(error);
      showAlert("Lỗi kết nối máy chủ.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShopInfo();
  }, []);

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        showAlert("Ảnh logo không được vượt quá 2MB.", "error");
        return;
      }
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleRemoveLogo = () => {
    setLogoFile(null);
    setLogoPreview(shop?.logo_url || "");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      showAlert("Vui lòng nhập tên Shop.", "error");
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("name", name.trim());
      formData.append("description", description.trim());
      if (logoFile) {
        formData.append("logo", logoFile);
      }

      const result = await updateSellerShop(formData);
      if (result.success) {
        await showAlert("Cập nhật thông tin cửa hàng thành công!", "success");
        setShop(result.data);
        setName(result.data.name || "");
        setDescription(result.data.description || "");
        setLogoPreview(result.data.logo_url || "");
        setLogoFile(null);
      } else {
        showAlert(result.message || "Cập nhật thất bại.", "error");
      }
    } catch (error) {
      console.error(error);
      showAlert("Lỗi khi kết nối máy chủ.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="seller-page">
        <div className="seller-loading-state">
          <div className="spinner"></div>
          <p>Đang tải thông tin cửa hàng...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="seller-page">
      <div className="seller-page-header" style={{ marginBottom: "25px" }}>
        <div>
          <span className="seller-eyebrow">Thiết lập</span>
          <h1>🏪 Cấu hình Cửa hàng</h1>
        </div>
      </div>

      <div className="seller-card shop-settings-card">
        <form onSubmit={handleSubmit} className="shop-settings-form">
          <div className="logo-upload-section">
            <label className="section-label">Logo Cửa hàng</label>
            <div className="logo-preview-wrapper">
              <div className="logo-preview-container">
                {logoPreview ? (
                  <img src={logoPreview} alt="Shop Logo Preview" className="logo-image-preview" />
                ) : (
                  <div className="logo-placeholder">🏪</div>
                )}
                
                <label htmlFor="shop-logo-input" className="logo-overlay">
                  <span>Thay đổi</span>
                </label>
              </div>
              
              <div className="logo-actions">
                <input
                  type="file"
                  id="shop-logo-input"
                  accept="image/*"
                  onChange={handleLogoChange}
                  style={{ display: "none" }}
                />
                <label htmlFor="shop-logo-input" className="seller-btn select-logo-btn">
                  Chọn hình ảnh logo
                </label>
                {logoFile && (
                  <button type="button" className="seller-btn seller-btn-danger remove-logo-btn" onClick={handleRemoveLogo}>
                    Hủy thay đổi
                  </button>
                )}
              </div>
              <small className="logo-hint">Kích thước ảnh tối đa 2MB. Hỗ trợ định dạng PNG, JPG, JPEG, WEBP.</small>
            </div>
          </div>

          <div className="form-fields-section">
            <div className="input-group">
              <label htmlFor="shop-name-input">Tên Cửa hàng <span className="required-star">*</span></label>
              <input
                type="text"
                id="shop-name-input"
                placeholder="Nhập tên cửa hàng của bạn..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={255}
                required
              />
            </div>

            <div className="input-group">
              <label htmlFor="shop-description-input">Mô tả Cửa hàng</label>
              <textarea
                id="shop-description-input"
                rows="6"
                placeholder="Mô tả về cửa hàng, sản phẩm chủ đạo, thông điệp gửi tới khách hàng..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={2000}
              ></textarea>
            </div>

            <div className="submit-section">
              <button
                type="submit"
                className="seller-btn save-shop-btn"
                disabled={submitting}
              >
                {submitting ? "Đang lưu thay đổi..." : "Lưu cấu hình Shop"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ShopSettings;
