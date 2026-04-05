"use client";

import Image from "next/image";
import { useState, useCallback, useRef } from "react";
import { MOCK_CHAT } from "@/lib/data";

interface ChatMessage {
  id: number;
  nick: string;
  nickColor: string;
  tier: string | null;
  msg: string;
  isNew: boolean;
}

interface MockChatProps {
  nick: string;
  nickColor: string;
  tier?: string | null;
}

const MAX_MESSAGES = 6;
let idSeq = MOCK_CHAT.length;

export default function MockChat({ nick, nickColor, tier = null }: MockChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(
    MOCK_CHAT.map((m, i) => ({
      id: i,
      nick: m.nick,
      nickColor: m.nickColor,
      tier: m.tier,
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
      tier: tier ?? null,
      msg: text,
      isNew: true,
    };

    setMessages(prev => [...prev, newMsg].slice(-MAX_MESSAGES));
    setInput("");
    inputRef.current?.focus();
  }, [input, nick, nickColor, tier]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") sendMessage();
  };

  const canSend = input.trim().length > 0;

  return (
    <div className="w-full mx-auto max-w-sm rounded-xl overflow-hidden"
      style={{ boxShadow: "0 0 60px rgba(99,102,241,0.15), 0 20px 60px rgba(0,0,0,0.5)", border: "1px solid rgba(255,255,255,0.07)" }}>

      {/* Header */}
      <div className="flex items-center justify-center px-4 py-2.5"
        style={{ background: "#141417", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <span className="text-sm font-semibold" style={{ color: "#e4e4e7" }}>채팅</span>
      </div>

      {/* Messages */}
      <div className="px-3 py-3 space-y-2 overflow-hidden" style={{ background: "#111114" }}>
        {messages.map((msg) => (
          <div
            key={msg.id}
            className="text-sm leading-6 break-words text-left"
            style={{ animation: msg.isNew ? "slideIn 0.25s ease-out" : undefined }}
          >
            {msg.tier && (
              <Image
                src={`/images/RankedEmblemsLatest/Rank=${msg.tier}.png`}
                alt={msg.tier}
                width={20}
                height={20}
                style={{ display: "inline", verticalAlign: "middle", marginRight: "2px" }}
              />
            )}
            <span className="font-bold px-1" style={{ color: msg.nickColor }}>{msg.nick}</span>
            <span style={{ color: "#d4d4d8" }}>{msg.msg}</span>
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="flex items-center gap-2 px-3 py-2.5"
        style={{ background: "#141417", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        {/* Avatar */}
        <div className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center"
          style={{ background: "#2a2a32" }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="8" r="4" fill="#52525b" />
            <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke="#52525b" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>

        {/* Text input */}
        <div className="flex-1 flex items-center gap-2 rounded-lg px-3 py-1.5"
          style={{ background: "#2a2a32", border: "1px solid rgba(255,255,255,0.06)" }}>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="채팅을 입력해주세요 (J)"
            className="flex-1 bg-transparent text-xs outline-none"
            style={{ color: "#d4d4d8" }}
          />
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="flex-shrink-0">
            <circle cx="12" cy="12" r="10" stroke="#52525b" strokeWidth="1.5" />
            <circle cx="9" cy="10" r="1" fill="#52525b" />
            <circle cx="15" cy="10" r="1" fill="#52525b" />
            <path d="M8.5 14.5c1 1.5 6 1.5 7 0" stroke="#52525b" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </div>

        {/* 채팅 button */}
        <button
          onClick={sendMessage}
          disabled={!canSend}
          className="flex-shrink-0 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all duration-200"
          style={{
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
  );
}
