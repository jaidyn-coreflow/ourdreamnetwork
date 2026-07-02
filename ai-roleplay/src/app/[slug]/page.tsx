import type { Metadata } from "next";
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
  const desc = `Chat with ${c.name} — ${c.hook}`;
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
  if (!preview) notFound();

  const ourdreamChatPath = new URL(character.chatUrl).pathname;

  // Immersive full-screen chat — no marketing hero. The conversation IS the page.
  return (
    <ChatPreview
      preview={preview}
      characterName={character.name}
      characterImageUrl={character.imageUrl}
      ourdreamChatPath={ourdreamChatPath}
      gate={character.gate}
    />
  );
}
