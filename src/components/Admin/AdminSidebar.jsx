import { NavLink, useNavigate } from "react-router-dom";
import { getAdminUser } from "../../pages/Admin/adminApi";
import "../../pages/Admin/Admin.css";

function AdminSidebar() {
  const navigate = useNavigate();
  const user = getAdminUser();

  function handleLogout() {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");

    navigate("/login");
  }

  return (
    <aside className="admin-sidebar">
      <div className="admin-brand">
        <span className="admin-brand-mark">S</span>
        <div>
          <strong>Shopmee</strong>
          <small>Admin</small>
        </div>
      </div>

      <div className="admin-profile">
        <span>{user?.name?.charAt(0)?.toUpperCase() || "A"}</span>
        <div>
          <strong>{user?.name || "Administrator"}</strong>
          <small>{user?.email || "admin"}</small>
        </div>
      </div>

      <nav className="admin-nav">
        <NavLink to="/admin" end>
          Dashboard
        </NavLink>

        <NavLink to="/admin/shops">Shops</NavLink>

        <NavLink to="/admin/orders">Orders</NavLink>
      </nav>

      <button
        className="admin-logout-button"
        type="button"
        onClick={handleLogout}
      >
        Đăng xuất
      </button>
    </aside>
  );
}

export default AdminSidebar;
