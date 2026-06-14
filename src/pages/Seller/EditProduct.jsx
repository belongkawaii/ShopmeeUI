import { useState } from "react";
import AddProduct from "../../components/Seller/AddProduct";
import ChangeProduct from "../../components/Seller/ChangeProduct";
import "./EditProduct.css";

function EditProducts() {
  const [activeTab, setActiveTab] = useState("add");

  return (
    <div className="edit-products-page">
      <div className="edit-products-container">
        <div className="tabs">
          <button
            className={`tab-btn ${activeTab === "add" ? "active" : ""}`}
            onClick={() => setActiveTab("add")}
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
          {activeTab === "add" ? <AddProduct /> : <ChangeProduct />}
        </div>
      </div>
    </div>
  );
}


export default EditProducts;