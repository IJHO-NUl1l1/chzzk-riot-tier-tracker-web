import Image from "next/image";

interface TierEntry {
  tier: string;
}

interface Viewer {
  chzzkChannelName: string;
  entries: TierEntry[];
}

const TIER_ORDER = [
  "CHALLENGER", "GRANDMASTER", "MASTER",
  "DIAMOND", "EMERALD", "PLATINUM",
  "GOLD", "SILVER", "BRONZE", "IRON",
];

const TIER_COLORS: Record<string, string> = {
  CHALLENGER: "#f4c873", GRANDMASTER: "#ef4444", MASTER: "#9d4dc3",
  DIAMOND: "#576ace", EMERALD: "#3eb489", PLATINUM: "#4fccc6",
  GOLD: "#f1a64d", SILVER: "#7e8183", BRONZE: "#b97451", IRON: "#72767d",
};

const TIER_IMG_MAP: Record<string, string> = {
  IRON: "Iron", BRONZE: "Bronze", SILVER: "Silver", GOLD: "Gold",
  PLATINUM: "Platinum", EMERALD: "Emerald", DIAMOND: "Diamond",
  MASTER: "Master", GRANDMASTER: "Grandmaster", CHALLENGER: "Challenger",
};

interface TierStatsProps {
  viewers: Viewer[];
}

export default function TierStats({ viewers }: TierStatsProps) {
  // 티어별 카운트 집계 (LoL 기준, 없으면 TFT)
  const counts: Record<string, number> = {};
  for (const viewer of viewers) {
    const entry = viewer.entries.find((e) => e.tier);
    if (!entry) continue;
    const t = entry.tier.toUpperCase();
    counts[t] = (counts[t] ?? 0) + 1;
  }

  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  const tiers = TIER_ORDER.filter((t) => counts[t]);

  if (tiers.length === 0) {
    return (
      <div className="text-sm" style={{ color: "rgba(255,255,255,0.3)" }}>
        데이터 없음
      </div>
    );
  }

  const max = Math.max(...tiers.map((t) => counts[t]));

  return (
    <div className="flex flex-col gap-2 w-full">
      {tiers.map((tier) => {
        const count = counts[tier];
        const pct = total > 0 ? Math.round((count / total) * 100) : 0;
        const barWidth = max > 0 ? (count / max) * 100 : 0;
        const color = TIER_COLORS[tier];
        const imgName = TIER_IMG_MAP[tier];

        return (
          <div key={tier} className="flex items-center gap-2">
            {imgName && (
              <Image
                src={`/images/RankedEmblemsLatest/Rank=${imgName}.png`}
                alt={tier}
                width={20}
                height={20}
                style={{ flexShrink: 0 }}
              />
            )}
            <div className="flex-1 flex items-center gap-2">
              <div className="flex-1 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.08)", height: 6 }}>
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${barWidth}%`, background: color, boxShadow: `0 0 6px ${color}80` }}
                />
              </div>
              <span className="text-xs font-bold w-6 text-right" style={{ color }}>{count}</span>
              <span className="text-xs w-8 text-right" style={{ color: "rgba(255,255,255,0.4)" }}>{pct}%</span>
            </div>
          </div>
        );
      })}
      <div className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.3)" }}>
        총 {total}명
      </div>
    </div>
  );
}
