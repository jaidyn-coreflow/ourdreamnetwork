"use client";

import Link from "next/link";
import { useState } from "react";

/**
 * Three-pillar navigation maps the site to the three customer jobs:
 *
 *   STORIES  \u2014 play someone else's world (chat-led, ~44% of customers)
 *   BUILD    \u2014 make your own world (academy + quick wizard)
 *   STUDIO   \u2014 make your own scenes (images today, video tomorrow)
 *
 * Sub-routes are surfaced via in-page navigation on each pillar landing
 * page, plus the "More" section in the mobile menu so power users can
 * jump straight to /create, /books, or /prompt-library.
 */
const PILLAR_LINKS = [
  { href: "/characters", label: "Stories" },
  { href: "/character-builder-academy", label: "Build" },
  { href: "/prompt-studio", label: "Studio" },
  { href: "/about", label: "About" },
] as const;

/* Surfaced under "More" in the mobile menu so the secondary routes
 * remain reachable without a tap-out to in-page nav. Desktop users find
 * these via the in-page navigation on each pillar landing. */
const MOBILE_MORE_LINKS = [
  { href: "/create", label: "Quick 3-step wizard" },
  { href: "/characters", label: "All characters" },
  { href: "/books", label: "Book-inspired worlds" },
  { href: "/prompt-library", label: "Prompt Library" },
] as const;

export function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed inset-x-0 top-0 z-50 glass">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        {/* Logo / wordmark */}
        <Link
          href="/"
          className="font-display text-xl font-bold tracking-wide text-gold-400"
        >
          Romantasy<span className="text-parchment-200">AI</span>
        </Link>

        {/* Desktop nav */}
        <ul className="hidden items-center gap-6 md:flex">
          {PILLAR_LINKS.map((l) => (
            <li key={l.href}>
              <Link
                href={l.href}
                className="text-sm text-parchment-300 transition-colors hover:text-gold-400"
              >
                {l.label}
              </Link>
            </li>
          ))}
          <li>
            <Link href="/create" className="btn-primary text-sm">
              Create&nbsp;&rarr;
            </Link>
          </li>
        </ul>

        {/* Mobile hamburger */}
        <button
          type="button"
          aria-label="Toggle menu"
          className="flex flex-col gap-1.5 md:hidden"
          onClick={() => setOpen(!open)}
        >
          <span
            className={`block h-0.5 w-6 bg-parchment-200 transition-transform ${open ? "translate-y-2 rotate-45" : ""}`}
          />
          <span
            className={`block h-0.5 w-6 bg-parchment-200 transition-opacity ${open ? "opacity-0" : ""}`}
          />
          <span
            className={`block h-0.5 w-6 bg-parchment-200 transition-transform ${open ? "-translate-y-2 -rotate-45" : ""}`}
          />
        </button>
      </nav>

      {/* Mobile menu */}
      {open && (
        <div className="border-t border-white/5 px-4 pb-4 md:hidden">
          <ul className="flex flex-col gap-3 pt-3">
            {PILLAR_LINKS.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="block text-parchment-300 transition-colors hover:text-gold-400"
                >
                  {l.label}
                </Link>
              </li>
            ))}
            <li>
              <Link
                href="/create"
                onClick={() => setOpen(false)}
                className="btn-primary mt-2 w-full justify-center text-sm"
              >
                Create&nbsp;&rarr;
              </Link>
            </li>
          </ul>

          <div className="mt-4 border-t border-white/5 pt-3">
            <p className="mb-2 text-xs uppercase tracking-wider text-parchment-300/40">
              More
            </p>
            <ul className="flex flex-col gap-2">
              {MOBILE_MORE_LINKS.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    onClick={() => setOpen(false)}
                    className="block text-sm text-parchment-300/70 transition-colors hover:text-gold-400"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </header>
  );
}
