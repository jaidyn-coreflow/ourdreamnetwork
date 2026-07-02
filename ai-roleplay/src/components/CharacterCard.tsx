import Image from "next/image";
import Link from "next/link";
import type { Character } from "@/data/characters";

/**
 * Picker card — full-bleed portrait with a camera-frame overlay and a
 * bottom scrim carrying the name, hook, and a meta row. The whole card is
 * the link into the character's story.
 */

/* Deterministic, SSR-stable illustrative engagement counts derived from the
 * slug so the grid feels alive. Purely decorative placeholders. */
function charHash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}
function illustrativeStats(slug: string) {
  const h = charHash(slug);
  return {
    likes: (2 + (h % 80) / 10).toFixed(1) + "k",
    messages: (1 + ((h >>> 3) % 70) / 10).toFixed(1) + "M",
  };
}

function HeartIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5" aria-hidden>
      <path d="M12 21s-6.7-4.35-9.33-8.02C.9 10.42 1.4 7.1 3.9 5.7c1.9-1.06 4.2-.5 5.6 1.06L12 9.3l2.5-2.54c1.4-1.56 3.7-2.12 5.6-1.06 2.5 1.4 3 4.72 1.23 7.28C18.7 16.65 12 21 12 21z" />
    </svg>
  );
}
function ChatIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5" aria-hidden>
      <path d="M4 4h16a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H9l-5 4V6a2 2 0 0 1 2-2z" />
    </svg>
  );
}

export function CharacterCard({ character }: { character: Character }) {
  const handle = character.slug.split("-")[0];
  const shortPower = character.power.split(" · ")[0];
  const { likes, messages } = illustrativeStats(character.slug);

  return (
    <Link
      href={`/${character.slug}`}
      className="group relative block aspect-[3/4] overflow-hidden rounded-[20px] border border-white/10 bg-night-800 shadow-xl transition-transform duration-300 hover:-translate-y-1"
    >
      {/* Portrait */}
      <Image
        src={character.imageUrl}
        alt={character.name}
        fill
        sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 100vw"
        className="object-cover transition-transform duration-500 group-hover:scale-105"
      />

      {/* Bottom scrim + meta */}
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/85 to-transparent px-4 pb-4 pt-20">
        <div className="flex flex-wrap items-baseline gap-x-2">
          <h2 className="font-display text-[22px] font-bold leading-tight text-white drop-shadow">
            {character.name}
          </h2>
          <span className="text-sm font-medium text-white/60">{shortPower}</span>
        </div>

        <p className="mt-1.5 line-clamp-2 text-[13px] leading-snug text-white/65">
          {character.hook}
        </p>

        <div className="mt-3 flex items-center justify-between">
          <span className="flex items-center gap-2 text-[13px] font-semibold text-white/90">
            <span className="relative block h-6 w-6 overflow-hidden rounded-full border border-white/20">
              <Image src={character.imageUrl} alt="" fill sizes="24px" className="object-cover" />
            </span>
            {handle}
          </span>
          <span className="flex items-center gap-3 text-[12px] text-white/70">
            <span className="flex items-center gap-1">
              <HeartIcon />
              {likes}
            </span>
            <span className="flex items-center gap-1">
              <ChatIcon />
              {messages}
            </span>
          </span>
        </div>
      </div>
    </Link>
  );
}
