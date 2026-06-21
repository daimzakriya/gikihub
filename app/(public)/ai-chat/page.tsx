"use client";

import { useState, useRef, useEffect } from "react";

interface Message {
  id:      string;
  role:    "user" | "model";
  content: string;
}

const SUGGESTIONS = [
  "What is the merit formula for GIKI admission?",
  "How does relative grading work at GIKI?",
  "What CGPA do I need for Dean's Honor List?",
  "Tell me about GIKI campus facilities",
  "How do I calculate my aggregate for GIKI?",
  "What departments does GIKI have?",
];

function MarkdownText({ text }: { text: string }) {
  // Light markdown renderer: bold, inline code, bullets
  const lines = text.split("\n");
  return (
    <div className="text-sm leading-relaxed space-y-1">
      {lines.map((line, i) => {
        if (line.startsWith("**") || line.startsWith("## ") || line.startsWith("# ")) {
          const clean = line.replace(/^#+\s*/, "").replace(/\*\*/g, "");
          return <p key={i} className="font-semibold text-gray-900">{clean}</p>;
        }
        if (line.startsWith("- ") || line.startsWith("* ")) {
          return (
            <div key={i} className="flex gap-2">
              <span className="text-brand-400 flex-shrink-0 font-bold">•</span>
              <span>{line.replace(/^[-*]\s/, "")}</span>
            </div>
          );
        }
        const parts = line.split(/(`[^`]+`)/g);
        return (
          <p key={i}>
            {parts.map((part, j) =>
              part.startsWith("`") && part.endsWith("`")
                ? <code key={j} className="bg-gray-100 text-brand-700 px-1.5 py-0.5 rounded text-xs font-mono">{part.slice(1, -1)}</code>
                : part
            )}
          </p>
        );
      })}
    </div>
  );
}

export default function AIChatPage() {
  const [messages,  setMessages]  = useState<Message[]>([]);
  const [input,     setInput]     = useState("");
  const [streaming, setStreaming] = useState(false);
  const [error,     setError]     = useState("");
  const bottomRef  = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streaming]);

  async function sendMessage(content: string) {
    if (!content.trim() || streaming) return;

    const userMsg: Message = { id: crypto.randomUUID(), role: "user", content: content.trim() };
    const modelId = crypto.randomUUID();
    setMessages((prev) => [...prev, userMsg, { id: modelId, role: "model", content: "" }]);
    setInput("");
    setStreaming(true);
    setError("");

    try {
      const res = await fetch("/api/ai-chat", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMsg].map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error((d as { error?: string }).error ?? "Request failed");
      }

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      if (!reader) throw new Error("No response stream");

      let buffer = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";
        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const data = line.slice(6);
          if (data === "[DONE]") break;
          try {
            const { text, error: streamErr } = JSON.parse(data) as { text?: string; error?: string };
            if (streamErr) throw new Error(streamErr);
            if (text) {
              setMessages((prev) =>
                prev.map((m) => m.id === modelId ? { ...m, content: m.content + text } : m)
              );
            }
          } catch {}
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      setMessages((prev) => prev.filter((m) => m.id !== modelId));
    } finally {
      setStreaming(false);
      textareaRef.current?.focus();
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  }

  const isEmpty = messages.length === 0;

  return (
    <main className="flex flex-col h-[calc(100vh-64px)] max-w-3xl mx-auto px-4">
      {/* Header */}
      <div className="py-5 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-brand-900 rounded-xl flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"/>
            </svg>
          </div>
          <div>
            <h1 className="text-base font-bold text-gray-900">GIKI Plus AI</h1>
            <p className="text-xs text-gray-500 mt-0.5">Ask anything about GIKI — grading, admissions, campus life.</p>
          </div>
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto py-6 space-y-5">
        {isEmpty && (
          <div className="space-y-6">
            <div className="text-center pt-4">
              <div className="w-16 h-16 bg-brand-900 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"/>
                </svg>
              </div>
              <h2 className="font-bold text-gray-900 text-xl">Hello! I&apos;m GIKI Plus AI</h2>
              <p className="text-gray-500 text-sm mt-1.5">Ask me anything about GIKI — I&apos;m here to help.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {SUGGESTIONS.map((s) => (
                <button key={s} onClick={() => sendMessage(s)}
                  className="text-left text-sm text-gray-700 bg-white hover:bg-brand-50 hover:text-brand-800
                             border border-gray-200 hover:border-brand-200 rounded-xl px-4 py-3 transition-colors
                             shadow-sm hover:shadow-md">
                  <span className="text-brand-400 mr-1.5">→</span>{s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <div key={msg.id} className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
            {/* Avatar */}
            <div className={`flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold
              ${msg.role === "user" ? "bg-brand-900 text-white" : "bg-gray-100 text-gray-600"}`}>
              {msg.role === "user" ? "U" : (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"/>
                </svg>
              )}
            </div>

            {/* Bubble */}
            <div className={`max-w-[80%] rounded-2xl px-4 py-3 shadow-sm
              ${msg.role === "user"
                ? "bg-brand-800 text-white rounded-tr-sm"
                : "bg-white border border-gray-200 text-gray-800 rounded-tl-sm"}`}>
              {msg.role === "user"
                ? <p className="text-sm">{msg.content}</p>
                : msg.content
                  ? <MarkdownText text={msg.content} />
                  : <span className="flex gap-1 py-1">
                      {[0,1,2].map((i) => (
                        <span key={i} className="w-2 h-2 bg-gray-300 rounded-full animate-bounce"
                          style={{ animationDelay: `${i * 0.15}s` }} />
                      ))}
                    </span>
              }
            </div>
          </div>
        ))}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700 flex items-center gap-2">
            <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"/>
            </svg>
            {error}
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="py-4 border-t border-gray-100">
        <div className="flex gap-3 items-end bg-white border border-gray-200 rounded-2xl px-4 py-3
                        focus-within:ring-2 focus-within:ring-brand-500 focus-within:border-brand-400 transition-all shadow-sm">
          <textarea
            ref={textareaRef}
            rows={1}
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              e.target.style.height = "auto";
              e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
            }}
            onKeyDown={handleKeyDown}
            placeholder="Ask about GIKI…"
            disabled={streaming}
            className="flex-1 resize-none border-0 outline-none text-sm text-gray-800 placeholder-gray-400
                       bg-transparent min-h-[24px] max-h-[120px] disabled:opacity-50"
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={streaming || !input.trim()}
            className="flex-shrink-0 w-9 h-9 bg-brand-900 hover:bg-brand-800 disabled:opacity-30
                       text-white rounded-xl flex items-center justify-center transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
            </svg>
          </button>
        </div>
        <p className="text-xs text-gray-400 text-center mt-2">
          AI can make mistakes. Verify important info from official GIKI sources.
        </p>
      </div>
    </main>
  );
}
