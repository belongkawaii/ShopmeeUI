import { NavLink, useNavigate, Link } from "react-router-dom";
import "../../pages/Seller/Seller.css";

function SellerSidebar() {
  const navigate = useNavigate();
  
  const getStoredUser = () => {
    try {
      const storedUser = localStorage.getItem("user");
      return storedUser ? JSON.parse(storedUser) : null;
    } catch {
      return null;
    }
  };

  const user = getStoredUser();

  function handleLogout() {
    navigate("/");
    window.location.reload();
  }

  return (
    <aside className="seller-sidebar">
      <div className="seller-brand">
        <span className="seller-brand-mark">S</span>
        <div>
          <strong><Link to="/" style={{color: "inherit", textDecoration: "none"}}>Shopmee</Link></strong>
          <small>Kênh Người Bán</small>
        </div>
      </div>

      <div className="seller-profile">
        <span>{user?.name?.charAt(0)?.toUpperCase() || "S"}</span>
        <div>
          <strong>{user?.name || "Seller"}</strong>
          <small>{user?.email || "seller@shopmee.com"}</small>
        </div>
      </div>

      <nav className="seller-nav">
        <NavLink to="/seller" end>
          📊 Thống kê
        </NavLink>

        <NavLink to="/seller/products">📦 Sản phẩm</NavLink>

        <NavLink to="/seller/orders">📝 Đơn hàng</NavLink>
      </nav>

      <button
        className="seller-logout-button"
        type="button"
        onClick={handleLogout}
      >
        Quay lại trang chủ
      </button>
    </aside>
  );
}

export default SellerSidebar;
