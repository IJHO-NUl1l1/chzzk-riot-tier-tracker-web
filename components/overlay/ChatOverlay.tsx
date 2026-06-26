"use client";

import { useEffect, useRef, useState } from "react";
import { TIER_COLORS, TIER_IMG_MAP } from "./tierConstants";
import { supabase } from "@/lib/supabase";

const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL!;
const WS_SERVERS = Array.from({ length: 20 }, (_, i) => `wss://kr-ss${i + 1}.chat.naver.com/chat`);
const TIER_CACHE_TTL = 5 * 60 * 1000;
const CHZZK_COLOR_API = `${process.env.NEXT_PUBLIC_SERVER_URL}/api/chzzk/nickname-color-codes`;

const ROLE_BADGE_URL: Record<string, string> = {
  streamer: "https://ssl.pstatic.net/static/nng/glive/badge/streamer.png",
  manager: "https://ssl.pstatic.net/static/nng/glive/badge/manager.png",
};

const ROLE_NICKNAME_COLOR: Record<string, string> = {
  streamer: "#F9D749",
  manager: "#59E0A3",
};

// CC000 없을 때 userIdHash + chatChannelId 해시로 선택하는 40색 팔레트 (dark mode)
// 치지직 JS 번들에서 추출한 값
const HASH_PALETTE_DARK = [
  "#EEA05D","#EAA35F","#E98158","#E97F58","#E76D53","#E66D5F","#E16490","#E481AE",
  "#E481AE","#D25FAC","#D263AE","#D66CB4","#D071B6","#AF71B5","#A96BB2","#905FAA",
  "#B38BC2","#9D78B8","#8D7AB8","#7F68AE","#9F99C8","#717DC6","#7E8BC2","#5A90C0",
  "#628DCC","#81A1CA","#ADD2DE","#83C5D6","#8BC8CB","#91CBC6","#83C3BB","#7DBFB2",
  "#AAD6C2","#84C194","#92C896","#94C994","#9FCE8E","#A6D293","#ABD373","#BFDE73",
];

// CD001~CD040: 구독 고정색 (JS번들 ih 오브젝트, dark mode)
const CD_COLOR_MAP: Record<string, string> = {
  CD001:"#EEA05D",CD002:"#EAA35F",CD003:"#E98158",CD004:"#E97F58",CD005:"#E76D53",
  CD006:"#E66D5F",CD007:"#E16490",CD008:"#E481AE",CD009:"#E481AE",CD010:"#D25FAC",
  CD011:"#D263AE",CD012:"#D66CB4",CD013:"#D071B6",CD014:"#AF71B5",CD015:"#A96BB2",
  CD016:"#905FAA",CD017:"#B38BC2",CD018:"#9D78B8",CD019:"#8D7AB8",CD020:"#7F68AE",
  CD021:"#9F99C8",CD022:"#717DC6",CD023:"#7E8BC2",CD024:"#5A90C0",CD025:"#628DCC",
  CD026:"#81A1CA",CD027:"#ADD2DE",CD028:"#83C5D6",CD029:"#8BC8CB",CD030:"#91CBC6",
  CD031:"#83C3BB",CD032:"#7DBFB2",CD033:"#AAD6C2",CD034:"#84C194",CD035:"#92C896",
  CD036:"#94C994",CD037:"#9FCE8E",CD038:"#A6D293",CD039:"#ABD373",CD040:"#BFDE73",
};

interface NicknameColor {
  solid?: string;
  gradient?: { start: string; end: string };
}

// CC/SG/SH/SS 코드 런타임 맵 (API에서 가져옴)
let runtimeColorMap: Record<string, { dark: string; gradient?: { start: string; end: string } }> = {};
let colorMapLoaded = false;

async function loadColorMap() {
  if (colorMapLoaded) return;
  try {
    const res = await fetch(CHZZK_COLOR_API);
    const data = await res.json();
    const list: any[] = data?.content?.codeList ?? [];
    list.forEach((c) => {
      runtimeColorMap[c.code] = {
        dark: c.darkRgbValue,
        gradient: c.effectType === "GRADATION" && c.effectValue
          ? { start: c.darkRgbValue, end: c.effectValue.darkRgbEndValue }
          : undefined,
      };
    });
    colorMapLoaded = true;
  } catch { /* 실패시 그냥 해시 팔레트로 폴백 */ }
}

function getNicknameColor(
  colorCode: string | undefined | null,
  userIdHash: string,
  chatChannelId: string,
  userRoleCode: string,
): NicknameColor {
  // 역할 색 우선
  if (ROLE_NICKNAME_COLOR[userRoleCode]) return { solid: ROLE_NICKNAME_COLOR[userRoleCode] };

  const code = colorCode ?? "";
  const prefix = code.slice(0, 2);

  // 해시 팔레트 폴백 (colorMap 미로드 시 포함)
  function hashColor(): string {
    let hash = 0;
    for (const c of userIdHash + chatChannelId) hash += c.charCodeAt(0);
    return HASH_PALETTE_DARK[hash % HASH_PALETTE_DARK.length];
  }

  // CC000 또는 CC 코드 → 해시 팔레트, CC001~은 runtimeColorMap 조회
  if (!code || prefix === "CC") {
    const entry = runtimeColorMap[code];
    if (entry && code !== "CC000") return { solid: entry.dark };
    return { solid: hashColor() };
  }

  // CD: 구독 고정색 (맵에 없으면 해시)
  if (prefix === "CD") return { solid: CD_COLOR_MAP[code] ?? hashColor() };

  // SG: tier2 그라데이션 (맵 미로드 시 해시로 폴백)
  if (prefix === "SG") {
    const entry = runtimeColorMap[code];
    if (entry?.gradient) return { gradient: entry.gradient };
    return { solid: entry?.dark ?? hashColor() };
  }

  // SH: tier2 하이라이트 (맵 미로드 시 해시로 폴백)
  if (prefix === "SH") {
    const entry = runtimeColorMap[code];
    return { solid: entry?.dark ?? hashColor() };
  }

  // SS: tier2 스텔스 (투명)
  if (prefix === "SS") return { solid: "transparent" };

  // 알 수 없는 prefix → 해시
  return { solid: hashColor() };
}

interface ChzzkBadge {
  imageUrl: string;
}

interface TierEntry {
  game_type: string;
  tier: string;
  rank: string | null;
}

interface ChatMessage {
  id: string;
  nickname: string;
  nicknameColor: NicknameColor;
  roleBadgeUrl: string | null;
  subBadgeUrl: string | null;
  viewerBadges: ChzzkBadge[];
  msg: string;
  emojis: Record<string, string>;
  tierEntries: TierEntry[];
}

interface TierCacheEntry {
  entries: TierEntry[];
  fetchedAt: number;
}

function TierBadge({ tier, rank }: { tier: string; rank?: string | null }) {
  const upper = tier.toUpperCase();
  const color = TIER_COLORS[upper] ?? "#888";
  const imgName = TIER_IMG_MAP[upper];
  const imgUrl = imgName ? `/images/RankedEmblemsLatest/Rank=${imgName}.png` : null;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 2, marginRight: 4, verticalAlign: "middle" }}>
      {imgUrl && <img src={imgUrl} alt={tier} width={16} height={16} style={{ display: "block" }} />}
      <span style={{ fontSize: 11, fontWeight: 700, color, lineHeight: 1 }}>
        {upper}{rank ? ` ${rank}` : ""}
      </span>
    </span>
  );
}

function NicknameSpan({ color, children }: { color: NicknameColor; children: React.ReactNode }) {
  if (color.gradient) {
    return (
      <span
        style={{
          fontWeight: 700,
          marginRight: 2,
          background: `linear-gradient(to right, ${color.gradient.start}, ${color.gradient.end})`,
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
        }}
      >
        {children}
      </span>
    );
  }
  return (
    <span style={{ fontWeight: 700, color: color.solid ?? "#FFFFFF", marginRight: 2 }}>
      {children}
    </span>
  );
}

function MessageContent({ msg, emojis }: { msg: string; emojis: Record<string, string> }) {
  const parts = msg.split(/(\{:[^}]+:\})/);
  return (
    <>
      {parts.map((part, i) => {
        const match = part.match(/^\{:([^}]+):\}$/);
        if (match) {
          const emojiUrl = emojis[match[1]];
          if (emojiUrl) {
            return (
              <img
                key={i}
                src={emojiUrl}
                alt={part}
                width={20}
                height={20}
                style={{ display: "inline", verticalAlign: "middle" }}
              />
            );
          }
        }
        return <span key={i}>{part}</span>;
      })}
    </>
  );
}

async function connectWs(url: string): Promise<WebSocket> {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(url);
    const t = setTimeout(() => { ws.close(); reject(new Error("timeout")); }, 3000);
    ws.onopen = () => { clearTimeout(t); resolve(ws); };
    ws.onerror = () => { clearTimeout(t); reject(new Error("error")); };
  });
}

export default function ChatOverlay({ channelId }: { channelId: string }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const tierCacheRef = useRef<Record<string, TierCacheEntry | null>>({});
  const wsRef = useRef<WebSocket | null>(null);
  const chatChannelIdRef = useRef<string>("");

  async function fetchTierEntries(nickname: string): Promise<TierEntry[]> {
    const cache = tierCacheRef.current[nickname];
    if (cache !== undefined) {
      if (cache === null || Date.now() - cache.fetchedAt < TIER_CACHE_TTL) {
        return cache?.entries ?? [];
      }
    }
    try {
      const res = await fetch(`${SERVER_URL}/api/tier?chzzk_name=${encodeURIComponent(nickname)}`);
      if (!res.ok) { tierCacheRef.current[nickname] = null; return []; }
      const json = await res.json();
      const entries: TierEntry[] = (json.entries ?? []).map((e: any) => ({
        game_type: e.game_type,
        tier: e.tier,
        rank: e.rank ?? null,
      }));
      tierCacheRef.current[nickname] = { entries, fetchedAt: Date.now() };
      return entries;
    } catch {
      tierCacheRef.current[nickname] = null;
      return [];
    }
  }

  useEffect(() => {
    let alive = true;
    loadColorMap();

    async function connect() {
      let chatChannelId: string;
      let accessToken: string;
      try {
        const chRes = await fetch(`${SERVER_URL}/api/chzzk/chat-channel?channelId=${encodeURIComponent(channelId)}`);
        if (!chRes.ok) return;
        const chData = await chRes.json();
        chatChannelId = chData.chatChannelId;
        chatChannelIdRef.current = chatChannelId;

        const tkRes = await fetch(`${SERVER_URL}/api/chzzk/chat-token?chatChannelId=${encodeURIComponent(chatChannelId)}`);
        if (!tkRes.ok) return;
        const tkData = await tkRes.json();
        accessToken = tkData.accessToken;
      } catch {
        return;
      }
      if (!alive) return;

      let ws: WebSocket | null = null;
      for (const url of WS_SERVERS) {
        try { ws = await connectWs(url); break; } catch { /* try next */ }
      }
      if (!ws || !alive) { ws?.close(); return; }
      wsRef.current = ws;

      ws.send(JSON.stringify({
        bdy: { accTkn: accessToken, auth: "READ", devType: 2001, uid: null },
        cmd: 100,
        cid: chatChannelId,
        svcid: "game",
        ver: "2",
      }));

      ws.onmessage = async (e) => {
        if (!alive) return;
        let data: any;
        try { data = JSON.parse(e.data); } catch { return; }

        if (data.cmd === 93101) {
          const items: any[] = Array.isArray(data.bdy) ? data.bdy : [];
          for (const item of items) {
            if (item.msgStatusType !== "NORMAL" || item.msgTypeCode !== 1) continue;

            let profile: any = {};
            let extras: any = {};
            try { profile = JSON.parse(item.profile || "{}"); } catch { }
            try { extras = JSON.parse(item.extras || "{}"); } catch { }

            const nickname: string = profile.nickname ?? "";
            if (!nickname) continue;

            const userRoleCode: string = profile.userRoleCode ?? "common_user";
            const colorCode: string | undefined = profile.streamingProperty?.nicknameColor?.colorCode;
            const nicknameColor = getNicknameColor(
              colorCode,
              profile.userIdHash ?? "",
              chatChannelIdRef.current,
              userRoleCode,
            );

            const roleBadgeUrl = ROLE_BADGE_URL[userRoleCode] ?? null;
            const subBadgeUrl: string | null = profile.streamingProperty?.subscription?.badge?.imageUrl ?? null;
            const viewerBadges: ChzzkBadge[] = (profile.viewerBadges ?? [])
              .map((vb: any) => ({ imageUrl: vb.badge?.imageUrl ?? "" }))
              .filter((b: ChzzkBadge) => b.imageUrl);

            const emojis: Record<string, string> = extras.emojis ?? {};
            const id = `${item.ctime}-${item.uid}-${Math.random()}`;

            const tierEntries = await fetchTierEntries(nickname);
            if (!alive) return;

            setMessages((prev) => {
              const next = [...prev, {
                id, nickname, nicknameColor, roleBadgeUrl, subBadgeUrl, viewerBadges,
                msg: item.msg, emojis, tierEntries,
              }];
              return next.slice(-50);
            });
          }
        }
      };

      ws.onclose = () => {
        wsRef.current = null;
        if (alive) setTimeout(connect, 3000);
      };
    }

    connect();
    return () => {
      alive = false;
      wsRef.current?.close();
      wsRef.current = null;
    };
  }, [channelId]);

  // Supabase realtime: tier 변동을 실시간으로 반영
  useEffect(() => {
    if (!channelId) return;

    const channel = supabase.channel(`tier_updates:${channelId}`);

    channel
      .on("broadcast", { event: "tier_updated" }, ({ payload }) => {
        const { chzzkChannelName, gameType, tier, rank, isPublic } = payload as {
          chzzkChannelName: string;
          gameType: string;
          tier: string | null;
          rank: string | null;
          isPublic: boolean;
        };
        if (!chzzkChannelName) return;
        const key = chzzkChannelName.toLowerCase();

        const updateEntries = (prev: TierEntry[]): TierEntry[] => {
          const filtered = prev.filter((e) => e.game_type !== gameType);
          if (isPublic && tier) filtered.push({ game_type: gameType, tier, rank: rank ?? null });
          return filtered;
        };

        // 캐시 갱신
        const cached = tierCacheRef.current[chzzkChannelName];
        if (cached) {
          tierCacheRef.current[chzzkChannelName] = {
            entries: updateEntries(cached.entries),
            fetchedAt: Date.now(),
          };
        } else {
          delete tierCacheRef.current[chzzkChannelName];
        }

        setMessages((prev) =>
          prev.map((m) =>
            m.nickname.toLowerCase() === key
              ? { ...m, tierEntries: updateEntries(m.tierEntries) }
              : m
          )
        );
      })
      .on("broadcast", { event: "tier_deleted" }, ({ payload }) => {
        const { chzzkChannelName, gameType } = payload as {
          chzzkChannelName: string;
          gameType: string | null;
        };
        if (!chzzkChannelName) return;
        const key = chzzkChannelName.toLowerCase();

        const removeEntries = (prev: TierEntry[]): TierEntry[] =>
          gameType ? prev.filter((e) => e.game_type !== gameType) : [];

        const cached = tierCacheRef.current[chzzkChannelName];
        if (cached) {
          tierCacheRef.current[chzzkChannelName] = {
            entries: removeEntries(cached.entries),
            fetchedAt: cached.fetchedAt,
          };
        }

        setMessages((prev) =>
          prev.map((m) =>
            m.nickname.toLowerCase() === key
              ? { ...m, tierEntries: removeEntries(m.tierEntries) }
              : m
          )
        );
      })
      .on("broadcast", { event: "privacy_changed" }, ({ payload }) => {
        const { chzzkChannelName, gameType, isPublic } = payload as {
          chzzkChannelName: string;
          gameType: string | null;
          isPublic: boolean;
        };
        if (!chzzkChannelName) return;
        const key = chzzkChannelName.toLowerCase();

        if (!isPublic) {
          // 비공개: 해당 game_type 항목 제거
          const removeGame = (prev: TierEntry[]): TierEntry[] =>
            gameType ? prev.filter((e) => e.game_type !== gameType) : [];

          const cached = tierCacheRef.current[chzzkChannelName];
          if (cached) {
            tierCacheRef.current[chzzkChannelName] = {
              entries: removeGame(cached.entries),
              fetchedAt: cached.fetchedAt,
            };
          }
          setMessages((prev) =>
            prev.map((m) =>
              m.nickname.toLowerCase() === key
                ? { ...m, tierEntries: removeGame(m.tierEntries) }
                : m
            )
          );
        } else {
          // 공개로 전환 → 캐시 만료 후 다음 채팅 시 재조회
          delete tierCacheRef.current[chzzkChannelName];
        }
      })
      .subscribe((status) => {
        console.log(`[ChatOverlay] realtime ${status} — tier_updates:${channelId}`);
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [channelId]);

  return (
    <div
      style={{
        height: "100vh",
        width: "100%",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-end",
        gap: 2,
        padding: "4px 8px",
        boxSizing: "border-box",
        fontFamily: "Pretendard, sans-serif",
        fontSize: 13,
        lineHeight: 1.5,
      }}
    >
      {messages.map((m) => (
        <div key={m.id} style={{ wordBreak: "break-all", padding: "2px 0" }}>
          {/* 역할 뱃지 (스트리머/매니저) */}
          {m.roleBadgeUrl && (
            <img src={m.roleBadgeUrl} alt="" width={16} height={16}
              style={{ display: "inline", verticalAlign: "middle", marginRight: 3 }} />
          )}
          {/* 구독 뱃지 */}
          {m.subBadgeUrl && (
            <img src={m.subBadgeUrl} alt="" width={16} height={16}
              style={{ display: "inline", verticalAlign: "middle", marginRight: 3 }} />
          )}
          {/* 치지직 뷰어 뱃지 */}
          {m.viewerBadges.map((b, i) => (
            <img key={i} src={b.imageUrl} alt="" width={16} height={16}
              style={{ display: "inline", verticalAlign: "middle", marginRight: 3 }} />
          ))}
          {/* 티어 뱃지 (익스텐션) — 공개된 게임 수만큼 표시 */}
          {m.tierEntries.map((e) => (
            <TierBadge key={e.game_type} tier={e.tier} rank={e.rank} />
          ))}
          {/* 닉네임 (색상/그라데이션) */}
          <NicknameSpan color={m.nicknameColor}>{m.nickname}</NicknameSpan>
          <span style={{ color: "rgba(255,255,255,0.4)", marginRight: 4 }}>:</span>
          {/* 메시지 */}
          <span style={{ color: "#ffffff" }}>
            <MessageContent msg={m.msg} emojis={m.emojis} />
          </span>
        </div>
      ))}
    </div>
  );
}
