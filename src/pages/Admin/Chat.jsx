import AdminChatBox from "../../components/Admin/AdminChatBox";

function Chat() {
  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <span className="admin-eyebrow">Trợ lý AI</span>
          <h1>Mee AI</h1>
        </div>
      </div>

      <AdminChatBox />
    </div>
  );
}

export default Chat;
