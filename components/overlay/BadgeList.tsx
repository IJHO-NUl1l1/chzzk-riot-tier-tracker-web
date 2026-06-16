import Image from "next/image";
import {
  TIER_COLORS,
  TIER_IMG_MAP,
  DIVISION_WEIGHT,
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
  rank: string | null;
}

interface Viewer {
  chzzkChannelName: string;
  entries: TierEntry[];
}

interface RankedViewer {
  viewer: Viewer;
  best: TierEntry;
  tierIdx: number;
}

// 1~3위 강조용 메달 컬러. 4위 이하는 흐린 회색 숫자로만 표시한다.
const MEDAL_COLORS = ["#ffd700", "#c9ccd1", "#d98a4f"];

interface BadgeListProps {
  viewers: Viewer[];
  /** 어떤 게임 데이터를 보여줄지 (URL의 ?game= 값). LoL/TFT를 한 화면에 섞으면
   *  같은 시청자라도 어느 게임 기준인지 헷갈려서, 게임별로 화면을 분리했다. */
  gameType?: GameType;
  /** 카드 최대 높이(px). 넘치는 시청자는 잘리지 않고 하단이 부드럽게 페이드된다. */
  maxHeight?: number;
}

export default function BadgeList({ viewers, gameType = DEFAULT_GAME_TYPE, maxHeight = 420 }: BadgeListProps) {
  const ranked: RankedViewer[] = viewers
    .map((viewer) => {
      const picked = pickBestEntryForGame(viewer.entries, gameType);
      return picked ? { viewer, best: picked.entry, tierIdx: picked.tierIdx } : null;
    })
    .filter((v): v is RankedViewer => v !== null)
    .sort((a, b) => {
      if (a.tierIdx !== b.tierIdx) return a.tierIdx - b.tierIdx;
      const aw = DIVISION_WEIGHT[a.best.rank ?? ""] ?? 0;
      const bw = DIVISION_WEIGHT[b.best.rank ?? ""] ?? 0;
      return bw - aw;
    });

  return (
    <div style={OVERLAY_CARD_STYLE}>
      <div className="flex items-center justify-between" style={{ marginBottom: 8 }}>
        <span
          className="text-xs font-bold"
          style={{ color: "#e4e4e7", letterSpacing: 0.2 }}
        >
          🏆 시청자 랭킹 ({gameLabel(gameType)})
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
          {ranked.length}명
        </span>
      </div>

      {ranked.length === 0 ? (
        <div className="text-sm" style={{ color: "rgba(255,255,255,0.3)", padding: "8px 2px" }}>
          시청자 없음
        </div>
      ) : (
        <div
          className="flex flex-col gap-1"
          style={{
            maxHeight,
            overflow: "hidden",
            WebkitMaskImage: "linear-gradient(to bottom, black calc(100% - 28px), transparent 100%)",
            maskImage: "linear-gradient(to bottom, black calc(100% - 28px), transparent 100%)",
          }}
        >
          {ranked.map(({ viewer, best }, i) => {
            const tier = best.tier.toUpperCase();
            const color = TIER_COLORS[tier];
            const imgName = TIER_IMG_MAP[tier];
            const medal = MEDAL_COLORS[i];

            return (
              <div
                key={viewer.chzzkChannelName}
                className="flex items-center gap-2"
                style={{
                  padding: "4px 8px",
                  borderRadius: 10,
                  background: tierRowBackground(tier),
                }}
              >
                <span
                  className="text-xs font-extrabold text-center"
                  style={{ width: 16, flexShrink: 0, color: medal ?? "rgba(255,255,255,0.35)" }}
                >
                  {i + 1}
                </span>

                {imgName && (
                  <Image
                    src={`/images/RankedEmblemsLatest/Rank=${imgName}.png`}
                    alt={tier}
                    width={22}
                    height={22}
                    style={{ flexShrink: 0, filter: `drop-shadow(0 0 4px ${color}90)` }}
                  />
                )}

                <span
                  className="text-sm font-bold truncate"
                  style={{ color: "#f1f1f3", flex: 1, minWidth: 0 }}
                  title={viewer.chzzkChannelName}
                >
                  {viewer.chzzkChannelName}
                </span>

                <span
                  className="text-xs font-extrabold whitespace-nowrap"
                  style={tierGradientTextStyle(tier)}
                >
                  {tier}
                  {best.rank ? ` ${best.rank}` : ""}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
