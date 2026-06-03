import Link from "next/link";
import { Disclaimer } from "@/components/Disclaimer";

const FOOTER_LINKS = [
  { href: "/characters", label: "Characters" },
  { href: "/books", label: "Books" },
  { href: "/about", label: "About" },
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
] as const;

export function Footer() {
  return (
    <footer className="border-t border-white/5 bg-night-900/80">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-4 py-8 text-sm sm:flex-row sm:justify-between sm:px-6">
        <div className="space-y-2 text-center sm:text-left">
          {/* Adults-only disclaimer is the only ambient signal in the
              footer. We deliberately avoid surfacing partner brand
              names or direct outbound links here \u2014 every page would
              otherwise carry a non-engagement-gated link to an adult
              destination, which crawlers and ad networks penalise. */}
          <Disclaimer variant="footer" />
        </div>

        <ul className="flex gap-4">
          {FOOTER_LINKS.map((l) => (
            <li key={l.href}>
              <Link
                href={l.href}
                className="text-parchment-300/60 transition-colors hover:text-gold-400"
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <div className="border-t border-white/5 py-4 text-center text-xs text-parchment-300/40">
        &copy; {new Date().getFullYear()} RomantasyAI. All rights reserved.
      </div>
    </footer>
  );
}
