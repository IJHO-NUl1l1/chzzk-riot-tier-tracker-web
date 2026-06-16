import Image from "next/image";
import {
  TIER_ORDER,
  TIER_COLORS,
  TIER_IMG_MAP,
  OVERLAY_CARD_STYLE,
  DEFAULT_GAME_TYPE,
  gameLabel,
  pickBestEntryForGame,
  tierGradientTextStyle,
  tierRowBackground,
  type GameType,
} from "./tierConstants";

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
  // 티어별 카운트 집계. BadgeList의 랭킹과 동일한 기준(같은 게임 안에서 가장
  // 높은 티어/디비전)으로 한 명당 하나씩만 센다.
  const counts: Record<string, number> = {};
  for (const viewer of viewers) {
    const picked = pickBestEntryForGame(viewer.entries, gameType);
    if (!picked) continue;
    const t = picked.entry.tier.toUpperCase();
    counts[t] = (counts[t] ?? 0) + 1;
  }

  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  const tiers = TIER_ORDER.filter((t) => counts[t]);

  if (tiers.length === 0) {
    return (
      <div style={OVERLAY_CARD_STYLE}>
        <div className="text-xs font-bold" style={{ color: "#e4e4e7", marginBottom: 8 }}>
          📊 티어 분포 ({gameLabel(gameType)})
        </div>
        <div className="text-sm" style={{ color: "rgba(255,255,255,0.3)" }}>
          데이터 없음
        </div>
      </div>
    );
  }

  const max = Math.max(...tiers.map((t) => counts[t]));
  const modeTier = tiers.reduce((a, b) => (counts[a] >= counts[b] ? a : b));

  return (
    <div style={OVERLAY_CARD_STYLE}>
      <div className="flex items-center justify-between" style={{ marginBottom: 8 }}>
        <span className="text-xs font-bold" style={{ color: "#e4e4e7", letterSpacing: 0.2 }}>
          📊 티어 분포 ({gameLabel(gameType)})
        </span>
        <span
          className="text-xs font-bold"
          style={{
            color: "rgba(255,255,255,0.5)",
            background: "rgba(255,255,255,0.08)",
            borderRadius: 999,
            padding: "1px 8px",
          }}
        >
          총 {total}명
        </span>
      </div>

      <div className="flex flex-col gap-1.5 w-full">
        {tiers.map((tier) => {
          const count = counts[tier];
          const pct = total > 0 ? Math.round((count / total) * 100) : 0;
          const barWidth = max > 0 ? (count / max) * 100 : 0;
          const color = TIER_COLORS[tier];
          const imgName = TIER_IMG_MAP[tier];
          const isMode = tier === modeTier && tiers.length > 1;

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
                  width={20}
                  height={20}
                  style={{
                    flexShrink: 0,
                    filter: isMode ? `drop-shadow(0 0 5px ${color}b0)` : `drop-shadow(0 0 2px ${color}50)`,
                  }}
                />
              )}

              <span
                className="font-extrabold whitespace-nowrap overflow-hidden"
                style={{
                  width: 86,
                  flexShrink: 0,
                  fontSize: 11,
                  textOverflow: "ellipsis",
                  ...tierGradientTextStyle(tier),
                }}
              >
                {tier}
              </span>

              <div className="flex-1 flex items-center gap-2" style={{ minWidth: 0 }}>
                <div
                  className="flex-1 rounded-full overflow-hidden"
                  style={{ background: "rgba(255,255,255,0.08)", height: 6 }}
                >
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${barWidth}%`,
                      background: color,
                      boxShadow: isMode ? `0 0 8px ${color}b0` : `0 0 4px ${color}60`,
                    }}
                  />
                </div>
                <span className="text-xs font-bold w-6 text-right" style={{ color }}>
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
    </div>
  );
}
