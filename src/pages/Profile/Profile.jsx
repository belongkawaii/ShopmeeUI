import { useState } from "react";

import { useNavigate } from "react-router-dom";

import "./Profile.css";

import PersonalInfo from "../../components/Profile/PersonalInfo";
import ChangePassword from "../../components/Profile/ChangePassword";
import Address from "../../components/Profile/Address";

function Profile() {
  const [activeTab, setActiveTab] =
    useState("info");

    const navigate = useNavigate();

  return (
    <div className="profile-page">
      <div className="profile-container">

        <aside className="profile-sidebar">
          <button
            className="home-btn"
            onClick={() => navigate("/")}
          >
            ← Quay về trang chủ
          </button>

          <h2>Tài khoản</h2>

          <button
            className={activeTab === "info" ? "active" : ""}
            onClick={() => setActiveTab("info")}
          >
            Thông tin cá nhân
          </button>

          <button
            className={activeTab === "password" ? "active" : ""}
            onClick={() => setActiveTab("password")}
          >
            Đổi mật khẩu
          </button>

          <button
            className={activeTab === "address" ? "active" : ""}
            onClick={() => setActiveTab("address")}
          >
            Địa chỉ giao hàng
          </button>
        </aside>

        <main className="profile-content">
          {activeTab === "info" && (
            <PersonalInfo />
          )}

          {activeTab === "password" && (
            <ChangePassword />
          )}

          {activeTab === "address" && (
            <Address />
          )}
        </main>

      </div>
    </div>
  );
}

export default Profile;