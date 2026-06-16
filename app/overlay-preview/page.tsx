import BadgeList from "@/components/overlay/BadgeList";
import TierStats from "@/components/overlay/TierStats";

// 디자인 작업용 mock 데이터 — 실제 데이터 연결 없이 오버레이 컴포넌트만 확인.
// 마스터 이상은 디비전이 없어 rank: null, 14번 시청자는 LoL/TFT 두 데이터를
// 모두 갖고 있어 "대표 티어 선택"과 게임 태그 노출 조건을 확인할 수 있다.
const mockViewers = [
  { chzzkChannelName: "챌린저시청자", entries: [{ game_type: "lol", tier: "CHALLENGER", rank: null }] },
  { chzzkChannelName: "그랜드마스터유저", entries: [{ game_type: "lol", tier: "GRANDMASTER", rank: null }] },
  { chzzkChannelName: "마스터123", entries: [{ game_type: "lol", tier: "MASTER", rank: null }] },
  { chzzkChannelName: "다이아2찍었다", entries: [{ game_type: "lol", tier: "DIAMOND", rank: "II" }] },
  { chzzkChannelName: "다이아4유지중", entries: [{ game_type: "lol", tier: "DIAMOND", rank: "IV" }] },
  { chzzkChannelName: "에메랄드1", entries: [{ game_type: "lol", tier: "EMERALD", rank: "I" }] },
  { chzzkChannelName: "에메랄드3", entries: [{ game_type: "lol", tier: "EMERALD", rank: "III" }] },
  { chzzkChannelName: "플레2매칭중", entries: [{ game_type: "lol", tier: "PLATINUM", rank: "II" }] },
  { chzzkChannelName: "골드1탈출각", entries: [{ game_type: "lol", tier: "GOLD", rank: "I" }] },
  { chzzkChannelName: "골드3시청러", entries: [{ game_type: "lol", tier: "GOLD", rank: "III" }] },
  { chzzkChannelName: "골드2응원", entries: [{ game_type: "lol", tier: "GOLD", rank: "II" }] },
  { chzzkChannelName: "실버2탑", entries: [{ game_type: "lol", tier: "SILVER", rank: "II" }] },
  {
    chzzkChannelName: "본캐는TFT장인",
    entries: [
      { game_type: "lol", tier: "SILVER", rank: "III" },
      { game_type: "tft", tier: "GOLD", rank: "I" },
    ],
  },
  { chzzkChannelName: "브론즈4딜러", entries: [{ game_type: "lol", tier: "BRONZE", rank: "IV" }] },
  { chzzkChannelName: "플레4응원봉", entries: [{ game_type: "lol", tier: "PLATINUM", rank: "IV" }] },
  { chzzkChannelName: "아이언1탈출", entries: [{ game_type: "lol", tier: "IRON", rank: "I" }] },
  { chzzkChannelName: "TFT다이아3", entries: [{ game_type: "tft", tier: "DIAMOND", rank: "III" }] },
  { chzzkChannelName: "TFT실버2", entries: [{ game_type: "tft", tier: "SILVER", rank: "II" }] },
  {
    chzzkChannelName: "투잡유저",
    entries: [
      { game_type: "lol", tier: "GOLD", rank: "II" },
      { game_type: "tft", tier: "PLATINUM", rank: "I" },
    ],
  },
];

export default function OverlayPreviewPage() {
  return (
    <div
      className="p-6 flex flex-wrap items-start gap-6"
      style={{
        background: "#1a1a1a",
        minHeight: "100vh",
        fontFamily: "Pretendard, sans-serif",
      }}
    >
      <div>
        <p className="text-xs mb-2" style={{ color: "rgba(255,255,255,0.4)" }}>mode=list&amp;game=lol</p>
        <BadgeList viewers={mockViewers} gameType="lol" />
      </div>
      <div>
        <p className="text-xs mb-2" style={{ color: "rgba(255,255,255,0.4)" }}>mode=stats&amp;game=lol</p>
        <TierStats viewers={mockViewers} gameType="lol" />
      </div>
      <div>
        <p className="text-xs mb-2" style={{ color: "rgba(255,255,255,0.4)" }}>mode=list&amp;game=tft</p>
        <BadgeList viewers={mockViewers} gameType="tft" />
      </div>
      <div>
        <p className="text-xs mb-2" style={{ color: "rgba(255,255,255,0.4)" }}>mode=stats&amp;game=tft</p>
        <TierStats viewers={mockViewers} gameType="tft" />
      </div>
    </div>
  );
}
