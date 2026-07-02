"use client";

/**
 * ChatPreview — immersive, iMessage-style story chat.
 *
 * Plays a per-character CYOA dialogue tree as a full-height conversation:
 * a sticky header (avatar + name), a scrolling bubble stream (character
 * messages received on the left, the player's chosen replies sent on the
 * right), and a docked reply area at the bottom that shows the current
 * choices — or, at a terminal beat, the email-gate CTA.
 *
 * Client-only: the component manages the path of visited choices in local
 * state and auto-scrolls to the newest bubble on each pick.
 *
 * Italic stage direction: authors write "*She turns from the balcony*" with
 * single asterisks. `renderInline()` parses these into <em> spans.
 */

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useEmailGate } from "./EmailGate";
import type {
  ChatPreview as ChatPreviewData,
  ChatPreviewChoice,
  ChatPreviewNode,
  NodeId,
} from "@/data/chat-previews/types";
import type { GateCopy } from "@/data/characters";

interface Props {
  preview: ChatPreviewData;
  characterName: string;
  characterImageUrl: string;
  /** Path on ourdream the terminal CTA links into — `/chat/<slug>`. */
  ourdreamChatPath: string;
  /** Per-character email-gate copy shown when the terminal CTA opens the modal. */
  gate: GateCopy;
}

export function ChatPreview({
  preview,
  characterName,
  characterImageUrl,
  ourdreamChatPath,
  gate,
}: Props) {
  const { openGate } = useEmailGate();
  const chatSlug = ourdreamChatPath.replace(/^\/chat\//, "");

  /* The "write your own" path opens the same gate as the terminal CTA but
   * frames it as starting a free-form custom chat rather than continuing the
   * scripted scene. Same redirect target (the real ourdream chat). */
  const customGate: GateCopy = {
    headline: "Say it your way",
    sub: `Enter your email to start a custom chat with ${characterName} — reply however you like.`,
    button: "Start my custom chat →",
  };

  const [path, setPath] = useState<NodeId[]>([]);
  const currentId = path.length === 0 ? preview.rootId : path[path.length - 1];
  const currentNode = preview.nodes[currentId];
  const stream = useMemo(() => buildStream(preview, path), [preview, path]);
  const isFinished = currentNode.endLine === true;

  /* Briefly show a typing indicator before each incoming character line so
   * the conversation feels live rather than instant. */
  const [typing, setTyping] = useState(true);
  useEffect(() => {
    setTyping(true);
    const t = setTimeout(() => setTyping(false), 750);
    return () => clearTimeout(t);
  }, [currentId]);

  const onChoose = useCallback((choice: ChatPreviewChoice) => {
    setPath((prev) => [...prev, choice.next]);
  }, []);
  const onRestart = useCallback(() => setPath([]), []);

  /* While "typing", hold back the latest character bubble (always the last
   * stream entry) and show the indicator in its place. */
  const visible = typing ? stream.slice(0, -1) : stream;

  /* Auto-scroll to the newest bubble as messages and the indicator change. */
  const bottomRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [visible.length, typing]);

  return (
    <section className="mx-auto flex h-[calc(100dvh-4rem)] max-w-2xl flex-col border-white/10 sm:border-x">
      {/* ── Conversation header ─────────────────────────────── */}
      <header className="flex items-center gap-3 border-b border-white/10 bg-night-900/80 px-3 py-2.5 backdrop-blur">
        <Link
          href="/"
          aria-label="Back to characters"
          className="grid h-9 w-9 place-items-center rounded-full text-2xl leading-none text-[#F17BB6] transition-colors hover:bg-white/5"
        >
          &lsaquo;
        </Link>
        <span className="relative block h-9 w-9 overflow-hidden rounded-full border border-white/15">
          <Image src={characterImageUrl} alt="" fill sizes="36px" className="object-cover" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-white">{characterName}</p>
          <p className="flex items-center gap-1.5 text-[11px] text-white/50">
            <span className="h-1.5 w-1.5 rounded-full bg-green-400 shadow-[0_0_5px_rgba(74,222,128,0.9)]" />
            online now
          </p>
        </div>
        {path.length > 0 && (
          <button
            type="button"
            onClick={onRestart}
            className="rounded-full px-3 py-1 text-[11px] uppercase tracking-wider text-white/45 transition-colors hover:text-[#F17BB6]"
          >
            Restart
          </button>
        )}
      </header>

      {/* ── Bubble stream (anchored to the bottom) ──────────── */}
      <div
        className="flex flex-1 flex-col overflow-y-auto px-4 py-5"
        aria-live="polite"
        aria-atomic="false"
      >
        <div className="mt-auto space-y-2.5">
          {preview.intro && (
            <p className="mx-auto mb-2 max-w-md text-center text-[12px] italic leading-relaxed text-white/40">
              {renderInline(preview.intro)}
            </p>
          )}
          {visible.map((entry, i) =>
            entry.kind === "character" ? (
              <CharacterBubble
                key={`${entry.nodeId}-${i}`}
                text={entry.text}
                imageUrl={characterImageUrl}
              />
            ) : (
              <PlayerBubble key={`reply-${i}`} text={entry.text} />
            ),
          )}
          {typing && <TypingBubble imageUrl={characterImageUrl} />}
          <div ref={bottomRef} />
        </div>
      </div>

      {/* ── Reply dock: choices, or the terminal gate CTA ───── */}
      <div className="border-t border-white/10 bg-night-900/80 px-3 py-3 backdrop-blur">
        {typing ? (
          <div className="h-[46px]" aria-hidden />
        ) : !isFinished && currentNode.choices ? (
          <div className="flex flex-col gap-2">
            {currentNode.choices.slice(0, 2).map((c) => (
              <button
                key={c.next}
                type="button"
                onClick={() => onChoose(c)}
                className="group rounded-full border border-[#F17BB6]/30 bg-[#F17BB6]/5 px-4 py-2.5 text-left text-sm text-white transition-all hover:border-[#F17BB6]/60 hover:bg-[#F17BB6]/15"
              >
                <span className="text-[#F17BB6]">&rarr;&nbsp;</span>
                {c.label}
              </button>
            ))}
            <button
              type="button"
              onClick={() => openGate(chatSlug, characterName, customGate)}
              className="group flex items-center gap-2 rounded-full border border-dashed border-[#F17BB6]/45 px-4 py-2.5 text-left text-sm font-medium text-[#F17BB6] transition-all hover:border-[#F17BB6]/80 hover:bg-[#F17BB6]/10"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M12 20h9" />
                <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
              </svg>
              Write your own custom response
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => openGate(chatSlug, characterName, gate)}
            className="btn-primary w-full justify-center"
          >
            {gate.button}
          </button>
        )}
      </div>
    </section>
  );
}

/* ── Bubbles ──────────────────────────────────────────────── */

function CharacterBubble({ text, imageUrl }: { text: string; imageUrl: string }) {
  return (
    <div className="msg-in flex items-end gap-2">
      <span className="relative block h-7 w-7 shrink-0 overflow-hidden rounded-full border border-white/10">
        <Image src={imageUrl} alt="" fill sizes="28px" className="object-cover" />
      </span>
      <p className="max-w-[78%] whitespace-pre-line rounded-2xl rounded-bl-md bg-white/10 px-4 py-2.5 text-sm leading-relaxed text-white/95">
        {renderInline(text)}
      </p>
    </div>
  );
}

function PlayerBubble({ text }: { text: string }) {
  return (
    <div className="msg-in flex justify-end">
      <p className="max-w-[78%] rounded-2xl rounded-br-md bg-gradient-to-br from-[#F17BB6] to-[#EC4899] px-4 py-2.5 text-sm leading-relaxed text-white shadow-sm">
        {text}
      </p>
    </div>
  );
}

function TypingBubble({ imageUrl }: { imageUrl: string }) {
  return (
    <div className="msg-in flex items-end gap-2">
      <span className="relative block h-7 w-7 shrink-0 overflow-hidden rounded-full border border-white/10">
        <Image src={imageUrl} alt="" fill sizes="28px" className="object-cover" />
      </span>
      <span
        className="flex items-center gap-1.5 rounded-2xl rounded-bl-md bg-white/10 px-4 py-3.5"
        aria-label="typing"
      >
        <span className="typing-dot h-1.5 w-1.5 rounded-full bg-white/70" style={{ animationDelay: "0ms" }} />
        <span className="typing-dot h-1.5 w-1.5 rounded-full bg-white/70" style={{ animationDelay: "160ms" }} />
        <span className="typing-dot h-1.5 w-1.5 rounded-full bg-white/70" style={{ animationDelay: "320ms" }} />
      </span>
    </div>
  );
}

/* ── Helpers ──────────────────────────────────────────────── */

type StreamEntry =
  | { kind: "character"; nodeId: NodeId; text: string }
  | { kind: "reply"; text: string };

function buildStream(preview: ChatPreviewData, path: NodeId[]): StreamEntry[] {
  const out: StreamEntry[] = [];
  let cursor: ChatPreviewNode = preview.nodes[preview.rootId];
  let cursorId: NodeId = preview.rootId;
  out.push({ kind: "character", nodeId: cursorId, text: cursor.text });

  for (const nextId of path) {
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
 * Tiny inline renderer: wraps `*italic*` spans in <em>, leaves everything
 * else as plain text. Single regex pass; safe against un-paired asterisks.
 */
function renderInline(input: string): ReactNode {
  const parts: ReactNode[] = [];
  const pattern = /\*([^*]+)\*/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let key = 0;
  while ((match = pattern.exec(input)) !== null) {
    if (match.index > lastIndex) parts.push(input.slice(lastIndex, match.index));
    parts.push(
      <em key={`em-${key++}`} className="italic text-white/60">
        {match[1]}
      </em>,
    );
    lastIndex = pattern.lastIndex;
  }
  if (lastIndex < input.length) parts.push(input.slice(lastIndex));
  return parts;
}
