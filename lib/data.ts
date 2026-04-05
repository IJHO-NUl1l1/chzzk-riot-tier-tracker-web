export const TIERS = [
  { name: "Challenger", color: "#f4c873" },
  { name: "Grandmaster", color: "#ef4444" },
  { name: "Master", color: "#9d4dc3" },
  { name: "Diamond", color: "#576ace" },
  { name: "Emerald", color: "#3eb489" },
  { name: "Platinum", color: "#4fccc6" },
  { name: "Gold", color: "#f1a64d" },
  { name: "Silver", color: "#7e8183" },
  { name: "Bronze", color: "#b97451" },
  { name: "Iron", color: "#72767d" },
];

export const MOCK_CHAT = [
  { nick: "user#1847", nickColor: "#5ac97d", msg: "오늘 경기 너무 재밌다ㅋㅋ", tier: "Challenger" },
  { nick: "user#3021", nickColor: "#a78bfa", msg: "이번 패치 원딜 너프 심하지 않나요", tier: "Diamond" },
  { nick: "user#0293", nickColor: "#60a5fa", msg: "TFT 오버레이 어케 켜요?", tier: "Master" },
  { nick: "user#5512", nickColor: "#f472b6", msg: "배지 어떻게 달아요 저도 달고싶은데", tier: null },
  { nick: "user#7734", nickColor: "#34d399", msg: "ㄹㅇ 익스텐션 설치하면 바로 됨", tier: "Gold" },
  { nick: "user#1102", nickColor: "#fb923c", msg: "와 배지 생겼다 ㄷㄷ", tier: "Platinum" },
];

export const FEATURES = [
  {
    icon: "💬",
    title: "실시간 채팅 배지",
    desc: "치지직 채팅창 닉네임 옆에 LoL · TFT 티어 배지가 자동 삽입됩니다. 별도 설정 없이 Extension 설치만으로 동작합니다.",
    accent: "#818cf8",
  },
  {
    icon: "📺",
    title: "OBS 오버레이",
    desc: "스트리머는 시청자들의 티어를 OBS Browser Source URL 하나로 방송 화면에 바로 표시할 수 있습니다.",
    accent: "#34d399",
  },
  {
    icon: "⚡",
    title: "Supabase Realtime",
    desc: "티어 변경 시 Supabase Realtime을 이용한 WebSocket broadcast로 같은 방송을 시청 중인 모든 시청자 화면에 즉시 반영됩니다.",
    accent: "#60a5fa",
  },
  {
    icon: "🔒",
    title: "JWT 인증",
    desc: "JWT를 이용하여 본인 계정으로만 티어 수정과 공개 설정이 가능합니다. 다른 사람이 내 정보를 변경할 수 없습니다.",
    accent: "#f1a64d",
  },
];

export const STEPS = [
  { num: "01", title: "Extension 설치", desc: "Chrome 웹 스토어에서 Chzzk Riot Tier Tracker를 설치합니다." },
  { num: "02", title: "계정 연동", desc: "팝업에서 치지직과 Riot 계정을 각각 OAuth로 로그인합니다. 닉네임 입력 없이 티어가 자동으로 연동됩니다." },
  { num: "03", title: "배지 확인", desc: "치지직 방송 입장 시 채팅창에서 LoL · TFT 티어 배지가 자동으로 표시됩니다." },
];

export const TECH = [
  {
    label: "Extension",
    badges: [
      { label: "Chrome Extension", color: "4285F4", logo: "googlechrome" },
      { label: "JavaScript", color: "F7DF1E", logo: "javascript", logoColor: "000" },
      { label: "Supabase Realtime", color: "3ECF8E", logo: "supabase", logoColor: "000" },
    ],
  },
  {
    label: "Frontend",
    badges: [
      { label: "Next.js", color: "000000", logo: "nextdotjs" },
      { label: "TypeScript", color: "3178C6", logo: "typescript" },
      { label: "Tailwind CSS", color: "06B6D4", logo: "tailwindcss", logoColor: "000" },
    ],
  },
  {
    label: "Backend",
    badges: [
      { label: "Fastify", color: "000000", logo: "fastify" },
      { label: "Railway", color: "0B0D0E", logo: "railway" },
      { label: "Node.js", color: "339933", logo: "nodedotjs" },
    ],
  },
  {
    label: "Database",
    badges: [
      { label: "Supabase", color: "3ECF8E", logo: "supabase", logoColor: "000" },
      { label: "PostgreSQL", color: "316192", logo: "postgresql" },
    ],
  },
];
