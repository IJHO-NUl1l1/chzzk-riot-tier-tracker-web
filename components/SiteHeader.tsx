import Link from "next/link";

export default function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b backdrop-blur-md"
      style={{ borderColor: "rgba(255,255,255,0.06)", background: "rgba(10,10,15,0.85)" }}>
      <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
        <Link
          href="/"
          className="shimmer-text font-[family-name:var(--font-rajdhani)] text-xl font-bold tracking-widest uppercase"
          style={{ textDecoration: "none" }}
        >
          CRTT
        </Link>
        <nav className="flex items-center gap-6 text-sm" style={{ color: "#71717a" }}>
          <Link href="/demo" className="hover:text-white transition-colors">Demo</Link>
          <Link href="https://github.com/IJHO-NUl1l1/chzzk-riot-tier-tracker" target="_blank" className="hover:text-white transition-colors">GitHub</Link>
        </nav>
      </div>
    </header>
  );
}
