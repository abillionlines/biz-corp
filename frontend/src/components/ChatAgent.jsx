import React, { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

const ChatAgent = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const location = useLocation();
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const INITIAL_MESSAGE =
    "I am Arthur. I suppose I must assist you with your business inquiries, though I'm sure you could have found the answers yourself with a bit of effort.";

  // Set initial automated message when opened
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setIsTyping(true);
      setTimeout(() => {
        setMessages([{ text: INITIAL_MESSAGE, type: "agent" }]);
        setIsTyping(false);
      }, 4000);
    }
  }, [isOpen]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const userMsg = { text: inputValue, type: "user" };
    setMessages((prev) => [...prev, userMsg]);
    setInputValue("");
    setIsTyping(true);

    try {
      const response = await fetch(`${API_BASE}/api/bot/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: inputValue }),
      });
      const data = await response.json();

      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            text: data.message,
            type: "agent",
          },
        ]);
        setIsTyping(false);
      }, 4000);
    } catch (err) {
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          text: "I'm afraid my connection to reality is severed. Please try again later.",
          type: "agent",
        },
      ]);
    }
  };

  return (
    <>
      <div className="chat-agent-fab" onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? (
          <i className="bi bi-x-lg"></i>
        ) : (
          <i className="bi bi-chat-dots-fill"></i>
        )}
      </div>

      {isOpen && (
        <div className="chat-bubble">
          <div className="bg-navy p-3 text-white d-flex align-items-center justify-content-between">
            <div className="d-flex align-items-center gap-2">
              <div
                className="rounded-circle overflow-hidden bg-secondary d-flex align-items-center justify-content-center"
                style={{
                  width: "35px",
                  height: "35px",
                  border: "2px solid rgba(255,255,255,0.2)",
                }}
              >
                <img
                  src="/5E1C2D80-7C91-4D21-ADF4-F9495ED986D1_4_5005_c.jpeg"
                  alt="Arthur"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              </div>
              <div className="d-flex flex-column" style={{ lineHeight: "1.2" }}>
                <span className="fw-bold small">bizcorp chat</span>
                <span style={{ fontSize: "0.7rem", opacity: 0.8 }}>
                  Arthur (The Condescending Butler)
                </span>
              </div>
            </div>
            <span
              style={{ cursor: "pointer" }}
              onClick={() => setIsOpen(false)}
            >
              <i className="bi bi-x-lg"></i>
            </span>
          </div>
          <div
            className="p-3 d-flex flex-column gap-2 flex-grow-1"
            style={{ minHeight: "200px", overflowY: "auto" }}
          >
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`d-flex ${msg.type === "user" ? "justify-content-end" : "justify-content-start"}`}
              >
                {msg.type === "agent" && (
                  <div
                    className="rounded-circle overflow-hidden bg-secondary flex-shrink-0 me-2 mt-1"
                    style={{
                      width: "24px",
                      height: "24px",
                      border: "1px solid #ddd",
                    }}
                  >
                    <img
                      src="/5E1C2D80-7C91-4D21-ADF4-F9495ED986D1_4_5005_c.jpeg"
                      alt="Arthur"
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  </div>
                )}
                <div
                  className={`p-2 rounded small ${
                    msg.type === "user" ? "bg-primary text-white text-end" : ""
                  }`}
                  style={{
                    maxWidth: "80%",
                    backgroundColor:
                      msg.type === "agent" ? "#ebebeb" : undefined,
                    color: msg.type === "agent" ? "#333" : undefined,
                  }}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="d-flex justify-content-start">
                <div
                  className="rounded-circle overflow-hidden bg-secondary flex-shrink-0 me-2 mt-1"
                  style={{
                    width: "24px",
                    height: "24px",
                    border: "1px solid #ddd",
                  }}
                >
                  <img
                    src="/5E1C2D80-7C91-4D21-ADF4-F9495ED986D1_4_5005_c.jpeg"
                    alt="Arthur"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                </div>
                <div
                  className="p-2 rounded small d-flex align-items-center"
                  style={{
                    backgroundColor: "#ebebeb",
                    color: "#333",
                    maxWidth: "80%",
                    height: "32px",
                  }}
                >
                  <div className="typing-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          <form className="p-2 border-top" onSubmit={handleSendMessage}>
            <div className="input-group">
              <input
                type="text"
                className="form-control form-control-sm border-0"
                placeholder="Type a message..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
              />
              <button
                className="btn btn-sm btn-link text-primary"
                type="submit"
              >
                <i className="bi bi-send-fill"></i>
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
};

export default ChatAgent;
