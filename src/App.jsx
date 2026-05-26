import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css'
import MainLayout from "./layouts/MainLayout";
import Home from "./pages/MainContent/Home"; // Trang chủ của bạn
import AuthModal from "./pages/Auth/AuthModal"; // Trang đăng nhập của bạn

function App() {
  return (
    <Router>
      <Routes>
        {/* 1. Trang Đăng nhập: Không nằm trong MainLayout nên sẽ không có Header/Footer */}
        <Route path="/login" element={<AuthModal />} />

        {/* 2. Các trang còn lại: Bọc trong MainLayout */}
        <Route 
          path="/" 
          element={
            <MainLayout>
              <Home />
            </MainLayout>
          } 
        />

        {/* Bạn có thể thêm các trang khác như /cart, /profile vào đây và bọc MainLayout tương tự */}
      </Routes>
    </Router>
  );
}

export default App;