"use client";

import { useEffect, useRef, useState } from "react";
import { TIER_COLORS, TIER_IMG_MAP, type GameType } from "./tierConstants";

const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL!;
const WS_SERVERS = Array.from({ length: 20 }, (_, i) => `wss://kr-ss${i + 1}.chat.naver.com/chat`);

interface ChatMessage {
  id: string;
  nickname: string;
  msg: string;
  tier?: string | null;
  rank?: string | null;
}

interface TierCache {
  [nickname: string]: { tier: string | null; rank: string | null; fetchedAt: number } | null;
}

const TIER_CACHE_TTL = 5 * 60 * 1000;

function TierBadge({ tier, rank }: { tier: string; rank?: string | null }) {
  const upper = tier.toUpperCase();
  const color = TIER_COLORS[upper] ?? "#888";
  const imgName = TIER_IMG_MAP[upper];
  const imgUrl = imgName
    ? `/images/RankedEmblemsLatest/Rank=${imgName}.png`
    : null;

  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 3, marginRight: 4, verticalAlign: "middle" }}>
      {imgUrl && (
        <img src={imgUrl} alt={tier} width={16} height={16} style={{ display: "block" }} />
      )}
      <span style={{ fontSize: 11, fontWeight: 700, color, lineHeight: 1 }}>
        {upper}{rank ? ` ${rank}` : ""}
      </span>
    </span>
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

export default function ChatOverlay({ channelId, gameType }: { channelId: string; gameType: GameType }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const tierCacheRef = useRef<TierCache>({});
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
      const entry = entries.find((e) => e.game_type === gameType);
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
      // chatChannelId 획득
      let chatChannelId: string;
      let accessToken: string;
      try {
        const [chRes, tkRes] = await Promise.all([
          fetch(`${SERVER_URL}/api/chzzk/chat-channel?channelId=${encodeURIComponent(channelId)}`),
          // accessToken은 chatChannelId 없이 못 가져오므로 순서대로
        ]);
        if (!chRes.ok) return;
        const chData = await chRes.json();
        chatChannelId = chData.chatChannelId;

        const tkRes2 = await fetch(`${SERVER_URL}/api/chzzk/chat-token?chatChannelId=${encodeURIComponent(chatChannelId)}`);
        if (!tkRes2.ok) return;
        const tkData = await tkRes2.json();
        accessToken = tkData.accessToken;
      } catch {
        return;
      }

      if (!alive) return;

      // WebSocket 연결 (첫 번째 응답 서버 사용)
      let ws: WebSocket | null = null;
      for (const url of WS_SERVERS) {
        try { ws = await connectWs(url); break; } catch { /* try next */ }
      }
      if (!ws || !alive) { ws?.close(); return; }

      wsRef.current = ws;

      // onopen은 connectWs 안에서 이미 fire됐으므로 바로 send
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
            if (item.msgStatusType !== "NORMAL") continue;
            if (item.msgTypeCode !== 1) continue;

            let nickname = "";
            try { nickname = JSON.parse(item.profile).nickname ?? ""; } catch { }
            if (!nickname) continue;

            const msg = item.msg as string;
            const id = `${item.ctime}-${item.uid}-${Math.random()}`;

            const { tier, rank } = await fetchTier(nickname);

            if (!alive) return;
            setMessages((prev) => {
              const next = [...prev, { id, nickname, msg, tier, rank }];
              return next.slice(-50); // 최대 50개 유지
            });
          }
        }
      };

      ws.onclose = () => {
        wsRef.current = null;
        if (alive) setTimeout(connect, 3000); // 재연결
      };
    }

    connect();

    return () => {
      alive = false;
      wsRef.current?.close();
      wsRef.current = null;
    };
  }, [channelId, gameType]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      gap: 4,
      padding: "4px 0",
      fontFamily: "Pretendard, sans-serif",
    }}>
      {messages.map((m) => (
        <div
          key={m.id}
          className="animate-chat-in"
          style={{ fontSize: 13, lineHeight: 1.4, wordBreak: "break-all" }}
        >
          {m.tier && <TierBadge tier={m.tier} rank={m.rank} />}
          <span
            className="text-shadow-chat"
            style={{ fontWeight: 700, color: "#e0e0e0", marginRight: 4 }}
          >
            {m.nickname}
          </span>
          <span className="text-shadow-chat" style={{ color: "#ffffff" }}>
            {m.msg}
          </span>
        </div>
      ))}
      <div ref={bottomRef} />
    </div>
  );
}
