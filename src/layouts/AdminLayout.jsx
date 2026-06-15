import { useState } from "react";
import { Routes, Route } from "react-router-dom";

import AdminSidebar from "../components/Admin/AdminSidebar";
import AdminChatBox from "../components/Admin/AdminChatBox";

import Dashboard from "../pages/Admin/Dashboard";
import Shops from "../pages/Admin/Shops";
import Orders from "../pages/Admin/Orders";
import Products from "../pages/Admin/Products";
import Users from "../pages/Admin/Users";
import Chat from "../pages/Admin/Chat";
import Categories from "../pages/Admin/Categories";


import "../pages/Admin/Admin.css";

function AdminLayout() {
  const [isMeeAIOpen, setIsMeeAIOpen] = useState(false);

  return (
    <div className="admin-layout">
      <AdminSidebar />

      <div className="admin-main">
        <Routes>
          <Route
            index
            element={<Dashboard />}
          />

          <Route
            path="shops"
            element={<Shops />}
          />

          <Route
            path="orders"
            element={<Orders />}
          />
          <Route
            path="products"
            element={<Products />}
          />
          <Route
            path="categories"
            element={<Categories />}
          />
          <Route
            path="users"
            element={<Users />}
          />
          <Route
            path="chat"
            element={<Chat />}
          />
        </Routes>

        <button
          type="button"
          className="meeai-launcher"
          onClick={() => setIsMeeAIOpen(true)}
        >
          Mee AI
        </button>

        <div className={`meeai-panel ${isMeeAIOpen ? "open" : ""}`}>
          <div className="meeai-panel-header">
            <div>
              <strong>Mee AI</strong>
              <small>Hỏi đáp AI cho mọi người</small>
            </div>
            <button
              type="button"
              className="meeai-panel-close"
              onClick={() => setIsMeeAIOpen(false)}
            >
              ✕
            </button>
          </div>
          <div className="meeai-panel-body">
            <AdminChatBox />
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminLayout;