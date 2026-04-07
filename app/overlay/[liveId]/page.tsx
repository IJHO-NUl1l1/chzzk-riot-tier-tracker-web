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
