import Link from "next/link";

/** Minimal header: logo links to the catalogue root. No pillar nav —
 *  the other romantasy pillars are out of scope for this zone. */
export function SiteHeader() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/5 bg-night-900/80 backdrop-blur-md">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <Link href="/" className="inline-block w-[180px] opacity-95 hover:opacity-100">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/ai-roleplay/ourdreamnetworklogov2.svg" alt="OurDream Network" className="block h-auto w-full" />
        </Link>
        <span className="flex items-center gap-2 text-[13px] text-white/55">
          <span className="h-2 w-2 rounded-full bg-[#F17BB6] shadow-[0_0_6px_rgba(241,123,182,0.7)]" />
          <span className="font-semibold text-white">248,123</span> chatting now
        </span>
      </nav>
    </header>
  );
}
