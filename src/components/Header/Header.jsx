import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Header.css";
import logoImg from "../../assets/Logo-removebg.png";
import { API_BASE_URL } from "../../config";

function getStoredUser() {
  try {
    const storedUser = localStorage.getItem("user");

    return storedUser ? JSON.parse(storedUser) : null;
  } catch {
    return null;
  }
}

function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);

  const navigate = useNavigate();
  const user = getStoredUser();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  async function fetchCartCount() {
    const token = localStorage.getItem("access_token");
    if (!token) return;

    try {
      const response = await fetch(`${API_BASE_URL}/cart/count`, {
        headers: {
          "Accept": "application/json",
          "Authorization": `Bearer ${token}`
        }
      });
      const result = await response.json();
      if (response.ok && result.success) {
        setCartCount(result.count);
      }
    } catch (error) {
      console.error("Lỗi lấy số lượng giỏ hàng:", error);
    }
  }

  useEffect(() => {
    if (user) {
      fetchCartCount();
    }

    const handleCartUpdate = () => {
      fetchCartCount();
    };

    window.addEventListener("cartUpdated", handleCartUpdate);
    return () => {
      window.removeEventListener("cartUpdated", handleCartUpdate);
    };
  }, []);

  function handleLogout() {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");
    localStorage.removeItem("adminChatMessages");

    navigate("/");
    window.location.reload();
  }

  return (
    <header className="header-container">
      <nav className="navbar">
        <div className="navbar-content">
          <Link to="/">
            <img src={logoImg} alt="Logo" className="logo-image" />
          </Link>

          <button className="menu-toggle" onClick={toggleMenu}>
            <span className={isMenuOpen ? "bar open" : "bar"}></span>
            <span className={isMenuOpen ? "bar open" : "bar"}></span>
            <span className={isMenuOpen ? "bar open" : "bar"}></span>
          </button>

          <ul className={`nav-links ${isMenuOpen ? "active" : ""}`}>
            <li>
              <Link to="/" onClick={() => setIsMenuOpen(false)}>
                Trang chủ
              </Link>
            </li>

            <li>
              <Link to="/cart" className="cart-nav-link" onClick={() => setIsMenuOpen(false)}>
                🛒 Giỏ hàng
                {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
              </Link>
            </li>

            {!user ? (
              <li>
                <Link
                  to="/login"
                  className="login-link"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Đăng nhập
                </Link>
              </li>
            ) : (
              <>
                <li>
                  <Link to="/orders" onClick={() => setIsMenuOpen(false)}>
                    📦 Đơn hàng
                  </Link>
                </li>

                {user.role === "admin" || user.role === "seller" ? (
                  <li>
                    <Link to="/seller" onClick={() => setIsMenuOpen(false)}>
                      🏪 Quản lý shop
                    </Link>
                  </li>
                ) : (
                  <li>
                    <Link to="/shop/register" onClick={() => setIsMenuOpen(false)}>
                      🏪 Đăng ký shop
                    </Link>
                  </li>
                )}

                <li>
                  <Link to="/profile" onClick={() => setIsMenuOpen(false)} className="user-name">
                    Xin chào, {user.name || user.email}
                  </Link>
                </li>

                <li>
                  <button
                    type="button"
                    className="logout-link"
                    onClick={handleLogout}
                  >
                    Đăng xuất
                  </button>
                </li>
              </>
            )}
          </ul>
        </div>
      </nav>
    </header>
  );
}

export default Header;
