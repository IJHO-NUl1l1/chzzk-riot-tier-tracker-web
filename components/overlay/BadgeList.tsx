import Image from "next/image";

interface TierEntry {
  game_type: string;
  tier: string;
  rank: string | null;
}

interface Viewer {
  chzzkChannelName: string;
  entries: TierEntry[];
}

const TIER_IMG_MAP: Record<string, string> = {
  IRON: "Iron", BRONZE: "Bronze", SILVER: "Silver", GOLD: "Gold",
  PLATINUM: "Platinum", EMERALD: "Emerald", DIAMOND: "Diamond",
  MASTER: "Master", GRANDMASTER: "Grandmaster", CHALLENGER: "Challenger",
};

interface BadgeListProps {
  viewers: Viewer[];
}

export default function BadgeList({ viewers }: BadgeListProps) {
  if (viewers.length === 0) {
    return (
      <div className="text-sm" style={{ color: "rgba(255,255,255,0.3)" }}>
        시청자 없음
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1.5">
      {viewers.map((viewer) => (
        <div key={viewer.chzzkChannelName} className="flex items-center gap-1.5">
          {viewer.entries.map((entry) => {
            const imgName = TIER_IMG_MAP[entry.tier.toUpperCase()];
            if (!imgName) return null;
            return (
              <Image
                key={entry.game_type}
                src={`/images/RankedEmblemsLatest/Rank=${imgName}.png`}
                alt={entry.tier}
                width={20}
                height={20}
                style={{ display: "inline", verticalAlign: "middle" }}
              />
            );
          })}
          <span className="text-sm font-bold" style={{ color: "#e4e4e7" }}>
            {viewer.chzzkChannelName}
          </span>
        </div>
      ))}
    </div>
  );
}
