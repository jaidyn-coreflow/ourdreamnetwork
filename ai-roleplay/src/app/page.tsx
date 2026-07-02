import type { Metadata } from "next";
import { CharacterCard } from "@/components/CharacterCard";
import { FEATURED_CHARACTERS } from "@/data/characters";

export const metadata: Metadata = {
  title: "Pick Your Story",
  description:
    "Five originals, one choice. Pick a character and play the opening scene — your choices, your pace.",
  alternates: { canonical: "/" },
};

export default function HomePage() {
  return (
    <div className="page-section">
      <header className="mb-12 max-w-3xl">
        <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-gold-400">
          OurDream Originals
        </p>
        <h1 className="mt-4 font-display text-[clamp(2.5rem,6.5vw,4.5rem)] font-bold leading-[0.95] tracking-tight text-white">
          Five strangers.
          <br />
          <span className="text-white/40">One changes everything.</span>
        </h1>
        <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/55">
          Pick who you meet tonight and play the opening scene. Every reply is
          yours — and he&rsquo;ll remember it.
        </p>
      </header>

      {/* Mobile: horizontal snap-scroll carousel (with a peek of the next
          card). sm+ : responsive grid. */}
      <ul
        aria-label="Choose a character"
        className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2
                   [scrollbar-width:none] [&::-webkit-scrollbar]:hidden
                   sm:mx-0 sm:grid sm:snap-none sm:grid-cols-2 sm:gap-5 sm:overflow-visible sm:px-0 sm:pb-0
                   lg:grid-cols-3"
      >
        {FEATURED_CHARACTERS.map((c, i) => (
          <li
            key={c.slug}
            className="rise-in w-[80%] shrink-0 snap-start sm:w-auto"
            style={{ animationDelay: `${i * 70}ms` }}
          >
            <CharacterCard character={c} />
          </li>
        ))}
      </ul>
    </div>
  );
}
