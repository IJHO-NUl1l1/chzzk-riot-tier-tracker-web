"use client";

import Image from "next/image";
import { useState, useCallback, useRef } from "react";
import { MOCK_CHAT } from "@/lib/data";

interface ChatMessage {
  id: number;
  nick: string;
  nickColor: string;
  tiers: string[];
  msg: string;
  isNew: boolean;
}

interface MockChatProps {
  nick: string;
  nickColor: string;
  tiers?: string[];   // ["Challenger"], ["Challenger","Diamond"], [], undefined — all valid
}

const MAX_MESSAGES = 6;
let idSeq = MOCK_CHAT.length;

// tier 문자열 → 이미지 파일명 형식 (e.g. "CHALLENGER" → "Challenger")
function toTierImageName(t: string) {
  return t.charAt(0).toUpperCase() + t.slice(1).toLowerCase();
}

// 컴포넌트 자체에 필요한 모든 스타일을 포함 — 외부 layout/global CSS 의존 없음
const SELF_CONTAINED_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500&family=Rajdhani:wght@500;600;700&display=swap');

  .mockchat-root {
    font-family: 'Noto Sans KR', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    user-select: none;
    -webkit-user-select: none;
    line-height: 1.5;
    box-sizing: border-box;
  }
  .mockchat-root *, .mockchat-root *::before, .mockchat-root *::after {
    box-sizing: border-box;
  }
  .mockchat-root input {
    user-select: text;
    -webkit-user-select: text;
    font-family: inherit;
    font-size: 12px;
    line-height: 1.5;
    background: transparent;
    border: none;
    outline: none;
    width: 100%;
    color: #d4d4d8;
    min-width: 0;
  }
  .mockchat-root input::placeholder {
    color: #52525b;
  }
  .mockchat-root button {
    font-family: inherit;
    cursor: pointer;
    border: none;
    padding: 0;
    background: none;
  }

  @keyframes mockchat-slideIn {
    from { opacity: 0; transform: translateY(6px); }
    to   { opacity: 1; transform: translateY(0); }
  }
`;

export default function MockChat({ nick, nickColor, tiers = [] }: MockChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(
    MOCK_CHAT.map((m, i) => ({
      id: i,
      nick: m.nick,
      nickColor: m.nickColor,
      tiers: m.tier ? [m.tier] : [],
      msg: m.msg,
      isNew: false,
    }))
  );
  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const sendMessage = useCallback(() => {
    const text = input.trim();
    if (!text) return;
    const newMsg: ChatMessage = {
      id: ++idSeq,
      nick,
      nickColor,
      tiers,
      msg: text,
      isNew: true,
    };
    setMessages(prev => [...prev, newMsg].slice(-MAX_MESSAGES));
    setInput("");
    inputRef.current?.focus();
  }, [input, nick, nickColor, tiers]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") sendMessage();
  };

  const canSend = input.trim().length > 0;

  return (
    <>
      <style>{SELF_CONTAINED_STYLES}</style>
      <div
        className="mockchat-root"
        style={{
          width: "100%",
          maxWidth: 384,
          margin: "0 auto",
          borderRadius: 12,
          overflow: "hidden",
          boxShadow: "0 0 60px rgba(99,102,241,0.15), 0 20px 60px rgba(0,0,0,0.5)",
          border: "1px solid rgba(255,255,255,0.07)",
        }}
      >
        {/* Header */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "center",
          padding: "10px 16px",
          background: "#141417",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: "#e4e4e7" }}>채팅</span>
        </div>

        {/* Messages */}
        <div style={{ padding: "12px", display: "flex", flexDirection: "column", gap: 8, background: "#111114" }}>
          {messages.map((msg) => (
            <div
              key={msg.id}
              style={{
                fontSize: 14,
                lineHeight: "24px",
                wordBreak: "break-word",
                textAlign: "left",
                animation: msg.isNew ? "mockchat-slideIn 0.25s ease-out" : undefined,
              }}
            >
              {msg.tiers.map((t) => {
                const imgName = toTierImageName(t);
                return (
                  <Image
                    key={t}
                    src={`/images/RankedEmblemsLatest/Rank=${imgName}.png`}
                    alt={imgName}
                    width={20}
                    height={20}
                    style={{ display: "inline", verticalAlign: "middle", marginRight: 4, marginLeft: 2 }}
                  />
                );
              })}
              <span style={{ fontWeight: 700, padding: "0 4px", color: msg.nickColor }}>{msg.nick}</span>
              <span style={{ color: "#d4d4d8" }}>{msg.msg}</span>
            </div>
          ))}
        </div>

        {/* Input area */}
        <div style={{
          display: "flex", alignItems: "center", gap: 8,
          padding: "10px 12px",
          background: "#141417",
          borderTop: "1px solid rgba(255,255,255,0.06)",
        }}>
          {/* Avatar */}
          <div style={{
            width: 28, height: 28, borderRadius: "50%", flexShrink: 0,
            display: "flex", alignItems: "center", justifyContent: "center",
            background: "#2a2a32",
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="8" r="4" fill="#52525b" />
              <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke="#52525b" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>

          {/* Text input */}
          <div style={{
            flex: 1, display: "flex", alignItems: "center", gap: 8,
            borderRadius: 8, padding: "6px 12px",
            background: "#2a2a32", border: "1px solid rgba(255,255,255,0.06)",
            minWidth: 0,
          }}>
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="채팅을 입력해주세요 (J)"
            />
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
              <circle cx="12" cy="12" r="10" stroke="#52525b" strokeWidth="1.5" />
              <circle cx="9" cy="10" r="1" fill="#52525b" />
              <circle cx="15" cy="10" r="1" fill="#52525b" />
              <path d="M8.5 14.5c1 1.5 6 1.5 7 0" stroke="#52525b" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>

          {/* Send button */}
          <button
            onClick={sendMessage}
            disabled={!canSend}
            style={{
              flexShrink: 0,
              borderRadius: 8,
              padding: "6px 12px",
              fontSize: 12,
              fontWeight: 600,
              transition: "all 200ms ease",
              background: canSend ? "rgba(99,102,241,0.85)" : "#2a2a32",
              color: canSend ? "#fff" : "#52525b",
              border: `1px solid ${canSend ? "rgba(99,102,241,0.5)" : "rgba(255,255,255,0.06)"}`,
              cursor: canSend ? "pointer" : "default",
            }}
          >
            채팅
          </button>
        </div>
      </div>
    </>
  );
}
