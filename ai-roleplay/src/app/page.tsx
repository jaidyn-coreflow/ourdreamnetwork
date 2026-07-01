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
    <div className="page-section space-y-10">
      <header className="mx-auto max-w-2xl text-center space-y-4">
        <h1 className="font-display text-4xl font-bold leading-tight text-white md:text-5xl">
          Who do you want to meet tonight?
        </h1>
        <p className="text-lg leading-relaxed text-white/60">
          Five originals, each with a secret. Pick one and play the opening
          scene — every choice is yours.
        </p>
      </header>

      <section
        aria-label="Choose a character"
        className="mx-auto grid max-w-5xl gap-5 sm:grid-cols-2 lg:grid-cols-3"
      >
        {FEATURED_CHARACTERS.map((c) => (
          <CharacterCard key={c.slug} character={c} />
        ))}
      </section>
    </div>
  );
}
