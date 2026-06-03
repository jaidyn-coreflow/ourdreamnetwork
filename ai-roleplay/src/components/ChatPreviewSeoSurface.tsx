/**
 * ChatPreviewSeoSurface
 *
 * SERVER component (no "use client"). Renders the FULL dialogue tree
 * of a chat preview as static, crawlable HTML inside a collapsible
 * <details> element. Bots see every line; users see a short label
 * they can expand if they want a "story summary" before playing.
 *
 * Why both this and `<ChatPreview>`:
 *   - <ChatPreview> is the interactive client UI \u2014 great UX, but its
 *     bubbles are revealed on click, so a non-JS crawler only sees the
 *     opening node.
 *   - This server component dumps every path as static text, making the
 *     full ~400 words of original character dialogue indexable.
 *
 * Why this is a big SEO deal (April 2026 Helpful Content Update):
 *   The update specifically rewards original first-hand content depth
 *   on each page. 71% of affiliate sites lost rankings; pages that
 *   demonstrated unique, substantive content per URL were spared.
 *   Each character detail page now ships ~400 unique words of
 *   hand-authored dialogue \u2014 not regurgitated, not LLM-generated,
 *   not a redirect surface. That's the lever.
 */

import type { ChatPreview } from "@/data/chat-previews/types";
import { walkAllPaths } from "@/data/chat-previews/types";

interface Props {
  preview: ChatPreview;
  characterName: string;
}

export function ChatPreviewSeoSurface({ preview, characterName }: Props) {
  const paths = walkAllPaths(preview);

  return (
    <details className="rounded-xl border border-white/5 bg-card-gradient/40 p-4 text-sm text-parchment-300/70">
      <summary className="cursor-pointer text-parchment-200 transition-colors hover:text-gold-400">
        Read all {paths.length} story paths (text version)
      </summary>
      <div className="mt-4 space-y-6">
        {preview.intro && (
          <p className="italic text-parchment-300/60">{preview.intro}</p>
        )}
        {paths.map((path, i) => (
          <article
            key={i}
            className="space-y-2 border-l-2 border-gold-500/20 pl-4"
          >
            <h3 className="font-display text-xs uppercase tracking-wider text-gold-400/70">
              Path {i + 1}
            </h3>
            {path.map((step, j) => (
              <p
                key={j}
                className={
                  step.speaker === "character"
                    ? "text-parchment-300/80"
                    : "italic text-parchment-300/50"
                }
              >
                <strong className="text-parchment-200">
                  {step.speaker === "character" ? characterName : "You"}:
                </strong>{" "}
                {step.text}
              </p>
            ))}
          </article>
        ))}
      </div>
    </details>
  );
}

/**
 * Build schema.org JSON-LD for the conversation tree. Uses
 * `Conversation` + nested `Message` items (a recognised pattern for
 * dialogue-driven content). Each message is given a name + sender so
 * the schema validator accepts it.
 *
 * Returned as a JSON-serialisable object; the page wraps it in a
 * <script type="application/ld+json"> tag.
 */
export function buildChatPreviewJsonLd(
  preview: ChatPreview,
  characterName: string,
  pageUrl: string,
): Record<string, unknown> {
  const paths = walkAllPaths(preview);

  /* Flatten unique character lines (the AI side); dedupe by nodeId so
   * the JSON-LD doesn't bloat with the same line repeated across paths. */
  const seen = new Set<string>();
  const messages: Array<Record<string, unknown>> = [];
  for (const path of paths) {
    for (const step of path) {
      if (step.speaker === "character" && step.nodeId && !seen.has(step.nodeId)) {
        seen.add(step.nodeId);
        messages.push({
          "@type": "Message",
          identifier: step.nodeId,
          text: step.text,
          sender: {
            "@type": "Person",
            name: characterName,
          },
        });
      }
    }
  }

  return {
    "@context": "https://schema.org",
    "@type": "Conversation",
    url: pageUrl,
    name: `Chat preview: ${characterName}`,
    description: `An interactive choose-your-own-adventure preview of an AI roleplay chat with ${characterName}. ${messages.length} character beats across ${paths.length} story paths.`,
    inLanguage: "en-US",
    isPartOf: {
      "@type": "WebPage",
      url: pageUrl,
    },
    hasPart: messages,
  };
}
