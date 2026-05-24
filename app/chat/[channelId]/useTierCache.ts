"use client";

import { useRef, useCallback } from "react";

export interface TierEntry {
  game_type: string;
  tier: string;
  rank: string | null;
  lp?: number;
  is_public?: boolean;
}

interface CacheEntry {
  entries: TierEntry[];
  fetchedAt: number;
}

const TTL_MS = 5 * 60 * 1000;
const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL!;

export function useTierCache() {
  const cache = useRef<Map<string, CacheEntry>>(new Map());
  const pending = useRef<Set<string>>(new Set());

  const getTier = useCallback(
    async (nickname: string): Promise<TierEntry[]> => {
      const now = Date.now();
      const cached = cache.current.get(nickname);
      if (cached && now - cached.fetchedAt < TTL_MS) return cached.entries;
      if (pending.current.has(nickname)) return cached?.entries ?? [];

      pending.current.add(nickname);
      try {
        const res = await fetch(
          `${SERVER_URL}/api/tier?chzzk_name=${encodeURIComponent(nickname)}`
        );
        if (!res.ok) throw new Error("fetch failed");
        const json = await res.json();
        const entries: TierEntry[] = (json.entries ?? []).filter(
          (e: TierEntry) => e.is_public !== false
        );
        cache.current.set(nickname, { entries, fetchedAt: Date.now() });
        return entries;
      } catch {
        cache.current.set(nickname, { entries: [], fetchedAt: Date.now() });
        return [];
      } finally {
        pending.current.delete(nickname);
      }
    },
    []
  );

  return { getTier };
}
