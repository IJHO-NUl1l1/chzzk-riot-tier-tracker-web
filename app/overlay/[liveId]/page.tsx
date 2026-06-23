"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import BadgeList from "@/components/overlay/BadgeList";
import TierStats from "@/components/overlay/TierStats";
import { DEFAULT_GAME_TYPE, type GameType } from "@/components/overlay/tierConstants";

const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL!;

interface TierEntry {
  game_type: string;
  tier: string;
  rank: string | null;
  lp?: number;
  is_public?: boolean;
}

interface Viewer {
  chzzkChannelName: string;
  entries: TierEntry[];
}

export default function OverlayPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const liveId = params.liveId as string;
  const mode = searchParams.get("mode") ?? "list";
  // ?game=lol|tft 가 아니면 기본값(LoL)으로 둔다 — 잘못된 값이 들어와도
  // 화면이 깨지지 않도록 명시적으로 검증한다.
  const gameType: GameType = searchParams.get("game") === "tft" ? "tft" : DEFAULT_GAME_TYPE;

  const [viewers, setViewers] = useState<Viewer[]>([]);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  useEffect(() => {
    if (!liveId) return;

    const channel = supabase.channel(`tier_updates:${liveId}`);
    channelRef.current = channel;

    async function fetchViewers(names: string[]) {
      if (names.length === 0) { setViewers([]); return; }

      const results = await Promise.allSettled(
        names.map(async (name) => {
          const res = await fetch(`${SERVER_URL}/api/tier?chzzk_name=${encodeURIComponent(name)}`);
          if (!res.ok) return null;
          const json = await res.json();
          const entries: TierEntry[] = json.entries ?? [];
          if (entries.length === 0) return null;
          return { chzzkChannelName: name, entries } as Viewer;
        })
      );

      const viewers = results
        .filter((r): r is PromiseFulfilledResult<Viewer> => r.status === "fulfilled" && r.value !== null)
        .map((r) => r.value);

      setViewers(viewers);
    }

    channel
      .on("presence", { event: "sync" }, () => {
        const state = channel.presenceState<{ chzzkChannelName: string }>();
        console.log("[Overlay] presence sync, state:", state);
        const raw = Object.values(state)
          .flat()
          .map((p) => p.chzzkChannelName?.trim())
          .filter(Boolean) as string[];
        console.log("[Overlay] raw names:", raw);
        const seen = new Set<string>();
        const uniqueNames: string[] = [];
        for (const n of raw) {
          const key = n.toLowerCase();
          if (!seen.has(key)) {
            seen.add(key);
            uniqueNames.push(n);
          }
        }
        console.log("[Overlay] unique names:", uniqueNames);
        fetchViewers(uniqueNames);
      })
      .on("presence", { event: "join" }, ({ key, newPresences }) => {
        console.log("[Overlay] presence join:", key, newPresences);
      })
      .on("presence", { event: "leave" }, ({ key, leftPresences }) => {
        console.log("[Overlay] presence leave:", key, leftPresences);
      })
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
        setViewers((prev) => {
          const existing = prev.find((v) => v.chzzkChannelName?.toLowerCase() === key);
          if (!existing) return prev; // not in presence — ignore

          const updatedEntries = existing.entries.filter((e) => e.game_type !== gameType);
          if (isPublic !== false && tier) {
            updatedEntries.push({ game_type: gameType, tier, rank: rank ?? null });
          }

          if (updatedEntries.length === 0) {
            return prev.filter((v) => v.chzzkChannelName?.toLowerCase() !== key);
          }
          return prev.map((v) =>
            v.chzzkChannelName?.toLowerCase() === key ? { ...v, entries: updatedEntries } : v
          );
        });
      })
      .on("broadcast", { event: "tier_deleted" }, ({ payload }) => {
        const { chzzkChannelName, gameType } = payload as {
          chzzkChannelName: string;
          gameType: string | null;
        };
        if (!chzzkChannelName) return;
        const key = chzzkChannelName.toLowerCase();

        setViewers((prev) =>
          prev
            .map((v) => {
              if (v.chzzkChannelName?.toLowerCase() !== key) return v;
              return {
                ...v,
                entries: gameType
                  ? v.entries.filter((e) => e.game_type !== gameType)
                  : [],
              };
            })
            .filter((v) => v.entries.length > 0)
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

        // Update existing viewer entries if present (set is_public / remove hidden entries)
        setViewers((prev) =>
          prev
            .map((v) => {
              if (v.chzzkChannelName?.toLowerCase() !== key) return v;
              const updatedEntries = v.entries
                .map((e) =>
                  !gameType || e.game_type === gameType ? { ...e, is_public: isPublic } : e
                )
                .filter((e) => e.is_public !== false);
              return { ...v, entries: updatedEntries };
            })
            .filter((v) => v.entries.length > 0)
        );

        // If it was changed to public but the viewer isn't currently in state (was removed when set to private),
        // fetch the viewer entries and add them back.
        if (isPublic) {
          (async () => {
            try {
              const res = await fetch(
                `${SERVER_URL}/api/tier?chzzk_name=${encodeURIComponent(chzzkChannelName)}`
              );
              if (!res.ok) return;
              const json = await res.json();
              const entries: TierEntry[] = (json.entries ?? []).filter(
                (e: TierEntry) => e.is_public !== false
              );
              if (!entries || entries.length === 0) return;

              setViewers((prev) => {
                const exists = prev.some((v) => v.chzzkChannelName?.toLowerCase() === key);
                if (exists) {
                  // Merge/replace entries for the given gameType
                  return prev.map((v) =>
                    v.chzzkChannelName?.toLowerCase() === key
                      ? { ...v, entries: [...v.entries.filter((e) => e.game_type !== gameType), ...entries] }
                      : v
                  );
                }
                return [...prev, { chzzkChannelName, entries }];
              });
            } catch (err) {
              console.error('[Overlay] failed to fetch entries for privacy_changed add:', err);
            }
          })();
        }
      })
      .subscribe((status) => {
        console.log("[Overlay] channel status:", status);
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [liveId]);

  return (
    <div
      className="p-3"
      style={{
        background: "transparent",
        width: "fit-content",
        fontFamily: "Pretendard, sans-serif",
      }}
    >
      {mode === "list" && <BadgeList viewers={viewers} gameType={gameType} />}
      {mode === "stats" && <TierStats viewers={viewers} gameType={gameType} />}
    </div>
  );
}
