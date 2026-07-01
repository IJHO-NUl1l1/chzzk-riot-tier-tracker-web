import Image from "next/image";
import OverlayCard from "./OverlayCard";
import OdometerNumber from "./OdometerNumber";
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
  gameType?: GameType;
}

export default function TierStats({ viewers, gameType = DEFAULT_GAME_TYPE }: TierStatsProps) {
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
      badge={<>총 <OdometerNumber value={total} />명</>}
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
                  loading="eager"
                  style={{ flexShrink: 0, filter: `drop-shadow(0 0 4px ${color}90)` }}
                />
              )}

              <span style={{ ...TIER_LABEL_STYLE, ...tierGradientTextStyle(tier) }}>
                {tier}
              </span>

              <div className="flex-1 flex items-center gap-2" style={{ minWidth: 0, justifyContent: "flex-end" }}>
                <OdometerNumber
                  value={count}
                  style={{ width: 22, flexShrink: 0, fontSize: 13, fontWeight: 800, color, justifyContent: "flex-end" }}
                />
                {/* percentage: fade crossfade via key remount (subtle, lets count be the focus) */}
                <span
                  key={pct}
                  className="text-xs w-9 text-right"
                  style={{ color: "rgba(255,255,255,0.4)", animation: "odometer-in 250ms ease-out both" }}
                >
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
