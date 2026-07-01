import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChatPreview } from "@/components/ChatPreview";
import { getChatPreview } from "@/data/chat-previews";
import { FEATURED_CHARACTERS, getCharacter } from "@/data/characters";

export function generateStaticParams() {
  return FEATURED_CHARACTERS.map((c) => ({ slug: c.slug }));
}

export function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Metadata {
  const c = getCharacter(params.slug);
  if (!c) return {};
  const title = c.name;
  const desc = `Play the opening scene with ${c.name} — ${c.hook}`;
  return {
    title,
    description: desc,
    alternates: { canonical: `/${c.slug}` },
    openGraph: {
      title,
      description: desc,
      images: [{ url: c.imageUrl, width: 512, height: 683, alt: c.name }],
    },
  };
}

export default function CharacterPage({
  params,
}: {
  params: { slug: string };
}) {
  const character = getCharacter(params.slug);
  if (!character) notFound();

  const preview = getChatPreview(character.slug);
  const ourdreamChatPath = new URL(character.chatUrl).pathname;

  return (
    <div className="page-section space-y-12">
      {/* ── Breadcrumb ────────────────────────────────────────── */}
      <nav className="text-xs text-white/40">
        <Link href="/" className="hover:text-[#F17BB6]">
          Characters
        </Link>
        <span className="mx-1.5">/</span>
        <span className="text-white/70">{character.name}</span>
      </nav>

      {/* ── Hero ──────────────────────────────────────────────── */}
      <div className="mx-auto grid max-w-4xl gap-8 md:grid-cols-[2fr_3fr]">
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-night-800">
          <Image
            src={character.imageUrl}
            alt={character.name}
            width={512}
            height={683}
            sizes="(min-width: 768px) 40vw, 100vw"
            priority
            className="aspect-[3/4] w-full object-cover"
          />
        </div>
        <div className="flex flex-col justify-center space-y-4">
          <span className="w-fit rounded-full border border-white/15 bg-night-800/60 px-3 py-1 text-xs text-white/70">
            {character.power}
          </span>
          <h1 className="font-display text-4xl font-bold leading-tight text-white md:text-5xl">
            {character.name}
          </h1>
          <p className="text-lg leading-relaxed text-white/70">
            {character.hook}
          </p>
          {preview && (
            <a href="#story" className="btn-primary w-fit">
              Play the opening scene&nbsp;&darr;
            </a>
          )}
        </div>
      </div>

      {/* ── Interactive story ─────────────────────────────────── */}
      {preview && (
        <div id="story" className="mx-auto max-w-2xl scroll-mt-24">
          <ChatPreview
            preview={preview}
            characterName={character.name}
            characterImageUrl={character.imageUrl}
            ourdreamChatPath={ourdreamChatPath}
            gate={character.gate}
          />
        </div>
      )}
    </div>
  );
}
