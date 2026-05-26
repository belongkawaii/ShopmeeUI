import { useState } from "react";
import { Link } from "react-router-dom"; // 1. Import Link
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
          {/* Bao logo bằng Link để nhấn vào quay về trang chủ */}
          <Link to="/">
            <img src={logoImg} alt="Logo" className="logo-image" />
          </Link>

          <button className="menu-toggle" onClick={toggleMenu}>
            <span className={isMenuOpen ? "bar open" : "bar"}></span>
            <span className={isMenuOpen ? "bar open" : "bar"}></span>
            <span className={isMenuOpen ? "bar open" : "bar"}></span>
          </button>

          <ul className={`nav-links ${isMenuOpen ? "active" : ""}`}>
            {/* 2. Thay href="#home" bằng to="/" */}
            <li><Link to="/" onClick={() => setIsMenuOpen(false)}>Trang chủ</Link></li>
            
            {/* Với các phần cuộn trang trong cùng 1 trang, bạn có thể giữ thẻ <a> 
                hoặc xử lý riêng, nhưng với trang Đăng Nhập thì bắt buộc dùng Link */}
            <li><a href="#products">Sản phẩm</a></li>
            
            {/* 3. Thay href="#login" bằng to="/login" */}
            <li>
              <Link to="/login" className="login-link" onClick={() => setIsMenuOpen(false)}>
                Đăng Nhập
              </Link>
            </li>
          </ul>
        </div>
      </nav>
    </header>
  );
}

export default Header;