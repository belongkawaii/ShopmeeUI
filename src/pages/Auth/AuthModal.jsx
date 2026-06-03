import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./AuthModal.css";
import bannerImg from "../../assets/hero-banner.png";

// 1. Component con cho Đăng nhập
function LoginForm() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(e) {
    e.preventDefault();

    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/api/v1/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            email,
            password,
          }),
        }
      );

      const result = await response.json();

      if (!result.success) {
        throw new Error(
          result.message || "Đăng nhập thất bại"
        );
      }

      localStorage.setItem(
        "access_token",
        result.data.access_token
      );

      localStorage.setItem(
        "user",
        JSON.stringify(result.data.user)
      );

      navigate("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      className="fade-in"
      onSubmit={handleLogin}
    >
      <div className="input-group">
        <label>Email</label>

        <input
          type="email"
          placeholder="Nhập email..."
          value={email}
          onChange={(e) =>
            setEmail(e.target.value)
          }
          required
        />
      </div>

      <div className="input-group">
        <label>Mật khẩu</label>

        <input
          type="password"
          placeholder="Nhập mật khẩu..."
          value={password}
          onChange={(e) =>
            setPassword(e.target.value)
          }
          required
        />
      </div>

      {error && (
        <div
          style={{
            color: "#dc2626",
            marginBottom: "12px",
            fontSize: "14px",
          }}
        >
          {error}
        </div>
      )}

      <button
        className="submit-btn"
        type="submit"
        disabled={loading}
      >
        {loading
          ? "Đang đăng nhập..."
          : "Đăng nhập"}
      </button>

      <div className="auth-footer-links">
        <Link to="/" className="small-link">
          ← Quay về Trang chủ
        </Link>

        <Link
          to="/forgot-password"
          className="small-link"
        >
          Quên mật khẩu?
        </Link>
      </div>
    </form>
  );
}

// 2. Component con cho Đăng ký
function RegisterForm() {
  return (
    <form className="fade-in">
      <div className="input-group">
        <label>Họ tên</label>
        <input type="text" placeholder="Nhập họ tên..." />
      </div>
      <div className="input-group">
        <label>Email</label>
        <input type="email" placeholder="Nhập email..." />
      </div>
      <div className="input-group">
        <label>Mật khẩu</label>
        <input type="password" placeholder="Tối thiểu 6 ký tự..." />
      </div>
      <button className="submit-btn" type="button" style={{ backgroundColor: '#28a745' }}>
        Đăng ký
      </button>

      <div className="auth-footer-links">
        <Link to="/" className="small-link">← Quay về trang chủ</Link>
      </div>
    </form>
  );
}

// 3. Component chính
function AuthModal() {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="auth-page" style={{ backgroundImage: `url(${bannerImg})`, backgroundSize: 'cover' }}>
      <div className="blur-overlay"></div>

      <div className="auth-container">
        <div className="auth-tabs">
          <div 
            className={`tab-btn ${isLogin ? 'active' : ''}`} 
            onClick={() => setIsLogin(true)}
          >
            Đăng nhập
          </div>
          <div 
            className={`tab-btn ${!isLogin ? 'active' : ''}`} 
            onClick={() => setIsLogin(false)}
          >
            Đăng ký
          </div>
          <div className={`tab-indicator ${isLogin ? 'left' : 'right'}`}></div>
        </div>

        <div className="form-content">
          {isLogin ? <LoginForm /> : <RegisterForm />}
        </div>
      </div>
    </div>
  );
}

export default AuthModal;