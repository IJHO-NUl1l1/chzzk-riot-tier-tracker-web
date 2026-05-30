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
const STORAGE_PREFIX = "tier_cache:";
const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL!;

// 메모리 레이어 (같은 탭 내 중복 파싱 방지)
const memCache = new Map<string, CacheEntry>();

function readCache(nickname: string): CacheEntry | null {
  const mem = memCache.get(nickname);
  if (mem) return mem;
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + nickname);
    if (!raw) return null;
    const entry: CacheEntry = JSON.parse(raw);
    memCache.set(nickname, entry);
    return entry;
  } catch {
    return null;
  }
}

function writeCache(nickname: string, entry: CacheEntry) {
  memCache.set(nickname, entry);
  try {
    localStorage.setItem(STORAGE_PREFIX + nickname, JSON.stringify(entry));
  } catch {
    // localStorage 용량 초과 시 무시
  }
}

export function useTierCache() {
  const pending = useRef<Set<string>>(new Set());

  const getTier = useCallback(
    async (nickname: string): Promise<TierEntry[]> => {
      const now = Date.now();
      const cached = readCache(nickname);
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
        writeCache(nickname, { entries, fetchedAt: Date.now() });
        return entries;
      } catch {
        writeCache(nickname, { entries: [], fetchedAt: Date.now() });
        return [];
      } finally {
        pending.current.delete(nickname);
      }
    },
    []
  );

  return { getTier };
}
