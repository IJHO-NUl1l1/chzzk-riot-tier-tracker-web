"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import SiteHeader from "@/components/SiteHeader";
import MockExtensionPopup from "@/components/MockExtensionPopup";
import MockChat, { type TierBadgeInfo } from "@/components/MockChat";
import type { ChzzkState, RiotState, HighlightTarget } from "@/components/MockExtensionPopup";
import BadgeList from "@/components/overlay/BadgeList";
import TierStats from "@/components/overlay/TierStats";
import { MOCK_OVERLAY_VIEWERS } from "@/components/overlay/mockOverlayViewers";

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

// 오른쪽 데모 패널은 이 "디자인 캔버스" 크기 기준으로 요소를 배치하고,
// 실제 패널 크기에 맞춰 전체를 균일 스케일한다. 픽셀 고정 배치는 화면
// 크기에 따라 요소가 겹치거나(1366px에서 팝업이 채팅을 덮음) 구성 비율이
// 달라지는 문제가 있어서, 어떤 모니터든 같은 구성이 보이도록 통일.
const STAGE_W = 1300;
const STAGE_H = 760;

export default function DemoPage() {
  const [vh, setVh] = useState(800);
  const [vw, setVw] = useState(1280);
  const [scrollY, setScrollY] = useState(0);
  // 휠 스크롤로 단계를 넘길 때만 부드럽게 트랜지션을 켠다(클릭/등록 후 자동
  // 이동도 동일). 휠을 계속 굴릴 때는 트랜지션 없이 즉각 반응해야 스크롤
  // 느낌이 자연스럽다.
  const [isAnimating, setIsAnimating] = useState(false);

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

  // 스텝별 하이라이트 — 상태에서 derive해서 앞뒤로 왔다 갔다 해도 항상 정확
  const highlights: HighlightTarget[] =
    visibleStepIdx === 0 ? ["chzzk-connect"] :
    visibleStepIdx === 1 ? ["riot-oauth"] :
    visibleStepIdx === 2 ? [
      ...(!lolRegistered ? ["lol-register" as HighlightTarget] : []),
      ...(!tftRegistered ? ["tft-register" as HighlightTarget] : []),
    ] :
    visibleStepIdx === 3 ? ["lol-toggle", "tft-toggle"] :
    [];

  const stepDone = [
    chzzkState === "connected",
    riotState === "connected",
    anyRegistered,
    anyRegistered,  // step 4 is "done" same condition
    false,
  ];

  // Chat tiers: only publicly registered games
  const chatTiers: TierBadgeInfo[] = [
    lolRegistered && lolPublic && lolData
      ? { tier: toTierCase(lolData.tier), rank: lolData.rank, gameType: "lol" as const, lp: lolData.lp, riotName: `${lolData.gameName}#KR1` }
      : null,
    tftRegistered && tftPublic && tftData
      ? { tier: toTierCase(tftData.tier), rank: tftData.rank, gameType: "tft" as const, lp: tftData.lp, riotName: `${tftData.gameName}#KR1` }
      : null,
  ].filter(Boolean) as TierBadgeInfo[];

  // 채팅 미리보기는 04 단계에서만, 05(OBS 오버레이) 단계에 들어가면 사라지고
  // 오버레이 미리보기로 교체된다(같은 슬롯에서 크로스페이드).
  const showChat = visibleStepIdx === 3 && anyRegistered;
  const showOverlay = visibleStepIdx >= 4;
  const showPopup = visibleStepIdx < 4;

  // ── Viewport & scroll ────────────────────────────────────────────────────

  useEffect(() => {
    const update = () => {
      setVh(window.innerHeight);
      setVw(window.innerWidth);
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const scrollToStep = useCallback((idx: number) => {
    setIsAnimating(true);
    setScrollY(idx * vh);
    setTimeout(() => setIsAnimating(false), 650);
  }, [vh]);

  // wheel accumulator for step snapping
  const wheelAccRef = useRef(0);
  const wheelTimeoutRef = useRef<number | null>(null);

  // 휠 이벤트를 window에 직접 붙여서, 화면 어디(왼쪽 텍스트든 오른쪽
  // 데모 패널이든)에서 스크롤하든 동일하게 단계가 넘어가게 한다. 예전엔
  // 왼쪽 28% 영역에만 실제 스크롤 컨테이너가 있어서 그 좁은 범위 밖에서는
  // 휠이 먹지 않았다.
  const handleWheel = useCallback((e: WheelEvent) => {
    // If the wheel event happened over a scrollable inner element (like the
    // popup's content), allow that element to scroll normally. Only when the
    // inner element cannot scroll further in the delta direction do we
    // intercept and perform the step-based page scroll via accumulator.
    const target = e.target as HTMLElement | null;

    const findScrollable = (node: HTMLElement | null): HTMLElement | null => {
      while (node && node !== document.body) {
        const style = window.getComputedStyle(node);
        const overflowY = style.overflowY;
        if ((overflowY === "auto" || overflowY === "scroll" || overflowY === "overlay") && node.scrollHeight > node.clientHeight) {
          return node;
        }
        node = node.parentElement;
      }
      return null;
    };

    const scrollable = findScrollable(target);
    if (scrollable) {
      const { scrollTop, scrollHeight, clientHeight } = scrollable;
      const atTop = scrollTop <= 0;
      const atBottom = scrollTop + clientHeight >= scrollHeight - 1;

      if ((e.deltaY < 0 && !atTop) || (e.deltaY > 0 && !atBottom)) {
        // Let the inner scrollable element handle the wheel event.
        return;
      }
      // otherwise fallthrough to handle step scroll when inner can't move
    }

    // Ignore new inputs while animating between steps
    if (isAnimating) {
      e.preventDefault();
      return;
    }

    // Accumulate wheel deltas and trigger a step when threshold reached.
    // Reset accumulator after a short idle period.
    wheelAccRef.current += e.deltaY;
    if (wheelTimeoutRef.current) {
      window.clearTimeout(wheelTimeoutRef.current);
    }
    wheelTimeoutRef.current = window.setTimeout(() => {
      wheelAccRef.current = 0;
      wheelTimeoutRef.current = null;
    }, 300);

    const threshold = vh * 0.2; // 20% of viewport height
    if (Math.abs(wheelAccRef.current) >= threshold) {
      const dir = wheelAccRef.current > 0 ? 1 : -1; // positive -> down
      const nextIdx = Math.min(Math.max(visibleStepIdx + dir, 0), maxScrollableStep);
      if (nextIdx !== visibleStepIdx) {
        e.preventDefault();
        // perform step snap
        scrollToStep(nextIdx);
      }
      // reset
      wheelAccRef.current = 0;
      if (wheelTimeoutRef.current) {
        window.clearTimeout(wheelTimeoutRef.current);
        wheelTimeoutRef.current = null;
      }
    } else {
      // prevent native page scroll while accumulating
      e.preventDefault();
    }
  }, [maxScrollableStep, vh, isAnimating, visibleStepIdx, scrollToStep]);

  useEffect(() => {
    window.addEventListener("wheel", handleWheel, { passive: false });
    return () => window.removeEventListener("wheel", handleWheel);
  }, [handleWheel]);

  // ── Handlers ──────────────────────────────────────────────────────────────

  function handleChzzkConnect() {
    if (chzzkState !== "disconnected") return;
    setChzzkState("connecting");
    setTimeout(() => {
      setChzzkState("connected");
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
      setTimeout(() => scrollToStep(2), 400);
    }, 1200);
  }

  function handleLolRegister() {
    if (!lolData || lolRegistered) return;
    setLolRegistered(true);
    if (!tftRegistered) return;
    setTimeout(() => scrollToStep(3), 400);
  }

  function handleTftRegister() {
    if (!tftData || tftRegistered) return;
    setTftRegistered(true);
    setTimeout(() => scrollToStep(3), 400);
  }

  function handleLolUnlink() {
    setLolRegistered(false);
    if (!tftRegistered) scrollToStep(2);
  }

  function handleTftUnlink() {
    setTftRegistered(false);
    if (!lolRegistered) scrollToStep(2);
  }

  function handleChzzkDisconnect() {
    setChzzkState("disconnected");
    setRiotState("disconnected");
    setLolData(null);
    setTftData(null);
    setLolRegistered(false);
    setTftRegistered(false);
    scrollToStep(0);
  }

  function handleRiotLogout() {
    setRiotState("disconnected");
    setLolData(null);
    setTftData(null);
    setLolRegistered(false);
    setTftRegistered(false);
    scrollToStep(1);
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
      highlights={highlights}
      chzzkState={chzzkState}
      riotState={riotState}
      lolData={lolData}
      tftData={tftData}
      lolRegistered={lolRegistered}
      tftRegistered={tftRegistered}
      lolPublic={lolPublic}
      tftPublic={tftPublic}
      onChzzkConnect={handleChzzkConnect}
      onChzzkDisconnect={handleChzzkDisconnect}
      onRiotOAuth={handleRiotOAuth}
      onRiotLogout={handleRiotLogout}
      onLolRegister={handleLolRegister}
      onLolUnlink={handleLolUnlink}
      onTftRegister={handleTftRegister}
      onTftUnlink={handleTftUnlink}
      onLolToggle={setLolPublic}
      onTftToggle={setTftPublic}
    />
  );

  // ── Render ─────────────────────────────────────────────────────────────────

  const HEADER_H = 56;

  // 데모 패널(뷰포트의 72% × 헤더 제외 높이)에 디자인 캔버스가 꼭 맞는
  // 균일 스케일. 가로/세로 중 더 빡빡한 쪽에 맞춰서 잘림·겹침이 없다.
  const panelW = vw * 0.72;
  const panelH = vh - HEADER_H;
  const stageScale = Math.min(panelW / STAGE_W, panelH / STAGE_H);

  return (
    <div style={{ height: "100vh", overflow: "hidden", background: "#080810", color: "#e4e4e7", display: "flex", flexDirection: "column" }}>
      <SiteHeader />
      <div style={{ flex: 1, overflow: "hidden", position: "relative" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@500;600;700&family=Orbitron:wght@600&display=swap');
        ::-webkit-scrollbar { display: none; }
        @keyframes demo-fade-up {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes highlight-pulse {
          0%,100% { box-shadow: 0 0 0 3px rgba(129,140,248,0.25), 0 0 12px rgba(129,140,248,0.4); }
          50%      { box-shadow: 0 0 0 5px rgba(129,140,248,0.1),  0 0 20px rgba(129,140,248,0.6); }
        }
        @keyframes demo-check-pop {
          0%   { transform: scale(0);   opacity: 0; }
          60%  { transform: scale(1.3); opacity: 1; }
          100% { transform: scale(1);   opacity: 1; }
        }
      `}</style>

      {/* ── Fixed vertical dot indicator ── */}
      <div style={{
        position: "fixed", left: 28, top: `calc(50% + ${HEADER_H / 2}px)`, transform: "translateY(-50%)",
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

      <div
        style={{
          position: "absolute", left: 0, top: 0,
          width: "28%", height: "100vh",
          overflow: "hidden",
        }}
      >
        <div style={{
          height: `${STEP_COUNT * vh}px`,
          transform: `translateY(-${scrollY}px)`,
          transition: isAnimating ? "transform 650ms cubic-bezier(0.16,1,0.3,1)" : "none",
        }}>
          {STEPS.map((s, i) => {
            const isActive = visibleStepIdx === i;
            const done     = stepDone[i];

            return (
              <div
                key={i}
                style={{
                  height: vh,
                  display: "flex", flexDirection: "column", justifyContent: "center",
                  paddingLeft: 68, paddingRight: 24,
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
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Right: fixed demo panel (72%) — 디자인 캔버스를 균일 스케일 ── */}
      <div style={{
        position: "fixed", left: "28%", right: 0, top: HEADER_H,
        height: `calc(100vh - ${HEADER_H}px)`,
        overflow: "hidden",
      }}>
        <div style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          width: STAGE_W,
          height: STAGE_H,
          transform: `translate(-50%,-50%) scale(${stageScale})`,
        }}>
          {/* Extension popup slot */}
          <div style={{
            position: "absolute",
            left: 220,
            top: "50%",
            transform: showChat
              ? "translateY(-50%) translateX(-16px) scale(1.05)"
              : "translateY(-50%) translateX(0) scale(1.15)",
            transformOrigin: "center right",
            opacity: showPopup ? 1 : 0,
            pointerEvents: showPopup ? "auto" : "none",
            transition: "transform 650ms cubic-bezier(0.16,1,0.3,1), opacity 450ms ease",
            zIndex: 20,
          }}>
            {popup}
          </div>

          {/* OBS overlay: centered slot */}
          <div style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            transform: "translate(-50%,-50%)",
            width: 620,
            height: 480,
            zIndex: 10,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            pointerEvents: showOverlay ? "auto" : "none",
          }}>
            <div style={{
              width: "100%",
              height: "100%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              opacity: showOverlay ? 1 : 0,
              transform: showOverlay ? "translateX(0)" : "translateX(20px)",
              transition: "opacity 550ms ease, transform 650ms cubic-bezier(0.16,1,0.3,1)",
              pointerEvents: showOverlay ? "auto" : "none",
            }}>
              <p style={{
                fontFamily: "Rajdhani, sans-serif", fontSize: 11, fontWeight: 600,
                letterSpacing: "0.12em", textTransform: "uppercase",
                color: "#52525b", marginBottom: 8, textAlign: "center",
              }}>
                OBS 오버레이 미리보기
              </p>
              <div style={{ display: "flex", flexDirection: "row", gap: 30, transformOrigin: "top center" }}>
                <BadgeList viewers={MOCK_OVERLAY_VIEWERS} gameType="lol" />
                <TierStats viewers={MOCK_OVERLAY_VIEWERS} gameType="lol" />
              </div>
            </div>
          </div>

          {/* Chat preview: 팝업(우측 끝 ~561) 오른쪽에 겹치지 않게 배치 */}
          <div style={{
            position: "absolute",
            left: 660,
            top: "50%",
            transform: "translateY(-50%)",
            width: 384,
            zIndex: 9,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}>
            <div style={{
              width: "100%",
              maxWidth: 384,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              opacity: showChat ? 1 : 0,
              transform: showChat ? "translateX(0)" : "translateX(20px)",
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
              <MockChat nick="Faker" nickColor="#a78bfa" tiers={chatTiers} highlightInput={showChat} />
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}
