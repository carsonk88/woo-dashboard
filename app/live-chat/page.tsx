"use client";

import { useState } from "react";
import { Send, Circle } from "lucide-react";

interface Conversation {
  id: number;
  name: string;
  email: string;
  lastMessage: string;
  time: string;
  unread: number;
  status: "online" | "away" | "offline";
}

interface Message {
  id: number;
  sender: "customer" | "admin";
  text: string;
  time: string;
}

const mockConversations: Conversation[] = [
  {
    id: 1,
    name: "James Harrington",
    email: "james.h@gmail.com",
    lastMessage: "When will my order ship?",
    time: "2m ago",
    unread: 2,
    status: "online",
  },
  {
    id: 2,
    name: "Sarah Mitchell",
    email: "s.mitchell@outlook.com",
    lastMessage: "Thank you so much!",
    time: "15m ago",
    unread: 0,
    status: "away",
  },
  {
    id: 3,
    name: "Michael Torres",
    email: "mtorres@yahoo.com",
    lastMessage: "Do you have a 5000mg option?",
    time: "1h ago",
    unread: 1,
    status: "online",
  },
  {
    id: 4,
    name: "Emily Chen",
    email: "emily.c@icloud.com",
    lastMessage: "Can I change my shipping address?",
    time: "3h ago",
    unread: 0,
    status: "offline",
  },
  {
    id: 5,
    name: "Robert Davis",
    email: "rdavis@gmail.com",
    lastMessage: "My dog loves the treats!",
    time: "5h ago",
    unread: 0,
    status: "offline",
  },
];

const mockMessages: Record<number, Message[]> = {
  1: [
    { id: 1, sender: "customer", text: "Hi, I placed an order yesterday (#EVO-17751400001) and was wondering when it will ship?", time: "10:24 AM" },
    { id: 2, sender: "admin", text: "Hi James! I can see your order. It's currently being processed and should ship out today or tomorrow with USPS Priority.", time: "10:26 AM" },
    { id: 3, sender: "customer", text: "Great, thank you! Any tracking number yet?", time: "10:27 AM" },
    { id: 4, sender: "customer", text: "When will my order ship?", time: "10:28 AM" },
  ],
  3: [
    { id: 1, sender: "customer", text: "Hello, do you have a 5000mg tincture option?", time: "9:15 AM" },
    { id: 2, sender: "customer", text: "Do you have a 5000mg option?", time: "9:16 AM" },
  ],
};

export default function LiveChatPage() {
  const [chatEnabled, setChatEnabled] = useState(true);
  const [selectedConv, setSelectedConv] = useState<number>(1);
  const [inputText, setInputText] = useState("");
  const [localMessages, setLocalMessages] = useState<Record<number, Message[]>>(mockMessages);

  const messages = localMessages[selectedConv] || [];
  const conversation = mockConversations.find((c) => c.id === selectedConv);

  const sendMessage = () => {
    const text = inputText.trim();
    if (!text) return;
    const newMsg: Message = {
      id: Date.now(),
      sender: "admin",
      text,
      time: new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
    };
    setLocalMessages((prev) => ({
      ...prev,
      [selectedConv]: [...(prev[selectedConv] || []), newMsg],
    }));
    setInputText("");
  };

  return (
    <div style={{ backgroundColor: "var(--bg-page)", height: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Top bar */}
      <div
        className="flex items-center justify-between px-6 py-4 flex-shrink-0"
        style={{
          backgroundColor: "var(--bg-header)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <div>
          <h1 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
            Live Chat
          </h1>
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            Customer support conversations
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs" style={{ color: "var(--text-muted)" }}>
            Chat {chatEnabled ? "ON" : "OFF"}
          </span>
          <button
            onClick={() => setChatEnabled(!chatEnabled)}
            className="relative w-11 h-6 rounded-full transition-colors"
            style={{ backgroundColor: chatEnabled ? "var(--accent-green)" : "var(--bg-elevated)" }}
          >
            <div
              className="absolute top-0.5 w-5 h-5 rounded-full transition-all"
              style={{
                backgroundColor: "#fff",
                left: chatEnabled ? "calc(100% - 1.375rem)" : "0.125rem",
              }}
            />
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Conversation list */}
        <div
          className="w-[280px] flex-shrink-0 overflow-y-auto"
          style={{ borderRight: "1px solid var(--border)" }}
        >
          {mockConversations.map((conv) => (
            <button
              key={conv.id}
              onClick={() => setSelectedConv(conv.id)}
              className="w-full text-left px-4 py-4 transition-colors"
              style={{
                backgroundColor: selectedConv === conv.id ? "rgba(37,99,235,0.08)" : "transparent",
                borderBottom: "1px solid rgba(34,34,34,0.4)",
                borderLeft: selectedConv === conv.id ? "2px solid var(--accent-green)" : "2px solid transparent",
              }}
              onMouseEnter={(e) => {
                if (selectedConv !== conv.id)
                  (e.currentTarget as HTMLButtonElement).style.backgroundColor = "var(--hover-min)";
              }}
              onMouseLeave={(e) => {
                if (selectedConv !== conv.id)
                  (e.currentTarget as HTMLButtonElement).style.backgroundColor = "transparent";
              }}
            >
              <div className="flex items-start gap-3">
                <div className="relative flex-shrink-0">
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold"
                    style={{ backgroundColor: "var(--accent-green)", color: "#fff" }}
                  >
                    {conv.name.charAt(0)}
                  </div>
                  <div
                    className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2"
                    style={{
                      backgroundColor:
                        conv.status === "online"
                          ? "#4ade80"
                          : conv.status === "away"
                          ? "#facc15"
                          : "#555",
                      borderColor: "var(--bg-sidebar)",
                    }}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <p
                      className="text-xs font-semibold truncate"
                      style={{
                        color: selectedConv === conv.id ? "var(--accent-green-bright)" : "var(--text-primary)",
                      }}
                    >
                      {conv.name}
                    </p>
                    <span className="text-[10px] flex-shrink-0 ml-1" style={{ color: "var(--text-subtle)" }}>
                      {conv.time}
                    </span>
                  </div>
                  <p className="text-xs truncate" style={{ color: "var(--text-muted)" }}>
                    {conv.lastMessage}
                  </p>
                </div>
                {conv.unread > 0 && (
                  <span
                    className="flex-shrink-0 text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: "var(--accent-green)", color: "#fff" }}
                  >
                    {conv.unread}
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>

        {/* Chat window */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {conversation ? (
            <>
              {/* Chat header */}
              <div
                className="flex items-center gap-3 px-6 py-4 flex-shrink-0"
                style={{ borderBottom: "1px solid var(--border)" }}
              >
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
                  style={{ backgroundColor: "var(--accent-green)", color: "#fff" }}
                >
                  {conversation.name.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                    {conversation.name}
                  </p>
                  <p className="text-xs flex items-center gap-1" style={{ color: "var(--text-muted)" }}>
                    <Circle
                      size={6}
                      className={`fill-current ${conversation.status === "online" ? "text-green-400" : conversation.status === "away" ? "text-yellow-400" : "text-gray-500"}`}
                    />
                    {conversation.status.charAt(0).toUpperCase() + conversation.status.slice(1)} · {conversation.email}
                  </p>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.sender === "admin" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className="max-w-[70%] rounded-2xl px-4 py-3"
                      style={
                        msg.sender === "admin"
                          ? { backgroundColor: "var(--accent-green)", color: "#fff" }
                          : { backgroundColor: "var(--bg-elevated)", color: "var(--text-primary)", border: "1px solid var(--border)" }
                      }
                    >
                      <p className="text-sm">{msg.text}</p>
                      <p
                        className="text-[10px] mt-1"
                        style={{ color: msg.sender === "admin" ? "rgba(255,255,255,0.6)" : "var(--text-subtle)" }}
                      >
                        {msg.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Input */}
              <div
                className="flex items-end gap-3 p-4 flex-shrink-0"
                style={{ borderTop: "1px solid var(--border)" }}
              >
                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Type a message..."
                  rows={2}
                  className="flex-1 resize-none rounded-xl px-4 py-3 text-sm outline-none"
                  style={{
                    backgroundColor: "var(--bg-elevated)",
                    border: "1px solid var(--border)",
                    color: "var(--text-primary)",
                  }}
                  onFocus={(e) => {
                    (e.target as HTMLTextAreaElement).style.borderColor = "var(--accent-green)";
                  }}
                  onBlur={(e) => {
                    (e.target as HTMLTextAreaElement).style.borderColor = "var(--border)";
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                />
                <button
                  onClick={sendMessage}
                  className="p-3 rounded-xl flex-shrink-0 transition-colors"
                  style={{ backgroundColor: "var(--accent-green)", color: "#fff" }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#1d4ed8";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.backgroundColor = "var(--accent-green)";
                  }}
                >
                  <Send size={16} />
                </button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <p style={{ color: "var(--text-muted)" }}>Select a conversation</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
