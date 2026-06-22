import Image from "next/image";
import OverlayCard from "./OverlayCard";
import {
  TIER_COLORS,
  TIER_IMG_MAP,
  TIER_EMBLEM_SIZE,
  TIER_LABEL_STYLE,
  DIVISION_WEIGHT,
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
  rank: string | null;
  league_points?: number;
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

// 너무 많은 시청자를 다 보여주면 화면이 길어지니, 랭킹은 상위 10명까지만
// 깔끔하게 보여주고 끝낸다(페이드 효과 없이 딱 잘림).
const TOP_N = 10;

interface BadgeListProps {
  viewers: Viewer[];
  /** 어떤 게임 데이터를 보여줄지 (URL의 ?game= 값). LoL/TFT를 한 화면에 섞으면
   *  같은 시청자라도 어느 게임 기준인지 헷갈려서, 게임별로 화면을 분리했다. */
  gameType?: GameType;
}

export default function BadgeList({ viewers, gameType = DEFAULT_GAME_TYPE }: BadgeListProps) {
  const safeViewers = dedupeViewersByName(viewers);

  const ranked: RankedViewer[] = safeViewers
    .map((viewer) => {
      const picked = pickBestEntryForGame(viewer.entries, gameType);
      return picked ? { viewer, best: picked.entry, tierIdx: picked.tierIdx } : null;
    })
    .filter((v): v is RankedViewer => v !== null)
    .sort((a, b) => {
      if (a.tierIdx !== b.tierIdx) return a.tierIdx - b.tierIdx;
      const aw = DIVISION_WEIGHT[a.best.rank ?? ""] ?? 0;
      const bw = DIVISION_WEIGHT[b.best.rank ?? ""] ?? 0;
      if (aw !== bw) return bw - aw;
      return (b.best.league_points ?? 0) - (a.best.league_points ?? 0);
    });

  const displayed = ranked.slice(0, TOP_N);

  return (
    <OverlayCard
      icon="🏆"
      title={`시청자 랭킹 (${gameLabel(gameType)})`}
      badge={`총 ${ranked.length}명`}
      emptyMessage={ranked.length === 0 ? "시청자 없음" : undefined}
    >
      <div className="flex flex-col gap-1">
        {displayed.map(({ viewer, best }, i) => {
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
                  width={TIER_EMBLEM_SIZE}
                  height={TIER_EMBLEM_SIZE}
                  style={{ flexShrink: 0, filter: `drop-shadow(0 0 4px ${color}90)` }}
                />
              )}

              <span style={{ ...TIER_LABEL_STYLE, ...tierGradientTextStyle(tier) }}>
                {tier}
                {best.rank ? ` ${best.rank}` : ""}
              </span>

              {typeof best.league_points === "number" && (
                <span style={{ marginLeft: "auto", fontSize: 13, fontWeight: 800, color: "#ffffff" }}>
                  {best.league_points}LP
                </span>
              )}
            </div>
          );
        })}
      </div>
    </OverlayCard>
  );
}
