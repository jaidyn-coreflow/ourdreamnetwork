import Image from "next/image";
import Link from "next/link";
import type { Character } from "@/data/characters";

/** Picker card: portrait + name + power badge + hook, links to the story. */
export function CharacterCard({ character }: { character: Character }) {
  return (
    <Link
      href={`/${character.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-night-800/60 transition-colors hover:border-[#F17BB6]/40"
    >
      <div className="relative aspect-[3/4] overflow-hidden bg-night-800">
        <Image
          src={character.imageUrl}
          alt={character.name}
          fill
          sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 100vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <span className="absolute left-3 top-3 rounded-full border border-white/15 bg-black/50 px-2.5 py-0.5 text-[11px] font-medium text-white/80 backdrop-blur">
          {character.power}
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <h2 className="text-lg font-semibold text-white">{character.name}</h2>
        <p className="flex-1 text-sm leading-relaxed text-white/55">
          {character.hook}
        </p>
        <span className="mt-1 text-sm font-semibold text-[#F17BB6] group-hover:underline">
          Begin the scene &rarr;
        </span>
      </div>
    </Link>
  );
}
