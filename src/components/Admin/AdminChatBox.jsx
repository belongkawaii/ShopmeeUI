import { useEffect, useState, useRef } from "react";

function formatChatTime(timestamp) {
  const date = new Date(timestamp);
  return date.toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
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

function AdminChatBox() {
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState("");
  const textareaRef = useRef(null);
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
        text: "Mee AI sẵn sàng hỗ trợ. Hỏi bất cứ điều gì bạn muốn.",
        time: new Date().toISOString(),
      },
    ];

    setMessages(welcome);
    saveChatMessages(welcome);
  }, []);

  useEffect(() => {
    // focus textarea on mount for better UX on small screens
    if (textareaRef.current) textareaRef.current.focus();
  }, []);

  useEffect(() => {
    // auto-scroll to bottom when new messages arrive
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

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
    try {
      const res = await fetch("http://127.0.0.1:8000/api/v1/chat/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });

      const data = await res.json();

      // extract reply from data.data.reply
      return data.data?.reply || "Lỗi khi gọi API";
    } catch (err) {
      return null;
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const trimmed = messageText.trim();
    if (!trimmed) return;



    // append user's message

    appendMessage("admin", trimmed);
    setMessageText("");

    // add a pending system message we can replace later
    const pendingId = `${Date.now()}-pending-${Math.random()}`;
    const pendingMsg = {
      id: pendingId,
      sender: "system",
      text: "",
      time: new Date().toISOString(),
    };

    // Use functional update so we don't depend on stale `messages` closure
    setMessages((prev) => {
      const nextMessages = [...prev, pendingMsg];
      saveChatMessages(nextMessages);
      return nextMessages;
    });

    // typing (dot) effect while waiting for AI response
    const typingPhrases = ["Đang trả lời", "Đang trả lời.", "Đang trả lời..", "Đang trả lời..."];
    let phraseIndex = 0;
    let cancelled = false;

    const typingTimer = setInterval(() => {
      if (cancelled) return;
      setMessages((prev) =>
        prev.map((m) =>
          m.id === pendingId
            ? {
                ...m,
                text: typingPhrases[phraseIndex % typingPhrases.length],
                time: m.time,
              }
            : m
        )
      );
      phraseIndex += 1;
    }, 350);

    const reply = await callGeminiApi(trimmed);
    cancelled = true;
    clearInterval(typingTimer);

    const replyText = reply || "Lỗi khi gọi API. Vui lòng thử lại.";

    setMessages((prev) => {
      const updated = prev.map((m) =>
        m.id === pendingId ? { ...m, text: replyText, time: new Date().toISOString() } : m
      );
      saveChatMessages(updated);
      return updated;
    });

  }

  return (
    <div className="admin-panel admin-chatbox-panel">
      <div className="chatbox-body">
        <div className="chatbox-messages" role="log" aria-live="polite">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`chatbox-message chatbox-message-${message.sender}`}
            >
              <div className="chatbox-message-content">{message.text}</div>
              <div className="chatbox-message-meta">
                <span>
                  {message.sender === "admin" ? "Bạn" : "Mee AI"}
                </span>
                <small>{formatChatTime(message.time)}</small>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <form className="chatbox-form" onSubmit={handleSubmit}>
          <textarea
            ref={textareaRef}
            rows="2"
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            placeholder="Nhập tin nhắn..."
            style={{ resize: "none" }}
          />
          <button type="submit" className="admin-action-btn primary">
            Gửi
          </button>
        </form>
      </div>
    </div>
  );
}

export default AdminChatBox;
