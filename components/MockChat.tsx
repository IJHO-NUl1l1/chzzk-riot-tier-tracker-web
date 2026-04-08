"use client";

import Image from "next/image";
import { useState, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import { MOCK_CHAT, type TierBadgeInfo } from "@/lib/data";

export type { TierBadgeInfo };

interface ChatMessage {
  id: number;
  nick: string;
  nickColor: string;
  tiers: TierBadgeInfo[];
  msg: string;
  isNew: boolean;
}

interface MockChatProps {
  nick: string;
  nickColor: string;
  tiers?: TierBadgeInfo[];
}

const MAX_MESSAGES = 6;
let idSeq = MOCK_CHAT.length;

const TIER_COLORS: Record<string, string> = {
  IRON: "#72767d", BRONZE: "#b97451", SILVER: "#7e8183", GOLD: "#f1a64d",
  PLATINUM: "#4fccc6", EMERALD: "#3eb489", DIAMOND: "#576ace",
  MASTER: "#9d4dc3", GRANDMASTER: "#ef4444", CHALLENGER: "#f4c873",
};

function toTierImageName(t: string) {
  return t.charAt(0).toUpperCase() + t.slice(1).toLowerCase();
}

// ── Styles ─────────────────────────────────────────────────────────────────

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
  .mockchat-root input::placeholder { color: #52525b; }
  .mockchat-root button {
    font-family: inherit;
    cursor: pointer;
    border: none;
    padding: 0;
    background: none;
  }
  .mockchat-badge {
    cursor: pointer;
    display: inline;
    vertical-align: middle;
    transition: filter 0.15s, transform 0.15s;
  }
  .mockchat-badge:hover {
    filter: brightness(1.25) drop-shadow(0 0 4px rgba(129,140,248,0.5));
    transform: scale(1.12);
  }

  @keyframes mockchat-slideIn {
    from { opacity: 0; transform: translateY(6px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes mockchat-tooltip-in {
    from { opacity: 0; transform: translateY(-4px) scale(0.97); }
    to   { opacity: 1; transform: translateY(0) scale(1); }
  }
`;

// ── Tooltip ────────────────────────────────────────────────────────────────

interface TooltipState {
  info: TierBadgeInfo;
  nick: string;
  x: number;
  y: number;
}

function Tooltip({ state }: { state: TooltipState }) {
  const { info, nick, x, y } = state;
  const tierUpper  = info.tier.toUpperCase();
  const tierColor  = TIER_COLORS[tierUpper] || "#e4e4e7";
  const imgName    = toTierImageName(info.tier);
  const gameLabel  = info.gameType === "lol" ? "LoL" : "TFT";
  const tierLabel  = info.rank ? `${tierUpper} ${info.rank}` : tierUpper;

  const lpHtml = info.lp != null
    ? `${info.lp} LP`
    : null;

  const left = Math.min(x, typeof window !== "undefined" ? window.innerWidth - 256 - 8 : x);

  return (
    <div
      style={{
        position: "fixed",
        left,
        top: y,
        zIndex: 99999,
        background: "linear-gradient(155deg, #0f0f1c 0%, #09090f 100%)",
        border: `1px solid rgba(129,140,248,0.22)`,
        borderLeft: `3px solid ${tierColor}55`,
        borderRadius: 12,
        padding: "12px 14px 11px 12px",
        minWidth: 192,
        maxWidth: 256,
        boxShadow: "0 12px 40px rgba(0,0,0,0.75), 0 0 0 1px rgba(129,140,248,0.06), 0 0 28px rgba(99,102,241,0.12)",
        pointerEvents: "none",
        fontFamily: "'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif",
        color: "#e4e4e7",
        overflow: "hidden",
        animation: "mockchat-tooltip-in 0.18s cubic-bezier(0.16,1,0.3,1) both",
      }}
    >
      {/* Top accent line */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: 1,
        background: "linear-gradient(90deg, transparent, rgba(129,140,248,0.5), transparent)",
      }} />

      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
        <Image
          src={`/images/RankedEmblemsLatest/Rank=${imgName}.png`}
          alt={imgName}
          width={42}
          height={42}
          style={{ flexShrink: 0, filter: "drop-shadow(0 2px 6px rgba(0,0,0,0.6))" }}
        />
        <div style={{ display: "flex", flexDirection: "column", gap: 3, minWidth: 0, flex: 1 }}>
          {/* Game label pill */}
          <div style={{
            display: "inline-flex", alignItems: "center", width: "fit-content",
            padding: "1px 7px", borderRadius: 999,
            fontSize: 9, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase",
            ...(info.gameType === "lol"
              ? { background: "rgba(99,102,241,0.18)", border: "1px solid rgba(129,140,248,0.35)", color: "#a5b4fc" }
              : { background: "rgba(52,211,153,0.14)", border: "1px solid rgba(52,211,153,0.3)",   color: "#6ee7b7" }
            ),
          }}>
            {gameLabel}
          </div>
          {/* Tier name */}
          <div style={{
            fontSize: 13, fontWeight: 700, lineHeight: 1.2, letterSpacing: "0.02em",
            color: tierColor,
            textShadow: `0 0 12px ${tierColor}55`,
          }}>
            {tierLabel}
          </div>
        </div>
      </div>

      {/* LP */}
      {lpHtml && (
        <div style={{ marginTop: 6, fontSize: 12, fontWeight: 700, color: "#a1a1aa", letterSpacing: "0.02em" }}>
          {info.lp}{" "}
          <span style={{ fontWeight: 500, color: "#52525b", fontSize: 10 }}>LP</span>
        </div>
      )}

      {/* Nick */}
      <div style={{
        margin: "8px 0 0",
        height: 1,
        background: "linear-gradient(90deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.09) 50%, rgba(255,255,255,0.05) 100%)",
      }} />
      <div style={{
        marginTop: 6, fontSize: 11, color: "#52525b",
        whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
      }}>
        {nick}
      </div>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────

export default function MockChat({ nick, nickColor, tiers = [] }: MockChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(
    MOCK_CHAT.map((m, i) => ({
      id: i,
      nick: m.nick,
      nickColor: m.nickColor,
      tiers: m.tiers,
      msg: m.msg,
      isNew: false,
    }))
  );
  const [input, setInput]     = useState("");
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);
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

  function handleBadgeEnter(e: React.MouseEvent, info: TierBadgeInfo, nick: string) {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setTooltip({ info, nick, x: rect.left, y: rect.bottom + 6 });
  }

  function handleBadgeLeave() {
    setTooltip(null);
  }

  const canSend = input.trim().length > 0;

  return (
    <>
      <style>{SELF_CONTAINED_STYLES}</style>

      {/* Tooltip — portaled to document.body to escape transform stacking context */}
      {tooltip && typeof document !== "undefined" && createPortal(<Tooltip state={tooltip} />, document.body)}

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
              {msg.tiers.map((info) => (
                <span
                  key={info.tier + info.gameType}
                  className="mockchat-badge"
                  onMouseEnter={(e) => handleBadgeEnter(e, info, msg.nick)}
                  onMouseLeave={handleBadgeLeave}
                >
                  <Image
                    src={`/images/RankedEmblemsLatest/Rank=${toTierImageName(info.tier)}.png`}
                    alt={info.tier}
                    width={20}
                    height={20}
                    style={{ display: "inline", verticalAlign: "middle", marginRight: 4, marginLeft: 2 }}
                  />
                </span>
              ))}
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
