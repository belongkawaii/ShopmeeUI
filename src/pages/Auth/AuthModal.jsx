import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./AuthModal.css";
import bannerImg from "../../assets/hero-banner.png";

const API_BASE_URL = "http://127.0.0.1:8000/api/v1";
const OTP_COOLDOWN_SECONDS = 300;

async function requestApi(path, body) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(body),
  });

  let result;

  try {
    result = await response.json();
  } catch {
    result = {};
  }

  if (!response.ok || result.success === false) {
    throw new Error(result.message || "Có lỗi xảy ra, vui lòng thử lại.");
  }

  return result;
}

function formatTimer(seconds) {
  const minutes = Math.floor(seconds / 60);
  const restSeconds = seconds % 60;

  return `${minutes}:${String(restSeconds).padStart(2, "0")}`;
}

function getResetToken(result) {
  if (typeof result.data === "string") {
    return result.data;
  }

  return (
    result.data?.reset_token ||
    result.data?.token ||
    result.reset_token ||
    result.token
  );
}

function AuthMessage({ type, message }) {
  if (!message) {
    return null;
  }

  return <div className={`auth-message ${type}`}>{message}</div>;
}

function LoginForm({ onForgotPassword }) {
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
      const result = await requestApi("/auth/login", {
        email,
        password,
      });

      const user = result.data?.user;
      const accessToken = result.data?.access_token || result.data?.token;

      if (!user || !accessToken) {
        throw new Error("Dữ liệu đăng nhập không hợp lệ.");
      }

      localStorage.setItem("access_token", accessToken);
      localStorage.setItem("user", JSON.stringify(user));

      if (user.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="fade-in" onSubmit={handleLogin}>
      <div className="input-group">
        <label>Email</label>
        <input
          type="email"
          placeholder="Nhập email..."
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>

      <div className="input-group">
        <label>Mật khẩu</label>
        <input
          type="password"
          placeholder="Nhập mật khẩu..."
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>

      <AuthMessage type="error" message={error} />

      <button className="submit-btn" type="submit" disabled={loading}>
        {loading ? "Đang đăng nhập..." : "Đăng nhập"}
      </button>

      <div className="auth-footer-links">
        <Link to="/" className="small-link">
          ← Quay về Trang chủ
        </Link>

        <button
          type="button"
          className="small-link link-button"
          onClick={onForgotPassword}
        >
          Quên mật khẩu?
        </button>
      </div>
    </form>
  );
}

function ForgotPasswordForm({ onBackToLogin }) {
  const [step, setStep] = useState("email");
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSeconds, setResendSeconds] = useState(0);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (resendSeconds <= 0) {
      return undefined;
    }

    const timerId = window.setInterval(() => {
      setResendSeconds((current) => Math.max(current - 1, 0));
    }, 1000);

    return () => window.clearInterval(timerId);
  }, [resendSeconds]);

  const passwordsMatch =
    confirmPassword.length === 0 || newPassword === confirmPassword;

  async function sendForgotPasswordOtp(isResend = false) {
    if (isResend) {
      setResendLoading(true);
    } else {
      setLoading(true);
    }

    setError("");
    setSuccess("");

    try {
      await requestApi("/password/forgot", { email });
      setStep("reset");
      setResendSeconds(OTP_COOLDOWN_SECONDS);
      setSuccess("Mã OTP đã được gửi tới Gmail của bạn.");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setResendLoading(false);
    }
  }

  async function handleSendOtp(e) {
    e.preventDefault();
    await sendForgotPasswordOtp(false);
  }

  async function handleResendOtp() {
    if (resendSeconds > 0 || resendLoading) {
      return;
    }

    await sendForgotPasswordOtp(true);
  }

  async function handleResetPassword(e) {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (newPassword !== confirmPassword) {
      setError("Mật khẩu xác nhận chưa trùng với mật khẩu mới.");
      return;
    }

    setLoading(true);

    try {
      const verifyResult = await requestApi("/password/verify", {
        email,
        otp_code: otp,
      });

      const resetToken = getResetToken(verifyResult);

      if (!resetToken) {
        throw new Error("Không nhận được mã xác thực đổi mật khẩu.");
      }

      const resetPayload = {
        reset_token: resetToken,
        password: newPassword,
        password_confirmation: confirmPassword,
      };

      await requestApi("/password/reset", resetPayload);
      setSuccess("Đặt lại mật khẩu thành công. Bạn có thể đăng nhập lại.");
      setNewPassword("");
      setConfirmPassword("");
      setOtp("");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (step === "email") {
    return (
      <form className="fade-in" onSubmit={handleSendOtp}>
        <h3 className="form-title">Quên mật khẩu</h3>
        <p className="form-hint">
          Nhập Gmail đã đăng ký để nhận mã OTP đặt lại mật khẩu.
        </p>

        <div className="input-group">
          <label>Gmail</label>
          <input
            type="email"
            placeholder="Nhập Gmail..."
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <AuthMessage type="error" message={error} />
        <AuthMessage type="success" message={success} />

        <button className="submit-btn" type="submit" disabled={loading}>
          {loading ? "Đang gửi OTP..." : "Xác nhận"}
        </button>

        <div className="auth-footer-links single-link">
          <button
            type="button"
            className="small-link link-button"
            onClick={onBackToLogin}
          >
            ← Quay lại đăng nhập
          </button>
        </div>
      </form>
    );
  }

  return (
    <form className="fade-in" onSubmit={handleResetPassword}>
      <h3 className="form-title">Đặt lại mật khẩu</h3>
      <p className="form-hint">
        Nhập mật khẩu mới và mã OTP đã được gửi tới {email}.
      </p>

      <div className="input-group">
        <label>Mật khẩu mới</label>
        <input
          type="password"
          placeholder="Nhập mật khẩu mới..."
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          minLength={6}
          required
        />
      </div>

      <div className="input-group">
        <label>Xác nhận mật khẩu</label>
        <input
          type="password"
          placeholder="Nhập lại mật khẩu mới..."
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          minLength={6}
          required
        />
        {!passwordsMatch && (
          <span className="field-warning">
            Mật khẩu xác nhận chưa trùng khớp.
          </span>
        )}
      </div>

      <div className="input-group">
        <label>Mã OTP</label>
        <div className="otp-input-row">
          <input
            type="text"
            placeholder="Nhập mã OTP..."
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            required
          />
          <button
            type="button"
            className="resend-otp-btn"
            onClick={handleResendOtp}
            disabled={resendSeconds > 0 || resendLoading}
          >
            {resendSeconds > 0
              ? `Gửi lại sau ${formatTimer(resendSeconds)}`
              : resendLoading
                ? "Đang gửi..."
                : "Gửi lại mã OTP"}
          </button>
        </div>
      </div>

      <AuthMessage type="error" message={error} />
      <AuthMessage type="success" message={success} />

      <button
        className="submit-btn"
        type="submit"
        disabled={loading || !passwordsMatch}
      >
        {loading ? "Đang xác nhận..." : "Xác nhận"}
      </button>

      <div className="auth-footer-links single-link">
        <button
          type="button"
          className="small-link link-button"
          onClick={onBackToLogin}
        >
          ← Quay lại đăng nhập
        </button>
      </div>
    </form>
  );
}

function RegisterForm({ onShowLogin }) {
  const [isOtpVisible, setIsOtpVisible] = useState(false);
  const [verified, setVerified] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  function handleChange(e) {
    const { name, value } = e.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  }

  async function handleRegister(e) {
    e.preventDefault();

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      await requestApi("/register", {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        password_confirmation: formData.password,
      });

      setIsOtpVisible(true);
      setSuccess("Đăng ký thành công. Vui lòng nhập mã OTP để xác nhận.");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyRegisterOtp(e) {
    e.preventDefault();

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      await requestApi("/register/verify", {
        email: formData.email,
        otp_code: otp,
      });

      setVerified(true);
      setSuccess("Xác nhận OTP thành công. Tài khoản đã sẵn sàng đăng nhập.");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (verified) {
    return (
      <div className="fade-in">
        <AuthMessage type="success" message={success} />
        <button className="submit-btn" type="button" onClick={onShowLogin}>
          Đăng nhập ngay
        </button>

        <div className="auth-footer-links single-link">
          <Link to="/" className="small-link">
            ← Quay về trang chủ
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form
      className="fade-in"
      onSubmit={isOtpVisible ? handleVerifyRegisterOtp : handleRegister}
    >
      <div className="input-group">
        <label>Họ tên</label>
        <input
          type="text"
          name="name"
          placeholder="Nhập họ tên..."
          value={formData.name}
          onChange={handleChange}
          required
        />
      </div>

      <div className="input-group">
        <label>Gmail</label>
        <input
          type="email"
          name="email"
          placeholder="Nhập Gmail..."
          value={formData.email}
          onChange={handleChange}
          required
        />
      </div>

      <div className="input-group">
        <label>Số điện thoại</label>
        <input
          type="tel"
          name="phone"
          placeholder="Nhập số điện thoại..."
          value={formData.phone}
          onChange={handleChange}
          required
        />
      </div>

      <div className="input-group">
        <label>Mật khẩu</label>
        <input
          type="password"
          name="password"
          placeholder="Tối thiểu 6 ký tự..."
          value={formData.password}
          onChange={handleChange}
          minLength={6}
          required
        />
      </div>

      {isOtpVisible && (
        <div className="input-group">
          <label>Mã OTP</label>
          <input
            type="text"
            placeholder="Nhập mã OTP..."
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            required
          />
        </div>
      )}

      <AuthMessage type="error" message={error} />
      <AuthMessage type="success" message={success} />

      <button
        className="submit-btn register-submit"
        type="submit"
        disabled={loading}
      >
        {loading
          ? isOtpVisible
            ? "Đang xác nhận..."
            : "Đang đăng ký..."
          : isOtpVisible
            ? "Xác nhận OTP"
            : "Đăng ký"}
      </button>

      <div className="auth-footer-links">
        <Link to="/" className="small-link">
          ← Quay về trang chủ
        </Link>
      </div>
    </form>
  );
}

function AuthModal() {
  const [currentView, setCurrentView] = useState("login");
  const isLoginTab = currentView === "login" || currentView === "forgot";

  function showLogin() {
    setCurrentView("login");
  }

  function showRegister() {
    setCurrentView("register");
  }

  return (
    <div
      className="auth-page"
      style={{ backgroundImage: `url(${bannerImg})`, backgroundSize: "cover" }}
    >
      <div className="blur-overlay"></div>

      <div className="auth-container">
        <div className="auth-tabs">
          <button
            type="button"
            className={`tab-btn ${isLoginTab ? "active" : ""}`}
            onClick={showLogin}
          >
            Đăng nhập
          </button>
          <button
            type="button"
            className={`tab-btn ${!isLoginTab ? "active" : ""}`}
            onClick={showRegister}
          >
            Đăng ký
          </button>
          <div className={`tab-indicator ${isLoginTab ? "left" : "right"}`}></div>
        </div>

        <div className="form-content">
          {currentView === "login" && (
            <LoginForm onForgotPassword={() => setCurrentView("forgot")} />
          )}

          {currentView === "forgot" && (
            <ForgotPasswordForm onBackToLogin={showLogin} />
          )}

          {currentView === "register" && (
            <RegisterForm onShowLogin={showLogin} />
          )}
        </div>
      </div>
    </div>
  );
}

export default AuthModal;
