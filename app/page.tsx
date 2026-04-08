export const dynamic = 'force-dynamic';

import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { TIERS, FEATURES, STEPS, TECH } from "@/lib/data";
import MockChat from "@/components/MockChat";

const NICK_COLORS = ["#5ac97d", "#a78bfa", "#60a5fa", "#f472b6", "#34d399", "#fb923c"];

export default function Home() {
  const randNum   = Math.floor(Math.random() * 9000 + 1000);
  const randColor = NICK_COLORS[Math.floor(Math.random() * NICK_COLORS.length)];
  const randTier  = TIERS[Math.floor(Math.random() * TIERS.length)].name;
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
            <Link href="https://github.com/IJHO-NUl1l1/chzzk-riot-tier-tracker" target="_blank" className="hover:text-white transition-colors">GitHub</Link>
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
            <MockChat nick={`user#${randNum}`} nickColor={randColor} tiers={[{ tier: randTier, gameType: "lol" }]} />

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
                          className="transition-all duration-300 group-hover:-translate-y-1"
                          style={{
                            filter: `drop-shadow(0 0 8px ${tier.color}CC)`,
                            animation: `float ${3.5 + delays[i]}s ease-in-out ${delays[i]}s infinite`,
                          }}
                        />
                        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-5 h-[3px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-[4px]"
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
                      const url = `https://img.shields.io/badge/${encodeURIComponent(b.label)}-${b.color}?style=flat&logo=${b.logo}&logoColor=${logoColor}&labelColor=18181f`;
                      return (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                          key={b.label}
                          src={url}
                          alt={b.label}
                          style={{ display: "block" }}
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
