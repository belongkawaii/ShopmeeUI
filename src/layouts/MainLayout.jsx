import { useState } from "react";
import Header from "../components/Header/Header.jsx";
import Footer from "../components/Footer/Footer.jsx";
import AdminChatBox from "../components/Admin/AdminChatBox";
import "../pages/Admin/Admin.css";

function MainLayout({ children }) {
  const [isMeeAIOpen, setIsMeeAIOpen] = useState(false);
  return (
    <div className="app-container">
      <Header />
      
      <main style={{ flex: "1" }}>
        {children}
      </main>
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
      
      <Footer />
    </div>
  );
}

export default MainLayout;