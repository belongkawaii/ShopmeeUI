import React, { createContext, useContext, useState } from "react";
import "./CustomAlert.css";

const CustomAlertContext = createContext();

export const useCustomAlert = () => {
  const context = useContext(CustomAlertContext);
  if (!context) {
    throw new Error("useCustomAlert must be used within a CustomAlertProvider");
  }
  return context;
};

export const CustomAlertProvider = ({ children }) => {
  const [config, setConfig] = useState({
    isOpen: false,
    message: "",
    type: "success", // "success" | "error" | "warning" | "confirm"
    resolve: null,
  });

  const showAlert = (message, type = "success") => {
    return new Promise((resolve) => {
      setConfig({
        isOpen: true,
        message,
        type,
        resolve,
      });
    });
  };

  const showSuccess = (message) => showAlert(message, "success");
  const showError = (message) => showAlert(message, "error");
  const showWarning = (message) => showAlert(message, "warning");
  const showConfirm = (message) => {
    return new Promise((resolve) => {
      setConfig({
        isOpen: true,
        message,
        type: "confirm",
        resolve,
      });
    });
  };

  const handleConfirmClose = (value) => {
    if (config.resolve) {
      config.resolve(value);
    }
    setConfig({
      isOpen: false,
      message: "",
      type: "success",
      resolve: null,
    });
  };

  const handleClose = () => {
    handleConfirmClose(true);
  };

  const handleOverlayClick = () => {
    if (config.type === "confirm") {
      handleConfirmClose(false);
    } else {
      handleClose();
    }
  };

  const getTitle = (type) => {
    switch (type) {
      case "success":
        return "Thành công!";
      case "error":
        return "Thất bại!";
      case "warning":
        return "Cảnh báo!";
      case "confirm":
        return "Xác nhận";
      default:
        return "Thông báo";
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case "success":
        return "✓";
      case "error":
        return "✕";
      case "warning":
        return "⚠️";
      case "confirm":
        return "❓";
      default:
        return "ℹ️";
    }
  };

  return (
    <CustomAlertContext.Provider
      value={{ showAlert, showSuccess, showError, showWarning, showConfirm }}
    >
      {children}

      {config.isOpen && (
        <div className="custom-alert-overlay" onClick={handleOverlayClick}>
          <div className="custom-alert-box" onClick={(e) => e.stopPropagation()}>
            <div className={`custom-alert-icon ${config.type}`}>
              {getIcon(config.type)}
            </div>
            <h3 className="custom-alert-title">{getTitle(config.type)}</h3>
            <p className="custom-alert-message">{config.message}</p>
            {config.type === "confirm" ? (
              <div className="custom-alert-actions" style={{ display: "flex", gap: "12px", width: "100%", marginTop: "10px" }}>
                <button
                  className="custom-alert-btn cancel"
                  onClick={() => handleConfirmClose(false)}
                >
                  Hủy bỏ
                </button>
                <button
                  className="custom-alert-btn confirm"
                  onClick={() => handleConfirmClose(true)}
                >
                  Đồng ý
                </button>
              </div>
            ) : (
              <button
                className={`custom-alert-btn ${config.type}`}
                onClick={handleClose}
              >
                Đóng
              </button>
            )}
          </div>
        </div>
      )}
    </CustomAlertContext.Provider>
  );
};
