import AdminChatBox from "../../components/Admin/AdminChatBox";
import "../../pages/Admin/Admin.css"; // Ensure admin chatbox styles are loaded

function SellerChat() {
  return (
    <div className="seller-page">
      <div className="seller-page-header" style={{ marginBottom: "20px" }}>
        <div>
          <span className="seller-eyebrow" style={{ color: "var(--admin-blue, #2563eb)", fontWeight: "800", fontSize: "0.8rem", textTransform: "uppercase" }}>
            Trợ lý AI
          </span>
          <h1 style={{ fontSize: "2rem", margin: "5px 0 0 0" }}>Mee AI</h1>
        </div>
      </div>

      <AdminChatBox />
    </div>
  );
}

export default SellerChat;
