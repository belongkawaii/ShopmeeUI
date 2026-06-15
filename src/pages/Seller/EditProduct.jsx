import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import AddProduct from "../../components/Seller/AddProduct";
import ChangeProduct from "../../components/Seller/ChangeProduct";
import "./EditProduct.css";

function EditProducts() {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("add");
  const [productId, setProductId] = useState(null);

  useEffect(() => {
    if (location.state?.tab) {
      setActiveTab(location.state.tab);
    }
    if (location.state?.productId) {
      setProductId(location.state.productId);
    }
  }, [location.state]);

  return (
    <div className="edit-products-page">
      <div className="edit-products-container">
        <div className="tabs">
          <button
            className={`tab-btn ${activeTab === "add" ? "active" : ""}`}
            onClick={() => {
              setActiveTab("add");
              setProductId(null);
            }}
          >
            Thêm sản phẩm
          </button>

          <button
            className={`tab-btn ${activeTab === "change" ? "active" : ""}`}
            onClick={() => setActiveTab("change")}
          >
            Chỉnh sửa sản phẩm
          </button>
        </div>

        <div className="content-card">
          {activeTab === "add" ? (
            <AddProduct />
          ) : (
            <ChangeProduct initialProductId={productId} />
          )}
        </div>
      </div>
    </div>
  );
}

export default EditProducts;