// BadgeList / TierStats용 mock 시청자 데이터 — /overlay-preview(디자인 검토용)와
// /demo(마케팅 스크롤 데모)가 같은 데이터를 공유한다. 둘이 따로 mock을 들고
//있으면 디자인을 바꿀 때마다 두 군데를 맞춰야 해서, 한 곳에서만 관리한다.
//
// 마스터 이상은 디비전이 없어 rank: null, lp는 BadgeList의 "티어+LP" 표시와
// 동일 티어/디비전 내 정렬을 확인하기 위한 값. "본캐는TFT장인"/"투잡유저"는
// LoL/TFT 두 데이터를 모두 갖고 있어 "대표 티어 선택" 로직을 확인할 수 있다.
export const MOCK_OVERLAY_VIEWERS = [
  { chzzkChannelName: "챌린저시청자", entries: [{ game_type: "lol", tier: "CHALLENGER", rank: null, league_points:1320 }] },
  { chzzkChannelName: "그랜드마스터유저", entries: [{ game_type: "lol", tier: "GRANDMASTER", rank: null, league_points:540 }] },
  { chzzkChannelName: "마스터123", entries: [{ game_type: "lol", tier: "MASTER", rank: null, league_points:210 }] },
  { chzzkChannelName: "다이아2찍었다", entries: [{ game_type: "lol", tier: "DIAMOND", rank: "II", league_points:45 }] },
  { chzzkChannelName: "다이아4유지중", entries: [{ game_type: "lol", tier: "DIAMOND", rank: "IV", league_points:12 }] },
  { chzzkChannelName: "에메랄드1", entries: [{ game_type: "lol", tier: "EMERALD", rank: "I", league_points:88 }] },
  { chzzkChannelName: "에메랄드3", entries: [{ game_type: "lol", tier: "EMERALD", rank: "III", league_points:20 }] },
  { chzzkChannelName: "플레2매칭중", entries: [{ game_type: "lol", tier: "PLATINUM", rank: "II", league_points:55 }] },
  { chzzkChannelName: "골드1탈출각", entries: [{ game_type: "lol", tier: "GOLD", rank: "I", league_points:90 }] },
  { chzzkChannelName: "골드3시청러", entries: [{ game_type: "lol", tier: "GOLD", rank: "III", league_points:30 }] },
  { chzzkChannelName: "골드2응원", entries: [{ game_type: "lol", tier: "GOLD", rank: "II", league_points:60 }] },
  { chzzkChannelName: "실버2탑", entries: [{ game_type: "lol", tier: "SILVER", rank: "II", league_points:40 }] },
  {
    chzzkChannelName: "본캐는TFT장인",
    entries: [
      { game_type: "lol", tier: "SILVER", rank: "III", league_points:15 },
      { game_type: "tft", tier: "GOLD", rank: "I", league_points:75 },
    ],
  },
  { chzzkChannelName: "브론즈4딜러", entries: [{ game_type: "lol", tier: "BRONZE", rank: "IV", league_points:5 }] },
  { chzzkChannelName: "플레4응원봉", entries: [{ game_type: "lol", tier: "PLATINUM", rank: "IV", league_points:10 }] },
  { chzzkChannelName: "아이언1탈출", entries: [{ game_type: "lol", tier: "IRON", rank: "I", league_points:0 }] },
  { chzzkChannelName: "TFT다이아3", entries: [{ game_type: "tft", tier: "DIAMOND", rank: "III", league_points:25 }] },
  { chzzkChannelName: "TFT실버2", entries: [{ game_type: "tft", tier: "SILVER", rank: "II", league_points:50 }] },
  {
    chzzkChannelName: "투잡유저",
    entries: [
      { game_type: "lol", tier: "GOLD", rank: "II", league_points:20 },
      { game_type: "tft", tier: "PLATINUM", rank: "I", league_points:95 },
    ],
  },
];
