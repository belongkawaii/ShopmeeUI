import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { changePassword } from "../../pages/Profile/profileApi";
import { useCustomAlert } from "../../context/CustomAlertContext";

function PasswordInput({ value, onChange, placeholder, name, minLength, required }) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div style={{ position: "relative", width: "100%" }}>
      <input
        type={showPassword ? "text" : "password"}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        minLength={minLength}
        required={required}
        style={{ paddingRight: "40px", width: "100%", boxSizing: "border-box" }} 
      />
      <button
        type="button"
        onClick={() => setShowPassword((prev) => !prev)}
        style={{
          position: "absolute",
          right: "10px",
          top: "50%",
          transform: "translateY(-50%)",
          background: "none",
          border: "none",
          cursor: "pointer",
          color: "#666",
          padding: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {showPassword ? (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
            <circle cx="12" cy="12" r="3"></circle>
          </svg>
        ) : (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24M1 1l22 22"></path>
          </svg>
        )}
      </button>
    </div>
  );
}

function ChangePassword() {
  const [form, setForm] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });

  const navigate = useNavigate();
  const { showSuccess, showError, showWarning } = useCustomAlert();

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      form.new_password !== form.confirm_password
    ) {
      showWarning("Mật khẩu xác nhận không khớp");
      return;
    }

    const result = await changePassword({
      current_password: form.current_password,
      new_password: form.new_password,
      new_password_confirmation:
        form.confirm_password,
    });

    if (result.success) {
      await showSuccess(result.message || "Đổi mật khẩu thành công!");
      localStorage.removeItem("access_token");
      localStorage.removeItem("user");
      navigate("/login");
    } else {
      showError(result.message || "Đổi mật khẩu thất bại.");
    }
  };

  return (
    <>
      <h2>Đổi mật khẩu</h2>

      <form
        className="profile-form"
        onSubmit={handleSubmit}
      >
        <div className="input-group">
          <label>Mật khẩu hiện tại</label>

          <PasswordInput
            type="password"
            name="current_password"
            value={form.current_password}
            onChange={handleChange}
          />
        </div>

        <div className="input-group">
          <label>Mật khẩu mới</label>

          <PasswordInput
            type="password"
            name="new_password"
            value={form.new_password}
            onChange={handleChange}
          />
        </div>

        <div className="input-group">
          <label>Xác nhận mật khẩu</label>

          <PasswordInput
            type="password"
            name="confirm_password"
            value={form.confirm_password}
            onChange={handleChange}
          />
        </div>

        <button
          type="submit"
          className="save-btn"
        >
          Đổi mật khẩu
        </button>
      </form>
    </>
  );
}

export default ChangePassword;