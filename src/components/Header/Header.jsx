import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Header.css";
import logoImg from "../../assets/Logo-removebg.png";

function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navigate = useNavigate();

  const user = JSON.parse(
    localStorage.getItem("user")
  );

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  function handleLogout() {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");

    navigate("/");
    window.location.reload();
  }

  return (
    <header className="header-container">
      <nav className="navbar">
        <div className="navbar-content">
          <Link to="/">
            <img
              src={logoImg}
              alt="Logo"
              className="logo-image"
            />
          </Link>

          <button
            className="menu-toggle"
            onClick={toggleMenu}
          >
            <span
              className={
                isMenuOpen ? "bar open" : "bar"
              }
            ></span>

            <span
              className={
                isMenuOpen ? "bar open" : "bar"
              }
            ></span>

            <span
              className={
                isMenuOpen ? "bar open" : "bar"
              }
            ></span>
          </button>

          <ul
            className={`nav-links ${
              isMenuOpen ? "active" : ""
            }`}
          >
            <li>
              <Link
                to="/"
                onClick={() =>
                  setIsMenuOpen(false)
                }
              >
                Trang chủ
              </Link>
            </li>

            <li>
              <a href="#products">
                Sản phẩm
              </a>
            </li>

            {!user ? (
              <li>
                <Link
                  to="/login"
                  className="login-link"
                  onClick={() =>
                    setIsMenuOpen(false)
                  }
                >
                  Đăng nhập
                </Link>
              </li>
            ) : (
              <>
                <li className="user-name">
                  Xin chào, {user.name}
                </li>

                <li>
                    <a
                      href="#"
                      className="logout-link"
                      onClick={(e) => {
                        e.preventDefault();
                        handleLogout();
                      }}
                    >
                      Đăng xuất
                    </a>
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