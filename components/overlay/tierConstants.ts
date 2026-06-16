import type { CSSProperties } from "react";

// BadgeList, TierStats가 공통으로 쓰는 티어 상수/유틸.
// 두 컴포넌트가 "시청자의 대표 티어"를 서로 다르게 정의하면 랭킹과 분포 통계가
// 어긋나 보일 수 있어 선정 로직(pickBestEntry)까지 여기서 함께 관리한다.

export const TIER_ORDER = [
  "CHALLENGER", "GRANDMASTER", "MASTER",
  "DIAMOND", "EMERALD", "PLATINUM",
  "GOLD", "SILVER", "BRONZE", "IRON",
];

export const TIER_COLORS: Record<string, string> = {
  CHALLENGER: "#f4c873", GRANDMASTER: "#ef4444", MASTER: "#9d4dc3",
  DIAMOND: "#576ace", EMERALD: "#3eb489", PLATINUM: "#4fccc6",
  GOLD: "#f1a64d", SILVER: "#7e8183", BRONZE: "#b97451", IRON: "#72767d",
};

export const TIER_IMG_MAP: Record<string, string> = {
  IRON: "Iron", BRONZE: "Bronze", SILVER: "Silver", GOLD: "Gold",
  PLATINUM: "Platinum", EMERALD: "Emerald", DIAMOND: "Diamond",
  MASTER: "Master", GRANDMASTER: "Grandmaster", CHALLENGER: "Challenger",
};

// 티어 이름 텍스트에 쓰는 그라데이션(밝은 톤 → 티어 기본색). 시청자 랭킹
// (BadgeList)의 룩을 기준 디자인으로 잡고 TierStats도 동일하게 맞췄다.
export const TIER_GRADIENTS: Record<string, [string, string]> = {
  CHALLENGER: ["#fff6d8", "#f4c873"],
  GRANDMASTER: ["#ff9a9a", "#ef4444"],
  MASTER: ["#e0b3ff", "#9d4dc3"],
  DIAMOND: ["#aac0ff", "#576ace"],
  EMERALD: ["#8ff5cd", "#3eb489"],
  PLATINUM: ["#bdfbf7", "#4fccc6"],
  GOLD: ["#ffdfa3", "#f1a64d"],
  SILVER: ["#dcdee1", "#7e8183"],
  BRONZE: ["#edbd97", "#b97451"],
  IRON: ["#bfc2c5", "#72767d"],
};

/** 티어 이름을 해당 티어 색 그라데이션 텍스트로 렌더링하기 위한 style. */
export function tierGradientTextStyle(tier: string): CSSProperties {
  const [from, to] = TIER_GRADIENTS[tier] ?? [TIER_COLORS[tier], TIER_COLORS[tier]];
  return {
    backgroundImage: `linear-gradient(90deg, ${from}, ${to})`,
    WebkitBackgroundClip: "text",
    backgroundClip: "text",
    color: "transparent",
    WebkitTextFillColor: "transparent",
  };
}

/** 시청자 랭킹(BadgeList)에서 쓰던 "티어색 그라데이션 배경" 행 스타일을
 *  TierStats와 공유한다. */
export function tierRowBackground(tier: string): string {
  const color = TIER_COLORS[tier];
  return `linear-gradient(90deg, ${color}1f, transparent 70%)`;
}

export const GAME_LABEL: Record<string, string> = { lol: "LoL", tft: "TFT" };

export type GameType = "lol" | "tft";

export const DEFAULT_GAME_TYPE: GameType = "lol";

export function gameLabel(gameType: string): string {
  return GAME_LABEL[gameType] ?? gameType.toUpperCase();
}

// 디비전(I~IV) 비교용 가중치 — 숫자가 클수록 상위 디비전. 마스터 이상은 디비전이
// 없으므로 rank가 없거나 매핑에 없으면 0으로 취급한다.
export const DIVISION_WEIGHT: Record<string, number> = { I: 4, II: 3, III: 2, IV: 1 };

export interface RankableEntry {
  tier: string;
  rank?: string | null;
}

/**
 * 한 시청자가 여러 게임/큐 데이터를 갖고 있을 때, 가장 높은 티어(동률이면
 * 더 높은 디비전) 하나를 대표 entry로 고른다. 모든 entry를 다 보여주면
 * 줄이 길어지고 정렬 기준도 모호해지므로 "대표 티어" 하나만 노출하기로
 * 결정했고, 랭킹(BadgeList)과 분포(TierStats)가 같은 기준을 쓰도록 통일.
 */
export function pickBestEntry<T extends RankableEntry>(
  entries: T[]
): { entry: T; tierIdx: number } | null {
  let best: T | null = null;
  let bestIdx = Infinity;

  for (const e of entries) {
    if (!e.tier) continue;
    const idx = TIER_ORDER.indexOf(e.tier.toUpperCase());
    if (idx === -1) continue;

    const isBetter =
      idx < bestIdx ||
      (idx === bestIdx &&
        best !== null &&
        (DIVISION_WEIGHT[e.rank ?? ""] ?? 0) > (DIVISION_WEIGHT[best.rank ?? ""] ?? 0));

    if (isBetter) {
      best = e;
      bestIdx = idx;
    }
  }

  return best ? { entry: best, tierIdx: bestIdx } : null;
}

export interface GameRankableEntry extends RankableEntry {
  game_type: string;
}

/**
 * LoL/TFT를 한 화면에 섞지 않고 URL의 game 파라미터로 분리해서 보여주기로
 * 했기 때문에, 표시할 게임에 해당하는 entry만 걸러낸 뒤 그 안에서 대표
 * entry(최고 티어/디비전)를 고른다.
 */
export function pickBestEntryForGame<T extends GameRankableEntry>(
  entries: T[],
  gameType: string
): { entry: T; tierIdx: number } | null {
  return pickBestEntry(entries.filter((e) => e.game_type === gameType));
}

// 두 컴포넌트가 공유하는 "글래스 카드" 셸 스타일. 시청자 랭킹/티어 분포가
// 서로 다른 크기로 보이지 않도록 width를 고정값으로 둔다(fit-content면
// 내용에 따라 카드 폭이 서로 달라진다).
export const OVERLAY_CARD_STYLE: CSSProperties = {
  background: "rgba(18,18,22,0.55)",
  backdropFilter: "blur(10px)",
  WebkitBackdropFilter: "blur(10px)",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 16,
  padding: "10px 12px",
  boxShadow: "0 4px 24px rgba(0,0,0,0.35)",
  width: 300,
};

// 행 안에서 엠블럼 크기도 두 컴포넌트가 동일하게 쓴다.
export const TIER_EMBLEM_SIZE = 22;

/**
 * 티어 이름 텍스트의 레이아웃(폭/폰트 크기/말줄임)을 두 컴포넌트가 공유한다.
 * 그라데이션 색만 tierGradientTextStyle로 따로 입힌다. 폭은 "PLATINUM III"
 * 처럼 가장 긴 티어+디비전 조합도 잘리지 않도록 여유 있게 잡았다.
 */
export const TIER_LABEL_STYLE: CSSProperties = {
  width: 104,
  flexShrink: 0,
  fontSize: 13,
  fontWeight: 800,
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
};

