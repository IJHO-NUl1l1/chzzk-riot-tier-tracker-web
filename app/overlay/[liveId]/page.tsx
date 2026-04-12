"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import BadgeList from "@/components/overlay/BadgeList";
import TierStats from "@/components/overlay/TierStats";

const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL!;

interface TierEntry {
  game_type: string;
  tier: string;
  rank: string | null;
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
        const names = Object.values(state)
          .flat()
          .map((p) => p.chzzkChannelName)
          .filter(Boolean);
        console.log("[Overlay] names:", names);
        fetchViewers(names);
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

        setViewers((prev) => {
          const existing = prev.find((v) => v.chzzkChannelName === chzzkChannelName);
          if (!existing) return prev; // not in presence — ignore

          const updatedEntries = existing.entries.filter((e) => e.game_type !== gameType);
          if (isPublic !== false && tier) {
            updatedEntries.push({ game_type: gameType, tier, rank: rank ?? null });
          }

          if (updatedEntries.length === 0) {
            return prev.filter((v) => v.chzzkChannelName !== chzzkChannelName);
          }
          return prev.map((v) =>
            v.chzzkChannelName === chzzkChannelName ? { ...v, entries: updatedEntries } : v
          );
        });
      })
      .on("broadcast", { event: "tier_deleted" }, ({ payload }) => {
        const { chzzkChannelName, gameType } = payload as {
          chzzkChannelName: string;
          gameType: string | null;
        };
        if (!chzzkChannelName) return;

        setViewers((prev) =>
          prev
            .map((v) => {
              if (v.chzzkChannelName !== chzzkChannelName) return v;
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

        setViewers((prev) =>
          prev
            .map((v) => {
              if (v.chzzkChannelName !== chzzkChannelName) return v;
              const updatedEntries = v.entries
                .map((e) =>
                  !gameType || e.game_type === gameType ? { ...e, is_public: isPublic } : e
                )
                .filter((e) => e.is_public !== false);
              return { ...v, entries: updatedEntries };
            })
            .filter((v) => v.entries.length > 0)
        );
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
        minHeight: "100vh",
        fontFamily: "Pretendard, sans-serif",
      }}
    >
      {mode === "list" && <BadgeList viewers={viewers} />}
      {mode === "stats" && <TierStats viewers={viewers} />}
    </div>
  );
}
