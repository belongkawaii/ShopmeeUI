import { Routes, Route } from "react-router-dom";
import SellerSidebar from "../components/Seller/SellerSidebar";

import Dashboard from "../pages/Seller/Dashboard";
import Products from "../pages/Seller/Products";
import Orders from "../pages/Seller/Orders";
import EditProduct from "../pages/Seller/EditProduct";

import "../pages/Seller/Seller.css";

function SellerLayout() {
  return (
    <div className="seller-layout">
      <SellerSidebar />

      <div className="seller-main">
        <Routes>
          <Route index element={<Dashboard />} />
          <Route path="products" element={<Products />} />
          <Route path="orders" element={<Orders />} />
          <Route path="edit-product" element={<EditProduct />} />
        </Routes>
      </div>
    </div>
  );
}

export default SellerLayout;
