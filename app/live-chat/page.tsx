"use client";

import { useState, useEffect, useRef } from "react";
import { Send, Circle, Archive, RefreshCw, Mail, Phone, X, MessageSquare } from "lucide-react";

interface Conversation {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  status: "open" | "closed" | "archived";
  unread: number;
  created_at: string;
  updated_at: string;
}

interface Message {
  id: string;
  conversation_id: string;
  sender: "customer" | "admin";
  body: string;
  created_at: string;
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export default function LiveChatPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [reply, setReply] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [filter, setFilter] = useState<"open" | "closed" | "all">("open");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const selected = conversations.find((c) => c.id === selectedId) || null;

  async function loadConversations() {
    try {
      const res = await fetch("/api/chat");
      const data = await res.json();
      if (Array.isArray(data)) setConversations(data);
    } catch { /* ignore */ }
    setLoading(false);
  }

  async function loadMessages(convId: string) {
    try {
      const res = await fetch(`/api/chat?conversation_id=${convId}`);
      const data = await res.json();
      if (Array.isArray(data)) setMessages(data);
    } catch { /* ignore */ }
  }

  useEffect(() => {
    loadConversations();
    const interval = setInterval(loadConversations, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (selectedId) {
      loadMessages(selectedId);
      const interval = setInterval(() => loadMessages(selectedId), 5000);
      return () => clearInterval(interval);
    }
  }, [selectedId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend() {
    if (!reply.trim() || !selectedId) return;
    setSending(true);
    try {
      await fetch("/api/chat", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversation_id: selectedId, reply: reply.trim() }),
      });
      setReply("");
      await loadMessages(selectedId);
      await loadConversations();
    } catch { /* ignore */ }
    setSending(false);
  }

  async function updateStatus(convId: string, status: "closed" | "archived") {
    await fetch("/api/chat", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ conversation_id: convId, status }),
    });
    await loadConversations();
    if (selectedId === convId) {
      setSelectedId(null);
      setMessages([]);
    }
  }

  const filtered = conversations.filter((c) => {
    if (filter === "all") return true;
    return c.status === filter;
  });

  const totalUnread = conversations.filter((c) => c.status === "open" && c.unread > 0).length;

  return (
    <div style={{ backgroundColor: "var(--bg-page)", minHeight: "100vh" }}>
      {/* Header */}
      <div
        className="flex items-center justify-between px-6 py-4 sticky top-0 z-30"
        style={{
          backgroundColor: "var(--bg-header)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
            Live Chat
          </h1>
          {totalUnread > 0 && (
            <span
              className="text-[11px] font-bold px-2 py-0.5 rounded-full"
              style={{ backgroundColor: "var(--accent-green)", color: "#fff" }}
            >
              {totalUnread} new
            </span>
          )}
        </div>
        <button
          onClick={loadConversations}
          className="p-2 rounded-lg transition-colors"
          style={{ color: "var(--text-muted)" }}
          title="Refresh"
        >
          <RefreshCw size={15} />
        </button>
      </div>

      <div className="flex" style={{ height: "calc(100vh - 57px)" }}>
        {/* Left: Conversation List */}
        <div
          className="w-[320px] flex-shrink-0 flex flex-col"
          style={{ borderRight: "1px solid var(--border)", backgroundColor: "var(--bg-card)" }}
        >
          <div className="flex gap-1 px-3 pt-3 pb-2">
            {(["open", "closed", "all"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className="text-[11px] px-3 py-1.5 rounded-md font-medium capitalize"
                style={
                  filter === f
                    ? { backgroundColor: "var(--accent-green)", color: "#fff" }
                    : { color: "var(--text-muted)", backgroundColor: "var(--bg-elevated)" }
                }
              >
                {f} {f === "open" && totalUnread > 0 ? `(${totalUnread})` : ""}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <RefreshCw size={16} className="animate-spin" style={{ color: "var(--text-muted)" }} />
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-12 px-4">
                <MessageSquare size={32} className="mx-auto mb-3" style={{ color: "var(--text-subtle)" }} />
                <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                  No conversations yet
                </p>
                <p className="text-xs mt-1" style={{ color: "var(--text-subtle)" }}>
                  Messages from your contact form will appear here
                </p>
              </div>
            ) : (
              filtered.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => setSelectedId(conv.id)}
                  className="w-full text-left px-4 py-3 transition-colors"
                  style={{
                    backgroundColor: selectedId === conv.id ? "var(--bg-elevated)" : "transparent",
                    borderBottom: "1px solid var(--row-border)",
                  }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <Circle
                        size={8}
                        className={conv.status === "open" ? "fill-green-500 text-green-500" : "fill-gray-500 text-gray-500"}
                      />
                      <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                        {conv.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px]" style={{ color: "var(--text-subtle)" }}>
                        {timeAgo(conv.updated_at)}
                      </span>
                      {conv.unread > 0 && conv.status === "open" && (
                        <span
                          className="w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center"
                          style={{ backgroundColor: "var(--accent-green)", color: "#fff" }}
                        >
                          {conv.unread}
                        </span>
                      )}
                    </div>
                  </div>
                  <p className="text-xs mt-1 truncate" style={{ color: "var(--text-muted)" }}>
                    {conv.email}
                  </p>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Right: Message Thread */}
        <div className="flex-1 flex flex-col">
          {!selected ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageSquare size={40} className="mx-auto mb-3" style={{ color: "var(--text-subtle)" }} />
                <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                  Select a conversation to view messages
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Thread header */}
              <div
                className="flex items-center justify-between px-5 py-3 flex-shrink-0"
                style={{ borderBottom: "1px solid var(--border)", backgroundColor: "var(--bg-card)" }}
              >
                <div>
                  <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                    {selected.name}
                  </h2>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className="text-xs flex items-center gap-1" style={{ color: "var(--text-muted)" }}>
                      <Mail size={10} /> {selected.email}
                    </span>
                    {selected.phone && (
                      <span className="text-xs flex items-center gap-1" style={{ color: "var(--text-muted)" }}>
                        <Phone size={10} /> {selected.phone}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {selected.status === "open" && (
                    <button
                      onClick={() => updateStatus(selected.id, "closed")}
                      className="text-[11px] px-3 py-1.5 rounded-md font-medium flex items-center gap-1"
                      style={{ backgroundColor: "var(--bg-elevated)", color: "var(--text-muted)", border: "1px solid var(--border)" }}
                    >
                      <X size={11} /> Close
                    </button>
                  )}
                  <button
                    onClick={() => updateStatus(selected.id, "archived")}
                    className="text-[11px] px-3 py-1.5 rounded-md font-medium flex items-center gap-1"
                    style={{ backgroundColor: "var(--bg-elevated)", color: "var(--text-muted)", border: "1px solid var(--border)" }}
                  >
                    <Archive size={11} /> Archive
                  </button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.sender === "admin" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className="max-w-[70%] rounded-xl px-4 py-2.5"
                      style={
                        msg.sender === "admin"
                          ? { backgroundColor: "var(--accent-green)", color: "#fff", borderBottomRightRadius: "4px" }
                          : { backgroundColor: "var(--bg-elevated)", color: "var(--text-primary)", border: "1px solid var(--border)", borderBottomLeftRadius: "4px" }
                      }
                    >
                      <p className="text-sm leading-relaxed">{msg.body}</p>
                      <p
                        className="text-[10px] mt-1"
                        style={{ color: msg.sender === "admin" ? "rgba(255,255,255,0.7)" : "var(--text-subtle)" }}
                      >
                        {new Date(msg.created_at).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
                        {" · "}
                        {new Date(msg.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Reply input */}
              {selected.status === "open" && (
                <div
                  className="px-5 py-3 flex-shrink-0"
                  style={{ borderTop: "1px solid var(--border)", backgroundColor: "var(--bg-card)" }}
                >
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={reply}
                      onChange={(e) => setReply(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
                      placeholder="Type a reply..."
                      className="flex-1 px-4 py-2.5 rounded-lg text-sm outline-none"
                      style={{
                        backgroundColor: "var(--bg-elevated)",
                        color: "var(--text-primary)",
                        border: "1px solid var(--border)",
                      }}
                    />
                    <button
                      onClick={handleSend}
                      disabled={!reply.trim() || sending}
                      className="px-4 py-2.5 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors"
                      style={{
                        backgroundColor: reply.trim() ? "var(--accent-green)" : "var(--bg-elevated)",
                        color: reply.trim() ? "#fff" : "var(--text-muted)",
                        border: reply.trim() ? "none" : "1px solid var(--border)",
                      }}
                    >
                      <Send size={14} />
                      {sending ? "..." : "Send"}
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
