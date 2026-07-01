"use client";

/**
 * ChatPreview
 *
 * Renders a per-character CYOA dialogue tree as an interactive chat
 * bubble experience. Each player click reveals the next character beat
 * and the next set of choices. Terminal nodes are followed by an
 * outbound CTA into ourdream's chat for that character.
 *
 * Why client-only:
 *   The component manages a path of visited choices in local state.
 *   This is the only rendering surface for the dialogue tree — there is
 *   no separate server-rendered SEO surface.
 *
 * Italic stage direction:
 *   Authors write "*She turns from the balcony*" with single asterisks.
 *   `renderInline()` parses these into <em> spans without a markdown
 *   library \u2014 we only need this one transformation.
 */

import Image from "next/image";
import { useCallback, useMemo, useState, type ReactNode } from "react";
import { useEmailGate } from "./EmailGate";
import type {
  ChatPreview,
  ChatPreviewChoice,
  ChatPreviewNode,
  NodeId,
} from "@/data/chat-previews/types";

interface Props {
  preview: ChatPreview;
  /**
   * Character display name. Shown above each character bubble so the
   * conversation feels addressed (esp. valuable on mobile where the
   * detail page hero scrolls off-screen).
   */
  characterName: string;
  /** Avatar image URL. Same one used in the detail-page hero. */
  characterImageUrl: string;
  /**
   * Path on ourdream the terminal CTA links into \u2014 typically
   * `/chat/<character-slug>-<8charsuffix>` from `Character.chatUrl`.
   */
  ourdreamChatPath: string;
  /** Per-character email-gate copy, shown when the terminal CTA opens the modal. */
  gate: import("@/data/characters").GateCopy;
}

/* ── Public ───────────────────────────────────────────────────────── */

export function ChatPreview({
  preview,
  characterName,
  characterImageUrl,
  ourdreamChatPath,
  gate,
}: Props) {
  const { openGate } = useEmailGate();
  /* Derive the chat slug from the path: `/chat/<slug>` → `<slug>` */
  const chatSlug = ourdreamChatPath.replace(/^\/chat\//, "");

  /* The played path: each entry is the chosen next NodeId. The current
   * visible node is the last id (or rootId when nothing chosen yet). */
  const [path, setPath] = useState<NodeId[]>([]);

  const currentId = path.length === 0 ? preview.rootId : path[path.length - 1];
  const currentNode = preview.nodes[currentId];

  /* Reconstruct the visible bubble stream from the path so we can
   * re-render with smooth transitions on each choice. */
  const stream = useMemo(() => buildStream(preview, path), [preview, path]);

  const onChoose = useCallback(
    (choice: ChatPreviewChoice) => {
      setPath((prev) => [...prev, choice.next]);
    },
    [],
  );

  const onRestart = useCallback(() => setPath([]), []);

  const isFinished = currentNode.endLine === true;

  return (
    <section
      aria-labelledby="chat-preview-heading"
      className="space-y-5 rounded-2xl border border-white/10 bg-night-900/40 p-4 shadow-[0_0_40px_-20px_rgba(212,165,116,0.3)] sm:p-6"
    >
      <header className="flex items-center justify-between gap-3">
        <h2
          id="chat-preview-heading"
          className="font-display text-lg font-semibold text-[#F17BB6] sm:text-xl"
        >
          Play the opening scene with {characterName}
        </h2>
        {path.length > 0 && (
          <button
            type="button"
            onClick={onRestart}
            className="rounded-full border border-white/10 px-3 py-1 text-[11px] uppercase tracking-wider text-parchment-300/60 transition-colors hover:border-gold-500/30 hover:text-gold-400"
          >
            Restart
          </button>
        )}
      </header>

      {preview.intro && (
        <p className="rounded-lg border border-white/5 bg-night-800/60 p-3 text-sm italic leading-relaxed text-parchment-300/70">
          {renderInline(preview.intro)}
        </p>
      )}

      {/* ── Bubble stream ─────────────────────────────────────── */}
      <ol
        className="flex flex-col gap-3"
        /* aria-live so screen readers announce new bubbles after each click */
        aria-live="polite"
        aria-atomic="false"
      >
        {stream.map((entry, i) =>
          entry.kind === "character" ? (
            <CharacterBubble
              key={`${entry.nodeId}-${i}`}
              text={entry.text}
              name={characterName}
              imageUrl={characterImageUrl}
            />
          ) : (
            <PlayerBubble key={`reply-${i}`} text={entry.text} />
          ),
        )}
      </ol>

      {/* ── Choice buttons (mid-tree) ─────────────────────────── */}
      {!isFinished && currentNode.choices && (
        <fieldset className="flex flex-col gap-2">
          <legend className="mb-2 text-[11px] uppercase tracking-wider text-parchment-300/40">
            Your reply
          </legend>
          {currentNode.choices.map((c) => (
            <button
              key={c.next}
              type="button"
              onClick={() => onChoose(c)}
              className="group rounded-xl border border-white/10 bg-card-gradient p-3 text-left text-sm text-parchment-200 transition-all hover:border-gold-500/40 hover:bg-plum-900/20"
            >
              <span className="text-parchment-300/40 group-hover:text-gold-400">
                &rarr;&nbsp;
              </span>
              {c.label}
            </button>
          ))}
        </fieldset>
      )}

      {/* ── Terminal CTA ──────────────────────────────────────── */}
      {isFinished && (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-gold-500/30 bg-plum-900/30 p-5 text-center">
          <p className="text-sm text-parchment-300/80">
            The scene doesn&apos;t have to end here. Continue it \u2014 your choices,
            your pace.
          </p>
          <button
            type="button"
            className="btn-primary text-base"
            onClick={() => openGate(chatSlug, characterName, gate)}
          >
            Continue with {characterName}&nbsp;&rarr;
          </button>
        </div>
      )}
    </section>
  );
}

/* ── Bubble subcomponents ─────────────────────────────────────────── */

function CharacterBubble({
  text,
  name,
  imageUrl,
}: {
  text: string;
  name: string;
  imageUrl: string;
}) {
  return (
    <li className="flex items-start gap-3">
      <div className="h-8 w-8 shrink-0 overflow-hidden rounded-full border border-gold-500/30 bg-night-800">
        <Image
          src={imageUrl}
          alt=""
          width={32}
          height={32}
          sizes="32px"
          className="h-full w-full object-cover"
        />
      </div>
      <div className="max-w-[85%] flex-1">
        <p className="mb-0.5 text-[10px] uppercase tracking-wider text-gold-400/70">
          {name}
        </p>
        <p className="rounded-2xl rounded-tl-sm border border-gold-500/15 bg-plum-900/30 px-4 py-3 text-sm leading-relaxed text-parchment-100">
          {renderInline(text)}
        </p>
      </div>
    </li>
  );
}

function PlayerBubble({ text }: { text: string }) {
  return (
    <li className="flex justify-end">
      <p className="max-w-[85%] rounded-2xl rounded-tr-sm border border-white/10 bg-night-800 px-4 py-2.5 text-sm leading-relaxed text-parchment-200">
        {text}
      </p>
    </li>
  );
}

/* ── Helpers ──────────────────────────────────────────────────────── */

type StreamEntry =
  | { kind: "character"; nodeId: NodeId; text: string }
  | { kind: "reply"; text: string };

/**
 * Build the visible bubble sequence from `rootId` through the chosen
 * path. Each path entry is the id of a node that the player navigated
 * INTO; we walk from root, adding the character bubble for the
 * starting node, then \[reply, character\] pairs for each choice taken.
 */
function buildStream(preview: ChatPreview, path: NodeId[]): StreamEntry[] {
  const out: StreamEntry[] = [];
  let cursor: ChatPreviewNode = preview.nodes[preview.rootId];
  let cursorId: NodeId = preview.rootId;
  out.push({ kind: "character", nodeId: cursorId, text: cursor.text });

  for (const nextId of path) {
    /* Find the choice that produced this transition so we can render
     * the player's selection bubble correctly. */
    const choice = cursor.choices?.find((c) => c.next === nextId);
    if (!choice) break; /* defensive: stale path after author edit */
    out.push({ kind: "reply", text: choice.label });
    cursor = preview.nodes[nextId];
    cursorId = nextId;
    out.push({ kind: "character", nodeId: cursorId, text: cursor.text });
  }
  return out;
}

/**
 * Tiny inline renderer: wraps `*italic*` spans in <em>, leaves
 * everything else as plain text. Single regex pass; safe against
 * un-paired asterisks (treated as literal).
 *
 * Not a full markdown parser \u2014 we don't want one here.
 */
function renderInline(input: string): ReactNode {
  const parts: ReactNode[] = [];
  const pattern = /\*([^*]+)\*/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let key = 0;
  while ((match = pattern.exec(input)) !== null) {
    if (match.index > lastIndex) {
      parts.push(input.slice(lastIndex, match.index));
    }
    parts.push(
      <em key={`em-${key++}`} className="italic text-parchment-300/80">
        {match[1]}
      </em>,
    );
    lastIndex = pattern.lastIndex;
  }
  if (lastIndex < input.length) {
    parts.push(input.slice(lastIndex));
  }
  return parts;
}
