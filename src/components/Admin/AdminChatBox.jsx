import { useEffect, useState, useRef } from "react";

function formatChatTime(timestamp) {
  const date = new Date(timestamp);
  return date.toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function loadChatMessages() {
  try {
    const stored = localStorage.getItem("adminChatMessages");
    if (!stored) return [];
    return JSON.parse(stored) || [];
  } catch {
    return [];
  }
}

function saveChatMessages(messages) {
  try {
    localStorage.setItem("adminChatMessages", JSON.stringify(messages));
  } catch {
    // Ignore storage errors.
  }
}

const SUGGESTIONS = [
  "Sản phẩm nào bán chạy nhất?",
  "Chính sách đổi trả hàng ra sao?",
  "Mất bao lâu để nhận hàng?",
  "Làm thế nào để được miễn phí ship?"
];

function AdminChatBox() {
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const inputRef = useRef(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const initialMessages = loadChatMessages();

    if (initialMessages.length > 0) {
      setMessages(initialMessages);
      return;
    }

    const welcome = [
      {
        id: "welcome",
        sender: "system",
        text: "Xin chào! Mee AI sẵn sàng hỗ trợ. Bạn có thể hỏi bất cứ câu hỏi nào về sản phẩm, chính sách cửa hàng hoặc đơn hàng của mình.",
        time: new Date().toISOString(),
      },
    ];

    setMessages(welcome);
    saveChatMessages(welcome);
  }, []);

  useEffect(() => {
    // focus input on mount for better UX
    if (inputRef.current) inputRef.current.focus();
  }, []);

  useEffect(() => {
    // auto-scroll to bottom when new messages arrive or typing state changes
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isTyping]);

  function appendMessage(sender, text) {
    const msg = {
      id: `${Date.now()}-${Math.random()}`,
      sender,
      text,
      time: new Date().toISOString(),
    };

    setMessages((prev) => {
      const nextMessages = [...prev, msg];
      saveChatMessages(nextMessages);
      return nextMessages;
    });
  }

  async function callGeminiApi(message) {
    const token = localStorage.getItem("access_token");
    if (!token) {
      return "⚠️ Vui lòng đăng nhập để trò chuyện với Mee AI.";
    }

    try {
      const res = await fetch("http://127.0.0.1:8000/api/v1/chat/gemini", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ message }),
      });

      const data = await res.json();

      if (!res.ok) {
        // If the server returns an error (like missing gemini api key 503 response)
        return data.message || `Lỗi hệ thống (Mã lỗi: ${res.status}).`;
      }

      return data.data?.reply || data.message || "Không có phản hồi từ AI.";
    } catch (err) {
      console.error(err);
      return "⚠️ Không thể kết nối tới máy chủ AI. Vui lòng kiểm tra lại kết nối mạng của bạn.";
    }
  }

  async function sendMessage(text) {
    appendMessage("admin", text);
    setIsTyping(true);

    const reply = await callGeminiApi(text);
    setIsTyping(false);

    appendMessage("system", reply);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const trimmed = messageText.trim();
    if (!trimmed || isTyping) return;

    setMessageText("");
    await sendMessage(trimmed);
  }

  async function handleSuggestionClick(suggestion) {
    if (isTyping) return;
    await sendMessage(suggestion);
  }

  return (
    <div className="admin-panel admin-chatbox-panel">
      <div className="chatbox-body">
        {/* Messages List */}
        <div className="chatbox-messages" role="log" aria-live="polite">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`chatbox-message-row chatbox-message-${message.sender}`}
            >
              <div className="chatbox-avatar">
                {message.sender === "admin" ? "👤" : "✨"}
              </div>
              <div className="chatbox-message-wrapper">
                <div className="chatbox-message-content">{message.text}</div>
                <div className="chatbox-message-meta">
                  <strong>{message.sender === "admin" ? "Bạn" : "Mee AI"}</strong>
                  <small>{formatChatTime(message.time)}</small>
                </div>
              </div>
            </div>
          ))}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="chatbox-message-row chatbox-message-system">
              <div className="chatbox-avatar">✨</div>
              <div className="chatbox-message-wrapper">
                <div className="chatbox-message-content">
                  <div className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
                <div className="chatbox-message-meta">
                  <strong>Mee AI</strong>
                  <small>Đang soạn...</small>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Suggestion Prompts */}
        {messages.length <= 1 && !isTyping && (
          <div className="chatbox-suggestions-container">
            {SUGGESTIONS.map((sug, idx) => (
              <button
                key={idx}
                type="button"
                className="chatbox-suggestion-tag"
                onClick={() => handleSuggestionClick(sug)}
              >
                {sug}
              </button>
            ))}
          </div>
        )}

        {/* Chat Input Bar */}
        <div className="chatbox-form-wrapper">
          <form className="chatbox-input-container" onSubmit={handleSubmit}>
            <input
              ref={inputRef}
              type="text"
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              placeholder="Hỏi Mee AI bất cứ điều gì..."
              className="chatbox-input"
              disabled={isTyping}
            />
            <button
              type="submit"
              className="chatbox-send-btn"
              disabled={!messageText.trim() || isTyping}
              aria-label="Gửi tin nhắn"
            >
              <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
              </svg>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AdminChatBox;
