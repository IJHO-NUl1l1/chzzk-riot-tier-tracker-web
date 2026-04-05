import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";

/* ── 티어 데이터 ── */
const TIERS = [
  { name: "Challenger", color: "#f4c873", short: "CHA" },
  { name: "Grandmaster", color: "#ef4444", short: "GM" },
  { name: "Master", color: "#9d4dc3", short: "MST" },
  { name: "Diamond", color: "#576ace", short: "DIA" },
  { name: "Emerald", color: "#3eb489", short: "EMR" },
  { name: "Platinum", color: "#4fccc6", short: "PLA" },
  { name: "Gold", color: "#f1a64d", short: "GLD" },
  { name: "Silver", color: "#7e8183", short: "SLV" },
  { name: "Bronze", color: "#b97451", short: "BRZ" },
  { name: "Iron", color: "#72767d", short: "IRN" },
];

/* ── Mock 채팅 데이터 ── */
const MOCK_CHAT = [
  { nick: "T1Faker", msg: "오늘 KDA 어떻게 됨?", tier: "Challenger", tierColor: "#f4c873", game: "LoL", rank: "CHA" },
  { nick: "Hide_on_bush", msg: "ㄹㅇ 이번 패치 너프 심하다", tier: "Grandmaster", tierColor: "#ef4444", game: "LoL", rank: "GM" },
  { nick: "ProGamer_KR", msg: "TFT 오버레이 어케 켜요", tier: "Master", tierColor: "#9d4dc3", game: "TFT", rank: "MST" },
  { nick: "viewer123", msg: "배지 어떻게 달아요??", tier: null, tierColor: null, game: null, rank: null },
];

/* ── 피처 ── */
const FEATURES = [
  {
    icon: "💬",
    title: "실시간 채팅 배지",
    desc: "치지직 채팅창 닉네임 옆에 LoL · TFT 티어 배지가 자동 삽입됩니다. 별도 설정 없이 Extension 설치만으로 동작합니다.",
    accent: "#818cf8",
  },
  {
    icon: "📺",
    title: "OBS 오버레이",
    desc: "스트리머는 자신의 티어를 OBS Browser Source URL 하나로 방송 화면에 바로 표시할 수 있습니다.",
    accent: "#34d399",
  },
  {
    icon: "⚡",
    title: "Supabase Realtime",
    desc: "티어 변경 시 WebSocket broadcast로 같은 방송을 시청 중인 모든 시청자 화면에 즉시 반영됩니다.",
    accent: "#60a5fa",
  },
  {
    icon: "🔒",
    title: "안전한 API 프록시",
    desc: "Riot API 키는 Fastify 서버에서만 관리됩니다. 클라이언트에 API 키가 노출되지 않습니다.",
    accent: "#f1a64d",
  },
];

/* ── 단계 ── */
const STEPS = [
  { num: "01", title: "Extension 설치", desc: "Chrome 웹 스토어에서 Chzzk Riot Tier Tracker를 설치합니다." },
  { num: "02", title: "계정 연동", desc: "팝업에서 치지직 로그인 후 Riot 닉네임을 등록하면 자동으로 DB에 저장됩니다." },
  { num: "03", title: "배지 확인", desc: "치지직 방송 입장 시 채팅창에서 티어 배지가 자동으로 표시됩니다." },
];

/* ── 기술 스택 (shields.io badge URLs) ── */
const TECH = [
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

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen" style={{ background: "#0a0a0f", color: "#e4e4e7" }}>

      {/* ── Nav ── */}
      <header className="sticky top-0 z-50 border-b backdrop-blur-md"
        style={{ borderColor: "rgba(255,255,255,0.06)", background: "rgba(10,10,15,0.85)" }}>
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <span className="shimmer-text font-[family-name:var(--font-rajdhani)] text-xl font-bold tracking-widest uppercase">
            CRTT
          </span>
          <nav className="flex items-center gap-6 text-sm" style={{ color: "#71717a" }}>
            <Link href="/demo" className="hover:text-white transition-colors">Demo</Link>
            <Link href="https://github.com" target="_blank" className="hover:text-white transition-colors">GitHub</Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">

        {/* ── Hero ── */}
        <section className="relative overflow-hidden flex flex-col items-center justify-center px-6 pt-12 pb-10"
          style={{ minHeight: "calc(100vh - 56px)" }}>
          {/* Background orbs */}
          <div className="absolute inset-0 -z-10 pointer-events-none">
            <div className="absolute top-0 left-1/4 w-[600px] h-[500px] rounded-full opacity-70"
              style={{ background: "radial-gradient(ellipse, rgba(99,102,241,0.12) 0%, transparent 70%)" }} />
            <div className="absolute bottom-0 right-1/4 w-[500px] h-[400px] rounded-full opacity-60"
              style={{ background: "radial-gradient(ellipse, rgba(139,92,246,0.1) 0%, transparent 70%)" }} />
          </div>

          <div className="text-center max-w-4xl w-full flex flex-col items-center gap-6">
            {/* Title */}
            <h1 className="shimmer-text font-[family-name:var(--font-rajdhani)] font-bold leading-tight"
              style={{ fontSize: "clamp(2.6rem, 7vw, 5rem)" }}>
              치지직에서 바로 보는
              <br />
              LoL · TFT 실시간 티어
            </h1>

            {/* Subtitle */}
            <p className="text-base max-w-md" style={{ color: "#71717a" }}>
              채팅창에 자동으로 티어 배지 표시 + OBS 오버레이 지원
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap gap-3 justify-center">
              <Link href="#" className="btn-primary">Chrome Extension 설치하기</Link>
              <Link href="/demo" className="btn-ghost">웹 데모 체험하기</Link>
            </div>

            {/* Mock Chat Preview */}
            <div className="w-full mx-auto max-w-lg card-glow p-1 rounded-2xl"
              style={{ boxShadow: "0 0 60px rgba(99,102,241,0.15), 0 20px 60px rgba(0,0,0,0.5)" }}>
              <div className="flex items-center gap-2 px-4 py-2.5 border-b rounded-t-xl"
                style={{ borderColor: "rgba(255,255,255,0.06)", background: "#0f0f18" }}>
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#ef4444] opacity-70" />
                  <div className="w-2.5 h-2.5 rounded-full bg-[#f1a64d] opacity-70" />
                  <div className="w-2.5 h-2.5 rounded-full bg-[#34d399] opacity-70" />
                </div>
                <span className="text-xs mx-auto" style={{ color: "#52525b" }}>치지직 채팅창</span>
              </div>
              <div className="px-4 py-3 space-y-2.5 rounded-b-xl" style={{ background: "#0d0d16" }}>
                {MOCK_CHAT.map((msg, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    <div className="w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold"
                      style={{ background: msg.tierColor ? `${msg.tierColor}22` : "rgba(255,255,255,0.05)", color: msg.tierColor ?? "#52525b" }}>
                      {msg.nick[0]}
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      {msg.tier && (
                        <span className="tier-badge"
                          style={{
                            background: `${msg.tierColor}18`,
                            color: msg.tierColor!,
                            border: `1px solid ${msg.tierColor}40`,
                            boxShadow: `0 0 8px ${msg.tierColor}30`,
                          }}>
                          {msg.game} {msg.rank}
                        </span>
                      )}
                      <span className="font-semibold text-xs" style={{ color: msg.tierColor ?? "#71717a" }}>{msg.nick}</span>
                      <span style={{ color: "#a1a1aa" }}>{msg.msg}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tier emblem strip — scattered + interactive */}
            {(() => {
              const offsets     = [-10, 6, -16,  2,  -8, 12,  -4,  8, -14,  4];
              const sizes       = [ 52, 44,  58, 46,  54, 42,  50, 46,  56, 44];
              const delays      = [  0, 0.4, 0.8, 1.2, 0.2, 0.6, 1.0, 0.3, 0.7, 1.1];
              return (
                <div className="flex items-end justify-center gap-1 sm:gap-2 pt-4" style={{ height: 90 }}>
                  {TIERS.map((tier, i) => (
                    <div key={tier.name}
                      className="group relative cursor-default flex flex-col items-center"
                      style={{ transform: `translateY(${offsets[i]}px)` }}>
                      <div className="relative">
                        <Image
                          src={`/images/RankedEmblemsLatest/Rank=${tier.name}.png`}
                          alt={tier.name}
                          width={sizes[i]}
                          height={sizes[i]}
                          className="transition-all duration-300 group-hover:scale-[1.35] group-hover:-translate-y-1"
                          style={{
                            filter: `drop-shadow(0 0 8px ${tier.color}60)`,
                            animation: `float ${3.5 + delays[i]}s ease-in-out ${delays[i]}s infinite`,
                          }}
                        />
                        {/* Glow just below the image */}
                        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-5 h-[3px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-[3px]"
                          style={{ background: tier.color }} />
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>
        </section>

        {/* ── How it Works ── */}
        <section className="py-24 relative overflow-hidden"
          style={{ background: "radial-gradient(ellipse at 50% 50%, rgba(99,102,241,0.04) 0%, transparent 70%)" }}>
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-16">
              <p className="text-xs tracking-widest uppercase font-medium mb-3" style={{ color: "#52525b" }}>How it Works</p>
              <h2 className="font-[family-name:var(--font-rajdhani)] text-3xl font-bold" style={{ color: "#e4e4e7" }}>
                3단계로 시작하기
              </h2>
            </div>
            <div className="grid sm:grid-cols-3 gap-10 relative">
              <div className="absolute top-10 left-1/6 right-1/6 h-px hidden sm:block"
                style={{ background: "linear-gradient(90deg, transparent, rgba(99,102,241,0.3), rgba(99,102,241,0.3), transparent)" }} />
              {STEPS.map((s) => (
                <div key={s.num} className="flex flex-col items-center text-center gap-4">
                  <span className="font-[family-name:var(--font-rajdhani)] text-7xl font-bold leading-none"
                    style={{
                      color: "transparent",
                      WebkitTextStroke: "1px rgba(99,102,241,0.4)",
                      textShadow: "0 0 30px rgba(99,102,241,0.2)",
                    }}>
                    {s.num}
                  </span>
                  <h3 className="font-semibold text-sm" style={{ color: "#e4e4e7" }}>{s.title}</h3>
                  <p className="text-xs leading-relaxed" style={{ color: "#71717a" }}>{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Features ── */}
        <section className="max-w-6xl mx-auto px-6 py-24">
          <div className="text-center mb-16">
            <p className="text-xs tracking-widest uppercase font-medium mb-3" style={{ color: "#52525b" }}>Features</p>
            <h2 className="font-[family-name:var(--font-rajdhani)] text-3xl font-bold" style={{ color: "#e4e4e7" }}>
              왜 CRTT 인가?
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {FEATURES.map((f) => (
              <div key={f.title} className="card-glow p-6 flex flex-col gap-3">
                <div className="text-2xl">{f.icon}</div>
                <h3 className="font-semibold text-sm" style={{ color: "#e4e4e7" }}>{f.title}</h3>
                <p className="text-xs leading-relaxed" style={{ color: "#71717a" }}>{f.desc}</p>
                <div className="mt-auto pt-2">
                  <div className="h-0.5 w-8 rounded-full" style={{ background: f.accent, boxShadow: `0 0 8px ${f.accent}` }} />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Tech Stack ── */}
        <section className="py-24 border-t" style={{ borderColor: "rgba(255,255,255,0.04)" }}>
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-16">
              <p className="text-xs tracking-widest uppercase font-medium mb-3" style={{ color: "#52525b" }}>Tech Stack</p>
              <h2 className="font-[family-name:var(--font-rajdhani)] text-3xl font-bold" style={{ color: "#e4e4e7" }}>
                검증된 기술 스택
              </h2>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {TECH.map((t) => (
                <div key={t.label} className="card-glow p-5 space-y-4">
                  <p className="text-xs font-semibold tracking-widest uppercase" style={{ color: "#52525b" }}>{t.label}</p>
                  <div className="flex flex-wrap gap-2">
                    {t.badges.map((b) => {
                      const logoColor = b.logoColor ?? "white";
                      const url = `https://img.shields.io/badge/${encodeURIComponent(b.label)}-${b.color}?style=flat-square&logo=${b.logo}&logoColor=${logoColor}`;
                      return (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                          key={b.label}
                          src={url}
                          alt={b.label}
                          className="transition-all duration-200 hover:scale-105 hover:brightness-125"
                        />
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA Banner ── */}
        <section className="max-w-6xl mx-auto px-6 pb-24">
          <div className="card-glow p-12 text-center relative overflow-hidden"
            style={{ background: "linear-gradient(135deg, rgba(99,102,241,0.08), rgba(139,92,246,0.08))" }}>
            <div className="absolute inset-0 -z-10"
              style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(99,102,241,0.15) 0%, transparent 60%)" }} />
            <h2 className="font-[family-name:var(--font-rajdhani)] text-4xl font-bold mb-4" style={{ color: "#e4e4e7" }}>
              지금 바로 시작하세요
            </h2>
            <p className="mb-8 text-sm" style={{ color: "#71717a" }}>
              설치 후 치지직 방송을 열면 즉시 동작합니다
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Link href="#" className="btn-primary">Chrome Extension 설치하기</Link>
              <Link href="/demo" className="btn-ghost">데모 체험하기</Link>
            </div>
          </div>
        </section>

      </main>

      {/* ── Footer ── */}
      <footer className="border-t" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
        <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="font-[family-name:var(--font-rajdhani)] font-bold tracking-widest uppercase text-sm"
            style={{ color: "#3f3f46" }}>
            Chzzk Riot Tier Tracker
          </span>
          <div className="flex gap-6 text-xs" style={{ color: "#52525b" }}>
            <Link href="https://github.com" target="_blank" className="hover:text-white transition-colors">GitHub</Link>
            <Link href="/demo" className="hover:text-white transition-colors">Demo</Link>
            <Link href="/overlay" className="hover:text-white transition-colors">OBS Overlay</Link>
          </div>
        </div>
      </footer>

    </div>
  );
}
