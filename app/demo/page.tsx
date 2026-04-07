"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import MockExtensionPopup from "@/components/demo/MockExtensionPopup";
import MockChat from "@/components/MockChat";
import type { ChzzkState, RiotState, HighlightTarget } from "@/components/demo/MockExtensionPopup";

// ── Constants ──────────────────────────────────────────────────────────────

const MOCK_LOL = { gameName: "Faker", tier: "CHALLENGER", rank: null, lp: 1200 };
const MOCK_TFT = { gameName: "Faker", tier: "DIAMOND", rank: "I", lp: 87 };
const STEP_COUNT = 5;

const STEPS = [
  {
    num: "01",
    title: "치지직 계정 연결",
    desc: "채팅창 배지 표시를 위해 치지직 계정을 인증합니다. OAuth로 자동 처리됩니다.",
    sub: undefined as string | undefined,
  },
  {
    num: "02",
    title: "라이엇 계정 연결",
    desc: "Riot 계정으로 LoL / TFT 티어 정보를 가져옵니다. RSO OAuth로 안전하게 인증됩니다.",
    sub: undefined as string | undefined,
  },
  {
    num: "03",
    title: "티어 등록",
    desc: "연동된 Riot 계정의 LoL / TFT 티어를 DB에 저장합니다. 공개 여부도 설정할 수 있습니다.",
    sub: "Register 버튼으로 각 게임을 개별 등록하고, 토글로 공개/비공개를 설정하세요.",
  },
  {
    num: "04",
    title: "채팅창 티어 배지",
    desc: "익스텐션 설치 후 치지직 라이브 채팅창에서 자동으로 티어 배지가 표시됩니다.",
    sub: "공개 설정한 게임만 배지로 표시됩니다.",
  },
  {
    num: "05",
    title: "OBS 오버레이",
    desc: "방송 화면에 시청자 티어 통계를 실시간으로 띄울 수 있습니다.",
    sub: "OBS Browser Source URL만 등록하면 Presence 기반으로 자동 갱신됩니다.",
  },
];

// ── Helpers ────────────────────────────────────────────────────────────────

const toTierCase = (t: string) => t.charAt(0).toUpperCase() + t.slice(1).toLowerCase();

// ── Main ───────────────────────────────────────────────────────────────────

export default function DemoPage() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [vh, setVh] = useState(800);
  const [scrollY, setScrollY] = useState(0);

  // Auth states
  const [chzzkState, setChzzkState] = useState<ChzzkState>("disconnected");
  const [riotState, setRiotState]   = useState<RiotState>("disconnected");
  const [lolData, setLolData]       = useState<typeof MOCK_LOL | null>(null);
  const [tftData, setTftData]       = useState<typeof MOCK_TFT | null>(null);

  // DB registration states (step 3)
  const [lolRegistered, setLolRegistered] = useState(false);
  const [tftRegistered, setTftRegistered] = useState(false);

  // Privacy toggles
  const [lolPublic, setLolPublic] = useState(true);
  const [tftPublic, setTftPublic] = useState(true);

  const [highlight, setHighlight] = useState<HighlightTarget>("chzzk-connect");

  // ── Derived ───────────────────────────────────────────────────────────────

  const anyRegistered = lolRegistered || tftRegistered;

  // Max step index the user can scroll to
  const maxScrollableStep =
    anyRegistered          ? STEP_COUNT - 1 :
    riotState === "connected" ? 2 :
    chzzkState === "connected" ? 1 :
    0;

  const visibleStepIdx = vh > 0
    ? Math.min(Math.round(scrollY / vh), STEP_COUNT - 1)
    : 0;

  const stepDone = [
    chzzkState === "connected",
    riotState === "connected",
    anyRegistered,
    anyRegistered,  // step 4 is "done" same condition
    false,
  ];

  // Chat tiers: only publicly registered games
  const chatTiers: string[] = [
    lolRegistered && lolPublic && lolData ? toTierCase(lolData.tier) : null,
    tftRegistered && tftPublic && tftData ? toTierCase(tftData.tier) : null,
  ].filter(Boolean) as string[];

  const showChat = visibleStepIdx >= 3 && anyRegistered;

  // ── Viewport & scroll ────────────────────────────────────────────────────

  useEffect(() => {
    const update = () => setVh(window.innerHeight);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const scrollToStep = useCallback((idx: number) => {
    scrollRef.current?.scrollTo({ top: idx * vh, behavior: "smooth" });
  }, [vh]);

  const handleScroll = useCallback(() => {
    setScrollY(scrollRef.current?.scrollTop ?? 0);
  }, []);

  const handleWheel = useCallback((e: WheelEvent) => {
    const el = scrollRef.current;
    if (!el) return;
    if (e.deltaY > 0 && el.scrollTop >= maxScrollableStep * vh - 1) {
      e.preventDefault();
    }
  }, [maxScrollableStep, vh]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener("scroll", handleScroll, { passive: true });
    el.addEventListener("wheel",  handleWheel,  { passive: false });
    return () => {
      el.removeEventListener("scroll", handleScroll);
      el.removeEventListener("wheel",  handleWheel);
    };
  }, [handleScroll, handleWheel]);

  // ── Handlers ──────────────────────────────────────────────────────────────

  function handleChzzkConnect() {
    if (chzzkState !== "disconnected") return;
    setChzzkState("connecting");
    setTimeout(() => {
      setChzzkState("connected");
      setHighlight("riot-oauth");
      setTimeout(() => scrollToStep(1), 400);
    }, 900);
  }

  function handleRiotOAuth() {
    if (riotState !== "disconnected" || chzzkState !== "connected") return;
    setRiotState("connecting");
    setTimeout(() => {
      setRiotState("connected");
      setLolData(MOCK_LOL);
      setTftData(MOCK_TFT);
      setHighlight("lol-register");
      setTimeout(() => scrollToStep(2), 400);
    }, 1200);
  }

  function handleLolRegister() {
    if (!lolData || lolRegistered) return;
    setLolRegistered(true);
    setHighlight("tft-register");
    if (!tftRegistered) return; // wait for both or just lol is enough
    setTimeout(() => scrollToStep(3), 400);
  }

  function handleTftRegister() {
    if (!tftData || tftRegistered) return;
    setTftRegistered(true);
    setHighlight(null);
    setTimeout(() => scrollToStep(3), 400);
  }

  // When either is registered, allow scrolling to step 4 (idx 3)
  useEffect(() => {
    if (anyRegistered && visibleStepIdx < 3) {
      setTimeout(() => scrollToStep(3), 400);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [anyRegistered]);

  // ── Shared popup ──────────────────────────────────────────────────────────

  const popup = (
    <MockExtensionPopup
      highlight={highlight}
      chzzkState={chzzkState}
      riotState={riotState}
      lolData={lolData}
      tftData={tftData}
      lolRegistered={lolRegistered}
      tftRegistered={tftRegistered}
      lolPublic={lolPublic}
      tftPublic={tftPublic}
      onChzzkConnect={handleChzzkConnect}
      onRiotOAuth={handleRiotOAuth}
      onLolRegister={handleLolRegister}
      onTftRegister={handleTftRegister}
      onLolToggle={setLolPublic}
      onTftToggle={setTftPublic}
    />
  );

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div style={{ height: "100vh", overflow: "hidden", background: "#080810", color: "#e4e4e7", position: "relative" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@500;600;700&family=Orbitron:wght@600&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { display: none; }
        @keyframes demo-fade-up {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes demo-check-pop {
          0%   { transform: scale(0);   opacity: 0; }
          60%  { transform: scale(1.3); opacity: 1; }
          100% { transform: scale(1);   opacity: 1; }
        }
      `}</style>

      {/* ── Fixed vertical dot indicator ── */}
      <div style={{
        position: "fixed", left: 28, top: "50%", transform: "translateY(-50%)",
        display: "flex", flexDirection: "column", gap: 20, zIndex: 50,
      }}>
        {STEPS.map((_, i) => {
          const isActive = visibleStepIdx === i;
          const isPast   = visibleStepIdx > i;
          const done     = stepDone[i];
          return (
            <div
              key={i}
              onClick={() => i <= maxScrollableStep && scrollToStep(i)}
              style={{ display: "flex", alignItems: "center", gap: 8, cursor: i <= maxScrollableStep ? "pointer" : "default" }}
            >
              <div style={{
                width:  isActive ? 10 : 7,
                height: isActive ? 10 : 7,
                borderRadius: "50%",
                background:
                  isActive           ? "#818cf8" :
                  isPast && done     ? "#34d399" :
                  "rgba(255,255,255,0.12)",
                boxShadow:
                  isActive       ? "0 0 10px rgba(129,140,248,0.8)" :
                  isPast && done ? "0 0 6px rgba(52,211,153,0.5)" :
                  "none",
                transition: "all 400ms cubic-bezier(0.16,1,0.3,1)",
              }} />
              {isPast && done && (
                <svg
                  width="11" height="11" viewBox="0 0 24 24"
                  fill="none" stroke="#34d399" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                  style={{ animation: "demo-check-pop 0.35s cubic-bezier(0.34,1.56,0.64,1) both" }}
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
            </div>
          );
        })}
      </div>

      {/* ── Left: scrollable step text (42%) ── */}
      <div
        ref={scrollRef}
        style={{
          position: "absolute", left: 0, top: 0,
          width: "42%", height: "100vh",
          overflowY: "scroll", scrollbarWidth: "none",
        }}
      >
        <div style={{ height: `${STEP_COUNT * vh}px` }}>
          {STEPS.map((s, i) => {
            const isActive = visibleStepIdx === i;
            const done     = stepDone[i];

            let action: (() => void) | undefined;
            let actionLabel = "";
            if (i === 0 && chzzkState === "disconnected") { action = handleChzzkConnect; actionLabel = "Connect 해보기"; }
            if (i === 1 && chzzkState === "connected" && riotState === "disconnected") { action = handleRiotOAuth; actionLabel = "Riot OAuth 해보기"; }

            return (
              <div
                key={i}
                style={{
                  height: vh,
                  display: "flex", flexDirection: "column", justifyContent: "center",
                  paddingLeft: 72, paddingRight: 40,
                  opacity: isActive ? 1 : 0.25,
                  transition: "opacity 600ms ease",
                }}
              >
                <p style={{
                  fontFamily: "Rajdhani, sans-serif", fontSize: 11, fontWeight: 700,
                  letterSpacing: "0.2em", textTransform: "uppercase",
                  color: isActive ? "#818cf8" : "#52525b",
                  marginBottom: 12, transition: "color 400ms ease",
                }}>
                  {s.num}
                </p>

                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                  <h2 style={{
                    fontFamily: "Rajdhani, sans-serif", fontSize: 28, fontWeight: 700,
                    color: "#e4e4e7", lineHeight: 1.2,
                  }}>
                    {s.title}
                  </h2>
                  {done && (
                    <div style={{
                      width: 24, height: 24, borderRadius: "50%", flexShrink: 0,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      background: "rgba(52,211,153,0.15)",
                      border: "1px solid rgba(52,211,153,0.3)",
                      animation: "demo-check-pop 0.4s cubic-bezier(0.34,1.56,0.64,1) both",
                    }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                        stroke="#34d399" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                  )}
                </div>

                <p style={{ fontSize: 14, color: "#71717a", lineHeight: 1.7, maxWidth: 340 }}>{s.desc}</p>
                {s.sub && (
                  <p style={{ fontSize: 13, color: "#52525b", lineHeight: 1.6, maxWidth: 340, marginTop: 8 }}>{s.sub}</p>
                )}

                {action && !done && isActive && (
                  <button
                    onClick={action}
                    style={{
                      marginTop: 28, alignSelf: "flex-start",
                      padding: "10px 22px",
                      background: "rgba(129,140,248,0.1)",
                      border: "1px solid rgba(129,140,248,0.3)",
                      borderRadius: 8, color: "#a5b4fc",
                      fontFamily: "Rajdhani, sans-serif", fontSize: 13, fontWeight: 600,
                      letterSpacing: "0.08em", textTransform: "uppercase",
                      cursor: "pointer", transition: "background 200ms ease, border-color 200ms ease",
                      animation: "demo-fade-up 0.4s ease both",
                    }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLButtonElement).style.background = "rgba(129,140,248,0.18)";
                      (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(129,140,248,0.5)";
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLButtonElement).style.background = "rgba(129,140,248,0.1)";
                      (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(129,140,248,0.3)";
                    }}
                  >
                    {actionLabel} →
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Right: fixed demo panel (58%) ── */}
      <div style={{
        position: "fixed", left: "42%", right: 0, top: 0,
        height: "100vh",
        display: "flex", alignItems: "center", justifyContent: "center",
        gap: 20, padding: "0 40px", overflow: "hidden",
      }}>
        {/* Popup: nudges left when chat appears */}
        <div style={{
          flexShrink: 0,
          transition: "transform 650ms cubic-bezier(0.16,1,0.3,1)",
          transform: showChat ? "translateX(-12px) scale(0.92)" : "translateX(0) scale(1)",
          transformOrigin: "center right",
        }}>
          {popup}
        </div>

        {/* Chat: slides in from right when step 4 reached */}
        <div style={{
          flexShrink: 0, width: 340,
          opacity: showChat ? 1 : 0,
          transform: showChat ? "translateX(0)" : "translateX(40px)",
          transition: "opacity 550ms ease, transform 650ms cubic-bezier(0.16,1,0.3,1)",
          pointerEvents: showChat ? "auto" : "none",
        }}>
          <p style={{
            fontFamily: "Rajdhani, sans-serif", fontSize: 11, fontWeight: 600,
            letterSpacing: "0.12em", textTransform: "uppercase",
            color: "#52525b", marginBottom: 8, textAlign: "center",
          }}>
            치지직 채팅창 미리보기
          </p>
          <MockChat nick="test user" nickColor="#a78bfa" tiers={chatTiers} />
        </div>
      </div>
    </div>
  );
}
