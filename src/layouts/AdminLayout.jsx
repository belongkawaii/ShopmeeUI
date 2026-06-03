import { Routes, Route } from "react-router-dom";

import AdminSidebar from "../components/Admin/AdminSidebar";

import Dashboard from "../pages/Admin/Dashboard";
import Shops from "../pages/Admin/Shops";
import Orders from "../pages/Admin/Orders";

import "../pages/Admin/Admin.css";

function AdminLayout() {
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
        </Routes>
      </div>
    </div>
  );
}

export default AdminLayout;