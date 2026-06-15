import React, { createContext, useContext, useState } from "react";
import { Routes, Route } from "react-router-dom";
import SellerSidebar from "../components/Seller/SellerSidebar";

import Dashboard from "../pages/Seller/Dashboard";
import Products from "../pages/Seller/Products";
import Orders from "../pages/Seller/Orders";
import EditProduct from "../pages/Seller/EditProduct";
import SellerChat from "../pages/Seller/SellerChat";
import ShopSettings from "../pages/Seller/ShopSettings";

import "../pages/Seller/Seller.css";

export const SellerAlertContext = createContext();

export const useSellerAlert = () => useContext(SellerAlertContext);

function SellerLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    type: "info", // "success" | "error" | "info" | "confirm"
    title: "Thông báo",
    message: "",
    onConfirm: null,
    onClose: null,
  });

  const showAlert = (message, type = "info", title = "Thông báo") => {
    return new Promise((resolve) => {
      setModalConfig({
        isOpen: true,
        type,
        title,
        message,
        onConfirm: null,
        onClose: () => {
          setModalConfig((prev) => ({ ...prev, isOpen: false }));
          resolve(true);
        },
      });
    });
  };

  const showConfirm = (message, title = "Xác nhận") => {
    return new Promise((resolve) => {
      setModalConfig({
        isOpen: true,
        type: "confirm",
        title,
        message,
        onConfirm: () => {
          setModalConfig((prev) => ({ ...prev, isOpen: false }));
          resolve(true);
        },
        onClose: () => {
          setModalConfig((prev) => ({ ...prev, isOpen: false }));
          resolve(false);
        },
      });
    });
  };

  const getModalIcon = (type) => {
    switch (type) {
      case "success":
        return "✨";
      case "error":
        return "❌";
      case "confirm":
        return "❓";
      default:
        return "ℹ️";
    }
  };

  return (
    <SellerAlertContext.Provider value={{ showAlert, showConfirm }}>
      <div className="seller-layout">
        {/* Mobile Top Header */}
        <div className="seller-mobile-header">
          <button className="hamburger-btn" onClick={() => setSidebarOpen(true)}>
            ☰
          </button>
          <span className="mobile-brand-title">Shopmee Seller</span>
        </div>

        <SellerSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        {/* Sidebar Backdrop Overlay on Mobile */}
        {sidebarOpen && (
          <div className="sidebar-backdrop" onClick={() => setSidebarOpen(false)}></div>
        )}

        <div className="seller-main">
          <Routes>
            <Route index element={<Dashboard />} />
            <Route path="products" element={<Products />} />
            <Route path="orders" element={<Orders />} />
            <Route path="edit-product" element={<EditProduct />} />
            <Route path="shop-settings" element={<ShopSettings />} />
            <Route path="chat" element={<SellerChat />} />
          </Routes>
        </div>

        {/* Custom Modal Popup Dialog */}
        {modalConfig.isOpen && (
          <div className="seller-modal-overlay">
            <div className="seller-modal-box">
              <div className={`seller-modal-icon seller-modal-icon-${modalConfig.type}`}>
                {getModalIcon(modalConfig.type)}
              </div>
              <h3 className="seller-modal-title">{modalConfig.title}</h3>
              <p className="seller-modal-message">{modalConfig.message}</p>
              
              <div className="seller-modal-actions">
                {modalConfig.type === "confirm" ? (
                  <>
                    <button
                      className="seller-modal-btn seller-modal-btn-cancel"
                      onClick={() => modalConfig.onClose && modalConfig.onClose()}
                    >
                      Hủy bỏ
                    </button>
                    <button
                      className="seller-modal-btn seller-modal-btn-confirm"
                      onClick={() => modalConfig.onConfirm && modalConfig.onConfirm()}
                    >
                      Đồng ý
                    </button>
                  </>
                ) : (
                  <button
                    className={`seller-modal-btn seller-modal-btn-${modalConfig.type}`}
                    onClick={() => modalConfig.onClose && modalConfig.onClose()}
                  >
                    Đóng
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </SellerAlertContext.Provider>
  );
}

export default SellerLayout;
