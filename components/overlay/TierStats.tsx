import Image from "next/image";
import OverlayCard from "./OverlayCard";
import {
  TIER_ORDER,
  TIER_COLORS,
  TIER_IMG_MAP,
  TIER_EMBLEM_SIZE,
  TIER_LABEL_STYLE,
  DEFAULT_GAME_TYPE,
  gameLabel,
  pickBestEntryForGame,
  tierGradientTextStyle,
  tierRowBackground,
  type GameType,
} from "./tierConstants";
import dedupeViewersByName from "./dedupe";

interface TierEntry {
  game_type: string;
  tier: string;
  rank?: string | null;
}

interface Viewer {
  chzzkChannelName: string;
  entries: TierEntry[];
}

interface TierStatsProps {
  viewers: Viewer[];
  /** 어떤 게임 데이터를 보여줄지 (URL의 ?game= 값). BadgeList와 동일하게
   *  LoL/TFT를 섞지 않고 게임별로 분리해서 집계한다. */
  gameType?: GameType;
}

export default function TierStats({ viewers, gameType = DEFAULT_GAME_TYPE }: TierStatsProps) {
  // 컴포넌트 레벨 방어: 입력 viewers 자체에 중복 시청자(같은 이름)가 있을 수
  // 있으므로 일단 이름 기준으로 dedupe한 뒤 집계한다.
  const deduped = dedupeViewersByName(viewers);

  const counts: Record<string, number> = {};
  for (const viewer of deduped) {
    const picked = pickBestEntryForGame(viewer.entries, gameType);
    if (!picked) continue;
    const t = (picked.entry.tier ?? "").toUpperCase();
    if (!t) continue;
    counts[t] = (counts[t] ?? 0) + 1;
  }

  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  const tiers = TIER_ORDER.filter((t) => counts[t]);

  return (
    <OverlayCard
      icon="📊"
      title={`티어 분포 (${gameLabel(gameType)})`}
      badge={`총 ${total}명`}
      emptyMessage={tiers.length === 0 ? "데이터 없음" : undefined}
    >
      <div className="flex flex-col gap-1 w-full">
        {tiers.map((tier) => {
          const count = counts[tier];
          const pct = total > 0 ? Math.round((count / total) * 100) : 0;
          const color = TIER_COLORS[tier];
          const imgName = TIER_IMG_MAP[tier];

          return (
            <div
              key={tier}
              className="flex items-center gap-2"
              style={{ padding: "4px 8px", borderRadius: 10, background: tierRowBackground(tier) }}
            >
              {imgName && (
                <Image
                  src={`/images/RankedEmblemsLatest/Rank=${imgName}.png`}
                  alt={tier}
                  width={TIER_EMBLEM_SIZE}
                  height={TIER_EMBLEM_SIZE}
                  style={{ flexShrink: 0, filter: `drop-shadow(0 0 4px ${color}90)` }}
                />
              )}

              <span style={{ ...TIER_LABEL_STYLE, ...tierGradientTextStyle(tier) }}>
                {tier}
              </span>

              <div className="flex-1 flex items-center gap-2" style={{ minWidth: 0, justifyContent: "flex-end" }}>
                <span
                  className="text-right"
                  style={{ width: 22, flexShrink: 0, fontSize: 13, fontWeight: 800, color }}
                >
                  {count}
                </span>
                <span className="text-xs w-9 text-right" style={{ color: "rgba(255,255,255,0.4)" }}>
                  {pct}%
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </OverlayCard>
  );
}
