import BadgeList from "@/components/overlay/BadgeList";
import TierStats from "@/components/overlay/TierStats";

// 디자인 작업용 mock 데이터 — 실제 데이터 연결 없이 오버레이 컴포넌트만 확인.
// 마스터 이상은 디비전이 없어 rank: null, lp는 BadgeList의 "티어+LP" 표시와
// 동일 티어/디비전 내 정렬을 확인하기 위한 값. 14번 시청자는 LoL/TFT 두
// 데이터를 모두 갖고 있어 "대표 티어 선택" 로직을 확인할 수 있다.
const mockViewers = [
  { chzzkChannelName: "챌린저시청자", entries: [{ game_type: "lol", tier: "CHALLENGER", rank: null, lp: 1320 }] },
  { chzzkChannelName: "그랜드마스터유저", entries: [{ game_type: "lol", tier: "GRANDMASTER", rank: null, lp: 540 }] },
  { chzzkChannelName: "마스터123", entries: [{ game_type: "lol", tier: "MASTER", rank: null, lp: 210 }] },
  { chzzkChannelName: "다이아2찍었다", entries: [{ game_type: "lol", tier: "DIAMOND", rank: "II", lp: 45 }] },
  { chzzkChannelName: "다이아4유지중", entries: [{ game_type: "lol", tier: "DIAMOND", rank: "IV", lp: 12 }] },
  { chzzkChannelName: "에메랄드1", entries: [{ game_type: "lol", tier: "EMERALD", rank: "I", lp: 88 }] },
  { chzzkChannelName: "에메랄드3", entries: [{ game_type: "lol", tier: "EMERALD", rank: "III", lp: 20 }] },
  { chzzkChannelName: "플레2매칭중", entries: [{ game_type: "lol", tier: "PLATINUM", rank: "II", lp: 55 }] },
  { chzzkChannelName: "골드1탈출각", entries: [{ game_type: "lol", tier: "GOLD", rank: "I", lp: 90 }] },
  { chzzkChannelName: "골드3시청러", entries: [{ game_type: "lol", tier: "GOLD", rank: "III", lp: 30 }] },
  { chzzkChannelName: "골드2응원", entries: [{ game_type: "lol", tier: "GOLD", rank: "II", lp: 60 }] },
  { chzzkChannelName: "실버2탑", entries: [{ game_type: "lol", tier: "SILVER", rank: "II", lp: 40 }] },
  {
    chzzkChannelName: "본캐는TFT장인",
    entries: [
      { game_type: "lol", tier: "SILVER", rank: "III", lp: 15 },
      { game_type: "tft", tier: "GOLD", rank: "I", lp: 75 },
    ],
  },
  { chzzkChannelName: "브론즈4딜러", entries: [{ game_type: "lol", tier: "BRONZE", rank: "IV", lp: 5 }] },
  { chzzkChannelName: "플레4응원봉", entries: [{ game_type: "lol", tier: "PLATINUM", rank: "IV", lp: 10 }] },
  { chzzkChannelName: "아이언1탈출", entries: [{ game_type: "lol", tier: "IRON", rank: "I", lp: 0 }] },
  { chzzkChannelName: "TFT다이아3", entries: [{ game_type: "tft", tier: "DIAMOND", rank: "III", lp: 25 }] },
  { chzzkChannelName: "TFT실버2", entries: [{ game_type: "tft", tier: "SILVER", rank: "II", lp: 50 }] },
  {
    chzzkChannelName: "투잡유저",
    entries: [
      { game_type: "lol", tier: "GOLD", rank: "II", lp: 20 },
      { game_type: "tft", tier: "PLATINUM", rank: "I", lp: 95 },
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
