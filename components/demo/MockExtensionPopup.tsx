"use client";

import { useState } from "react";
import Image from "next/image";

// ── Types ──────────────────────────────────────────────────────────────────

export type HighlightTarget =
  | "chzzk-connect"
  | "riot-oauth"
  | "lol-register"
  | "tft-register"
  | "lol-toggle"
  | "tft-toggle"
  | null;

export type ChzzkState = "disconnected" | "connecting" | "connected";
export type RiotState = "disconnected" | "connecting" | "connected";

interface TierData {
  gameName: string;
  tier: string;
  rank: string | null;
  lp: number;
}

export interface MockExtensionPopupProps {
  highlight?: HighlightTarget;
  chzzkState?: ChzzkState;
  riotState?: RiotState;
  channelName?: string;
  lolData?: TierData | null;
  tftData?: TierData | null;
  lolRegistered?: boolean;
  tftRegistered?: boolean;
  lolPublic?: boolean;
  tftPublic?: boolean;
  onChzzkConnect?: () => void;
  onRiotOAuth?: () => void;
  onLolRegister?: () => void;
  onTftRegister?: () => void;
  onLolToggle?: (v: boolean) => void;
  onTftToggle?: (v: boolean) => void;
}

// ── Constants ──────────────────────────────────────────────────────────────

const TIER_COLORS: Record<string, string> = {
  IRON: "#72767d", BRONZE: "#b97451", SILVER: "#7e8183", GOLD: "#f1a64d",
  PLATINUM: "#4fccc6", EMERALD: "#3eb489", DIAMOND: "#576ace",
  MASTER: "#9d4dc3", GRANDMASTER: "#ef4444", CHALLENGER: "#f4c873",
};

const TIER_IMG: Record<string, string> = {
  IRON: "Iron", BRONZE: "Bronze", SILVER: "Silver", GOLD: "Gold",
  PLATINUM: "Platinum", EMERALD: "Emerald", DIAMOND: "Diamond",
  MASTER: "Master", GRANDMASTER: "Grandmaster", CHALLENGER: "Challenger",
};

// ── Highlight ring wrapper ─────────────────────────────────────────────────

function Highlight({ active, children }: { active: boolean; children: React.ReactNode }) {
  return (
    <div style={{ position: "relative", width: "100%" }}>
      {active && (
        <span
          style={{
            position: "absolute",
            inset: -3,
            borderRadius: 8,
            border: "2px solid #818cf8",
            boxShadow: "0 0 0 3px rgba(129,140,248,0.25), 0 0 12px rgba(129,140,248,0.4)",
            animation: "highlight-pulse 1.5s ease-in-out infinite",
            pointerEvents: "none",
            zIndex: 10,
          }}
        />
      )}
      {children}
    </div>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────────

function NavBar({ active }: { active: "home" | "search" | "settings" }) {
  const items = [
    {
      id: "home", label: "Home",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      ),
    },
    {
      id: "search", label: "Search",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
      ),
    },
    {
      id: "settings", label: "Settings",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
      ),
    },
  ];

  return (
    <div style={{
      borderTop: "1px solid rgba(255,255,255,0.06)",
      background: "#0e0e16",
      display: "flex",
      padding: "6px 8px",
      gap: 4,
    }}>
      {items.map((item) => {
        const isActive = item.id === active;
        return (
          <button
            key={item.id}
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 3,
              padding: "6px 0",
              background: isActive ? "rgba(99,102,241,0.12)" : "transparent",
              border: "none",
              borderRadius: 8,
              color: isActive ? "#818cf8" : "#52525b",
              cursor: "pointer",
              transition: "all 200ms ease",
            }}
          >
            {item.icon}
            <span style={{ fontSize: 10, fontFamily: "Rajdhani, sans-serif", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" }}>
              {item.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

function TierCol({
  game, data, isRegistered, highlight, isPublic,
  onRegister, onToggle,
}: {
  game: "LoL" | "TFT";
  data: TierData | null | undefined;
  isRegistered?: boolean;
  highlight: boolean;
  isPublic?: boolean;
  onRegister?: () => void;
  onToggle?: (v: boolean) => void;
}) {
  const tier = data?.tier?.toUpperCase() ?? "";
  const color = TIER_COLORS[tier] ?? "#444";
  const imgName = TIER_IMG[tier];

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 5, padding: "10px 8px" }}>
      {/* header row */}
      <div style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 2px" }}>
        <span style={{
          fontFamily: "Rajdhani, sans-serif", fontSize: 12, fontWeight: 700,
          letterSpacing: "0.12em", textTransform: "uppercase",
          color: "#a5b4fc", textShadow: "0 0 8px rgba(165,180,252,0.4)",
        }}>
          {game}
        </span>
        {isRegistered && (
          <label style={{ position: "relative", display: "inline-block", width: 26, height: 14, flexShrink: 0, cursor: "pointer" }}>
            <input
              type="checkbox"
              checked={isPublic !== false}
              onChange={(e) => onToggle?.(e.target.checked)}
              style={{ opacity: 0, width: 0, height: 0, position: "absolute" }}
            />
            <span style={{
              position: "absolute", cursor: "pointer", top: 0, left: 0, right: 0, bottom: 0,
              background: isPublic !== false ? "linear-gradient(135deg,#6366f1,#8b5cf6)" : "#52525b",
              borderRadius: 14,
              transition: "all 250ms ease",
            }}>
              <span style={{
                position: "absolute",
                height: 10, width: 10,
                left: isPublic !== false ? 14 : 2,
                bottom: 2,
                background: "#fff",
                borderRadius: "50%",
                transition: "all 250ms ease",
              }} />
            </span>
          </label>
        )}
      </div>

      {/* tier image */}
      {imgName ? (
        <Image
          src={`/images/RankedEmblemsLatest/Rank=${imgName}.png`}
          alt={tier}
          width={36}
          height={36}
          style={{ objectFit: "contain" }}
        />
      ) : (
        <div style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }} />
      )}

      {/* name */}
      <span style={{
        fontFamily: "Rajdhani, sans-serif", fontSize: 12, fontWeight: 700,
        color: data ? "#e4e4e7" : "#52525b",
        letterSpacing: "0.02em", textAlign: "center", wordBreak: "break-all",
      }}>
        {data ? `${data.gameName}` : "-"}
      </span>

      {/* tier badge */}
      {data ? (
        <span style={{
          display: "inline-block",
          fontFamily: "Rajdhani, sans-serif", fontSize: 10, fontWeight: 700,
          letterSpacing: "0.04em", textTransform: "uppercase",
          color: "#fff", background: color,
          padding: "2px 8px", borderRadius: 3, marginTop: 2, marginBottom:5
        }}>
          {data.tier} {data.rank ?? ""}
        </span>
      ) : (
        <span style={{
          display: "inline-block",
          fontFamily: "Rajdhani, sans-serif", fontSize: 10, fontWeight: 700,
          color: "#fff", background: "#444",
          padding: "2px 8px", borderRadius: 3, marginTop: 2,
        }}>-</span>
      )}

      {/* action button */}
      <Highlight active={highlight}>
        <button
          onClick={isRegistered ? undefined : onRegister}
          style={{
            width: "100%",
            padding: "4px 0",
            border: "1px solid rgba(255,255,255,0.06)",
            borderRadius: 4,
            fontFamily: "Rajdhani, sans-serif", fontSize: 10, fontWeight: 700,
            letterSpacing: "0.04em", textTransform: "uppercase",
            cursor: isRegistered ? "pointer" : "pointer",
            color: isRegistered ? "#f87171" : "#71717a",
            background: "rgba(255,255,255,0.06)",
            transition: "all 150ms ease",
          }}
        >
          {isRegistered ? "Unlink" : "Register"}
        </button>
      </Highlight>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────

export default function MockExtensionPopup({
  highlight = null,
  chzzkState = "disconnected",
  riotState = "disconnected",
  channelName = "test user",
  lolData = null,
  tftData = null,
  lolRegistered = false,
  tftRegistered = false,
  lolPublic = true,
  tftPublic = true,
  onChzzkConnect,
  onRiotOAuth,
  onLolRegister,
  onTftRegister,
  onLolToggle,
  onTftToggle,
}: MockExtensionPopupProps) {
  return (
    <>
      {/* Font load */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@500;600;700&family=Orbitron:wght@600&display=swap');
        @keyframes highlight-pulse {
          0%,100% { box-shadow: 0 0 0 3px rgba(129,140,248,0.25), 0 0 12px rgba(129,140,248,0.4); }
          50%      { box-shadow: 0 0 0 5px rgba(129,140,248,0.1),  0 0 20px rgba(129,140,248,0.6); }
        }
        @keyframes orb-pulse {
          0%,100% { box-shadow: 0 0 0 0 rgba(52,211,153,0); }
          50%      { box-shadow: 0 0 16px 4px rgba(52,211,153,0.08); }
        }
        @keyframes orb-pulse-riot {
          0%,100% { box-shadow: 0 0 0 0 rgba(239,68,68,0); }
          50%      { box-shadow: 0 0 16px 4px rgba(239,68,68,0.08); }
        }
        @keyframes dot-blink {
          0%,100% { opacity:1; } 50% { opacity:0.4; }
        }
        @keyframes shimmer-text {
          0%   { background-position: 0% center; }
          100% { background-position: 200% center; }
        }
        @keyframes btn-pulse {
          0%,100% { opacity:1; } 50% { opacity:0.5; }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>

      {/* Popup shell */}
      <div style={{
        width: 340,
        height: 570,
        display: "flex",
        flexDirection: "column",
        background: "#0a0a0f",
        backgroundImage: "radial-gradient(ellipse at 20% 0%, rgba(99,102,241,0.08) 0%, transparent 50%), radial-gradient(ellipse at 80% 100%, rgba(139,92,246,0.06) 0%, transparent 50%)",
        color: "#e4e4e7",
        fontFamily: "'Noto Sans KR', sans-serif",
        fontSize: 13,
        lineHeight: 1.5,
        borderRadius: 12,
        overflow: "hidden",
        userSelect: "none",
        boxShadow: "0 24px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.06)",
      }}>
        {/* Scrollable content */}
        <div style={{ flex: 1, overflowY: "auto", padding: 20, scrollbarWidth: "none" }}>

          {/* Header */}
          <h1 style={{
            fontFamily: "Orbitron, sans-serif",
            fontSize: 15, fontWeight: 600,
            textAlign: "center",
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            marginBottom: 16,
            paddingBottom: 12,
            borderBottom: "1px solid rgba(255,255,255,0.06)",
            background: "linear-gradient(135deg, #818cf8, #c084fc, #818cf8)",
            backgroundSize: "200% auto",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            animation: "shimmer-text 3s linear infinite",
          }}>
            Riot Tier Tracker
          </h1>

          {/* ── Chzzk Card ── */}
          <div style={{
            background: "#12121a",
            borderRadius: 14,
            border: "1px solid rgba(255,255,255,0.06)",
            marginBottom: 12,
            padding: "16px 16px 14px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 10,
          }}>
            {/* Visual orb */}
            <div style={{ position: "relative", width: 64, height: 64, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <div style={{
                position: "absolute", inset: 0, borderRadius: "50%",
                background: chzzkState === "connected"
                  ? "radial-gradient(circle at 40% 35%, rgba(52,211,153,0.18), rgba(52,211,153,0.05) 70%, transparent)"
                  : "radial-gradient(circle at 40% 35%, rgba(99,102,241,0.12), rgba(99,102,241,0.04) 70%, transparent)",
                border: chzzkState === "connected" ? "1px solid rgba(52,211,153,0.15)" : "1px solid rgba(99,102,241,0.1)",
                animation: chzzkState === "connected" ? "orb-pulse 3s ease-in-out infinite" : undefined,
              }} />
              {chzzkState === "connected" ? (
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ position: "relative", zIndex: 1, filter: "drop-shadow(0 0 8px rgba(52,211,153,0.25))" }}>
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
              ) : (
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#52525b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ position: "relative", zIndex: 1 }}>
                  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                  <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                </svg>
              )}
            </div>

            {/* Body */}
            <div style={{ textAlign: "center", display: "flex", flexDirection: "column", gap: 2 }}>
              <span style={{ fontFamily: "Rajdhani, sans-serif", fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "#71717a" }}>
                Chzzk Account
              </span>
              {chzzkState === "connected" ? (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginTop: 2 }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#34d399", boxShadow: "0 0 6px rgba(52,211,153,0.5)", animation: "dot-blink 2.5s ease-in-out infinite", display: "inline-block" }} />
                  <span style={{ fontFamily: "Rajdhani, sans-serif", fontSize: 15, fontWeight: 700, color: "#e4e4e7", letterSpacing: "0.02em" }}>
                    {channelName}
                  </span>
                </div>
              ) : (
                <span style={{ fontSize: 12, color: "#52525b" }}>Not connected</span>
              )}
            </div>

            {/* Button */}
            {chzzkState === "connected" ? (
              <button style={{
                width: "100%",
                padding: "8px 16px",
                background: "transparent",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 6,
                color: "#71717a",
                fontFamily: "Rajdhani, sans-serif",
                fontSize: 12, fontWeight: 600,
                letterSpacing: "0.06em", textTransform: "uppercase",
                cursor: "pointer",
              }}>
                Disconnect
              </button>
            ) : (
              <Highlight active={highlight === "chzzk-connect"}>
                <button
                  onClick={onChzzkConnect}
                  style={{
                    width: "100%",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                    padding: "10px 16px",
                    background: chzzkState === "connecting"
                      ? "#52525b"
                      : "linear-gradient(135deg, #00c473, #059b54)",
                    border: "none", borderRadius: 6,
                    color: "#fff",
                    fontFamily: "Rajdhani, sans-serif",
                    fontSize: 13, fontWeight: 600,
                    letterSpacing: "0.06em", textTransform: "uppercase",
                    cursor: chzzkState === "connecting" ? "wait" : "pointer",
                    animation: chzzkState === "connecting" ? "btn-pulse 1.5s ease-in-out infinite" : undefined,
                    transition: "all 250ms ease",
                  }}
                >
                  {chzzkState === "connecting" ? (
                    "Connecting..."
                  ) : (
                    <>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                        <polyline points="10 17 15 12 10 7" />
                        <line x1="15" y1="12" x2="3" y2="12" />
                      </svg>
                      Connect
                    </>
                  )}
                </button>
              </Highlight>
            )}
          </div>

          {/* ── Riot Card ── */}
          <div style={{
            background: "#12121a",
            borderRadius: 14,
            border: "1px solid rgba(255,255,255,0.06)",
            marginBottom: 12,
            padding: "16px 16px 14px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 10,
            opacity: chzzkState !== "connected" ? 0.45 : 1,
            transition: "opacity 400ms ease",
          }}>
            {/* Visual orb */}
            <div style={{ position: "relative", width: 64, height: 64, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <div style={{
                position: "absolute", inset: 0, borderRadius: "50%",
                background: riotState === "connected"
                  ? "radial-gradient(circle at 40% 35%, rgba(239,68,68,0.18), rgba(239,68,68,0.05) 70%, transparent)"
                  : "radial-gradient(circle at 40% 35%, rgba(220,38,38,0.12), rgba(220,38,38,0.04) 70%, transparent)",
                border: riotState === "connected" ? "1px solid rgba(239,68,68,0.15)" : "1px solid rgba(220,38,38,0.1)",
                animation: riotState === "connected" ? "orb-pulse-riot 3s ease-in-out infinite" : undefined,
              }} />
              {riotState === "connected" ? (
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ position: "relative", zIndex: 1, filter: "drop-shadow(0 0 8px rgba(239,68,68,0.25))" }}>
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  <polyline points="9 12 11 14 15 10" />
                </svg>
              ) : (
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#52525b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ position: "relative", zIndex: 1 }}>
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
              )}
            </div>

            {/* Label */}
            <div style={{ textAlign: "center", display: "flex", flexDirection: "column", gap: 2 }}>
              <span style={{ fontFamily: "Rajdhani, sans-serif", fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "#71717a" }}>
                Riot Account{" "}
                <span style={{
                  display: "inline-block", fontSize: 8, fontWeight: 700, letterSpacing: "0.08em",
                  textTransform: "uppercase", color: "#1a1a2e",
                  background: "linear-gradient(135deg, #fbbf24, #f59e0b)",
                  padding: "1px 5px", borderRadius: 3, marginLeft: 4, verticalAlign: "middle",
                }}>BETA</span>
              </span>
              {riotState === "connecting" && (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, color: "#71717a" }}>
                  <span style={{
                    display: "inline-block", width: 12, height: 12,
                    border: "2px solid rgba(239,68,68,0.15)", borderTopColor: "#ef4444",
                    borderRadius: "50%", animation: "spin 0.8s linear infinite",
                  }} />
                  확인 중...
                </div>
              )}
              {riotState === "disconnected" && (
                <span style={{ fontSize: 12, color: "#52525b" }}>Not connected</span>
              )}
            </div>

            {/* Connected: LoL / TFT columns */}
            {riotState === "connected" && (
              <div style={{
                width: "100%",
                display: "flex",
                alignItems: "stretch",
                background: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(255,255,255,0.06)",
                borderRadius: 6,
                overflow: "hidden",
              }}>
                <TierCol
                  game="LoL"
                  data={lolData}
                  isRegistered={lolRegistered}
                  highlight={highlight === "lol-register"}
                  isPublic={lolPublic}
                  onRegister={onLolRegister}
                  onToggle={onLolToggle}
                />
                <div style={{ width: 1, background: "rgba(255,255,255,0.06)", alignSelf: "stretch" }} />
                <TierCol
                  game="TFT"
                  data={tftData}
                  isRegistered={tftRegistered}
                  highlight={highlight === "tft-register"}
                  isPublic={tftPublic}
                  onRegister={onTftRegister}
                  onToggle={onTftToggle}
                />
              </div>
            )}

            {/* OAuth button */}
            {riotState !== "connected" && (
              <Highlight active={highlight === "riot-oauth"}>
                <button
                  onClick={chzzkState === "connected" ? onRiotOAuth : undefined}
                  disabled={chzzkState !== "connected"}
                  style={{
                    width: "100%",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                    padding: "10px 16px",
                    background: riotState === "connecting"
                      ? "#52525b"
                      : "linear-gradient(135deg, #dc2626, #991b1b)",
                    border: "none", borderRadius: 6,
                    color: "#fff",
                    fontFamily: "Rajdhani, sans-serif",
                    fontSize: 13, fontWeight: 600,
                    letterSpacing: "0.06em", textTransform: "uppercase",
                    cursor: chzzkState !== "connected" ? "not-allowed" : riotState === "connecting" ? "wait" : "pointer",
                    animation: riotState === "connecting" ? "btn-pulse 1.5s ease-in-out infinite" : undefined,
                    opacity: chzzkState !== "connected" ? 0.5 : 1,
                    transition: "all 250ms ease",
                  }}
                >
                  {riotState === "connecting" ? "Connecting..." : (
                    <>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                        <polyline points="10 17 15 12 10 7" />
                        <line x1="15" y1="12" x2="3" y2="12" />
                      </svg>
                      Riot OAuth
                    </>
                  )}
                </button>
              </Highlight>
            )}

            {/* Logout button (connected) */}
            {riotState === "connected" && (
              <button style={{
                width: "100%",
                padding: "8px 16px",
                background: "transparent",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 6,
                color: "#71717a",
                fontFamily: "Rajdhani, sans-serif",
                fontSize: 12, fontWeight: 600,
                letterSpacing: "0.06em", textTransform: "uppercase",
                cursor: "pointer",
              }}>
                Logout
              </button>
            )}
          </div>
        </div>

        {/* Bottom nav */}
        <NavBar active="home" />
      </div>
    </>
  );
}
