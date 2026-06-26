"use client";

import { useEffect, useRef, useState } from "react";
import { TIER_COLORS, TIER_IMG_MAP } from "./tierConstants";

const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL!;
const WS_SERVERS = Array.from({ length: 20 }, (_, i) => `wss://kr-ss${i + 1}.chat.naver.com/chat`);
const TIER_CACHE_TTL = 5 * 60 * 1000;

const ROLE_BADGE_URL: Record<string, string> = {
  streamer: "https://ssl.pstatic.net/static/nng/glive/badge/streamer.png",
  manager: "https://ssl.pstatic.net/static/nng/glive/badge/manager.png",
};

const ROLE_NICKNAME_COLOR: Record<string, string> = {
  streamer: "#F9D749",
  manager: "#59E0A3",
};

interface ChzzkBadge {
  imageUrl: string;
}

interface ChatMessage {
  id: string;
  nickname: string;
  nicknameColor: string;
  roleBadgeUrl: string | null;
  viewerBadges: ChzzkBadge[];
  msg: string;
  emojis: Record<string, string>;
  tier?: string | null;
  rank?: string | null;
}

interface TierCacheEntry {
  tier: string | null;
  rank: string | null;
  fetchedAt: number;
}

function resolveNicknameColor(colorCode: string | undefined | null, userRoleCode: string): string {
  if (ROLE_NICKNAME_COLOR[userRoleCode]) return ROLE_NICKNAME_COLOR[userRoleCode];
  if (!colorCode) return "#FFFFFF";
  // Chzzk stores hex without '#', 5-char codes get a leading 0 to form 6-char hex
  const hex = colorCode.length === 5 ? `0${colorCode}` : colorCode;
  return `#${hex}`;
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
  const bottomRef = useRef<HTMLDivElement>(null);

  async function fetchTier(nickname: string): Promise<{ tier: string | null; rank: string | null }> {
    const cache = tierCacheRef.current[nickname];
    if (cache !== undefined) {
      if (cache === null || Date.now() - cache.fetchedAt < TIER_CACHE_TTL) {
        return cache ?? { tier: null, rank: null };
      }
    }
    try {
      const res = await fetch(`${SERVER_URL}/api/tier?chzzk_name=${encodeURIComponent(nickname)}`);
      if (!res.ok) { tierCacheRef.current[nickname] = null; return { tier: null, rank: null }; }
      const json = await res.json();
      const entries: any[] = json.entries ?? [];
      const entry = entries[0];
      const result = entry ? { tier: entry.tier, rank: entry.rank ?? null } : { tier: null, rank: null };
      tierCacheRef.current[nickname] = { ...result, fetchedAt: Date.now() };
      return result;
    } catch {
      tierCacheRef.current[nickname] = null;
      return { tier: null, rank: null };
    }
  }

  useEffect(() => {
    let alive = true;

    async function connect() {
      let chatChannelId: string;
      let accessToken: string;
      try {
        const chRes = await fetch(`${SERVER_URL}/api/chzzk/chat-channel?channelId=${encodeURIComponent(channelId)}`);
        if (!chRes.ok) return;
        const chData = await chRes.json();
        chatChannelId = chData.chatChannelId;

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
            const nicknameColor = resolveNicknameColor(colorCode, userRoleCode);
            const roleBadgeUrl = ROLE_BADGE_URL[userRoleCode] ?? null;

            const viewerBadges: ChzzkBadge[] = (profile.viewerBadges ?? [])
              .map((vb: any) => ({ imageUrl: vb.badge?.imageUrl ?? "" }))
              .filter((b: ChzzkBadge) => b.imageUrl);

            const emojis: Record<string, string> = extras.emojis ?? {};
            const id = `${item.ctime}-${item.uid}-${Math.random()}`;

            const { tier, rank } = await fetchTier(nickname);
            if (!alive) return;

            setMessages((prev) => {
              const next = [...prev, {
                id, nickname, nicknameColor, roleBadgeUrl, viewerBadges,
                msg: item.msg, emojis, tier, rank,
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

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 2,
        padding: "4px 0",
        fontFamily: "Pretendard, sans-serif",
        fontSize: 13,
        lineHeight: 1.5,
      }}
    >
      {messages.map((m) => (
        <div key={m.id} style={{ wordBreak: "break-all", padding: "2px 0" }}>
          {/* 역할 뱃지 (스트리머/매니저) */}
          {m.roleBadgeUrl && (
            <img
              src={m.roleBadgeUrl}
              alt=""
              width={16}
              height={16}
              style={{ display: "inline", verticalAlign: "middle", marginRight: 3 }}
            />
          )}
          {/* 치지직 뷰어 뱃지 */}
          {m.viewerBadges.map((b, i) => (
            <img
              key={i}
              src={b.imageUrl}
              alt=""
              width={16}
              height={16}
              style={{ display: "inline", verticalAlign: "middle", marginRight: 3 }}
            />
          ))}
          {/* 티어 뱃지 (익스텐션) */}
          {m.tier && <TierBadge tier={m.tier} rank={m.rank} />}
          {/* 닉네임 */}
          <span style={{ fontWeight: 700, color: m.nicknameColor, marginRight: 2 }}>
            {m.nickname}
          </span>
          <span style={{ color: "rgba(255,255,255,0.4)", marginRight: 4 }}>:</span>
          {/* 메시지 */}
          <span style={{ color: "#ffffff" }}>
            <MessageContent msg={m.msg} emojis={m.emojis} />
          </span>
        </div>
      ))}
      <div ref={bottomRef} />
    </div>
  );
}
