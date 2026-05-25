import { useState } from "react";
import "./Header.css";
import logoImg from "../../assets/Logo-removebg.png";

function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="header-container">
      <nav className="navbar">
        <div className="navbar-content">
          <img src={logoImg} alt="Logo" className="logo-image" />

          <button className="menu-toggle" onClick={toggleMenu}>
            <span className={isMenuOpen ? "bar open" : "bar"}></span>
            <span className={isMenuOpen ? "bar open" : "bar"}></span>
            <span className={isMenuOpen ? "bar open" : "bar"}></span>
          </button>
          <ul className={`nav-links ${isMenuOpen ? "active" : ""}`}>
            <li><a href="#home">Trang chủ</a></li>
            <li><a href="#products">Sản phẩm</a></li>
            {/* <li className="cart-link"><a href="#cart">Giỏ hàng (0)</a></li> */}
            <li><a href="#login">Đăng Nhập</a></li>
            <li><a href="#register">Đăng Ký</a></li>
          </ul>
        </div>
      </nav>
    </header>
  );
}

export default Header;