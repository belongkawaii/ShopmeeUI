import { Link, useNavigate } from "react-router-dom";
import "../../pages/Admin/Admin.css";

function AdminSidebar() {
  const navigate = useNavigate();

  function handleLogout() {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");

    navigate("/login");
  }

  return (
    <aside className="admin-sidebar">
      <h2>Administrator</h2>

      <nav>
        <Link to="/admin">
          📊 Dashboard
        </Link>

        <Link to="/admin/shops">
          🏪 Shops
        </Link>

        <Link to="/admin/orders">
          🧾 Orders
        </Link>

        <Link to="/admin/users">
          👤 Users
        </Link>

        <Link to="/admin/products">
          📦 Products
        </Link>

        <button
          className="sidebar-link logout-link"
          onClick={handleLogout}
        >
          🚪 Đăng xuất
        </button>
      </nav>
    </aside>
  );
}

export default AdminSidebar;