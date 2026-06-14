import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";

import MainLayout from "./layouts/MainLayout";

import Home from "./pages/MainContent/Home";
import AuthModal from "./pages/Auth/AuthModal";
import ProductDetail from "./pages/ProductDetail/ProductDetail";
import Cart from "./pages/Cart/Cart";
import Orders from "./pages/Orders/Orders";
import AdminLayout from "./layouts/AdminLayout";
import ShopRegister from "./pages/ShopRegister/ShopRegister";
import Seller from "./layouts/SellerLayout";

function App() {
  return (
    <Router>
      <Routes>
        {/* Login */}
        <Route path="/login" element={<AuthModal />} />

        {/* Admin */}
        <Route
          path="/admin/*"
          element={<AdminLayout />}
        />

        {/* Seller */}
        <Route
          path="/seller/*"
          element={
              <Seller />
          }
        />

        {/* Home */}
        <Route
          path="/"
          element={
            <MainLayout>
              <Home />
            </MainLayout>
          }
        />

        {/* Product Detail */}
        <Route
          path="/product/:id"
          element={
            <MainLayout>
              <ProductDetail />
            </MainLayout>
          }
        />

        {/* Cart */}
        <Route
          path="/cart"
          element={
            <MainLayout>
              <Cart />
            </MainLayout>
          }
        />

        {/* Orders */}
        <Route
          path="/orders"
          element={
            <MainLayout>
              <Orders />
            </MainLayout>
          }
        />

          {/* Shop Register */}
        <Route
          path="/shop/register"
          element={
            <MainLayout>
              <ShopRegister />
            </MainLayout>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;