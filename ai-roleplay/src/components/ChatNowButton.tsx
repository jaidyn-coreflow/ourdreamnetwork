"use client";

import { useEmailGate } from "@/components/EmailGate";

/** Derives the chat slug from an ourdream.ai chat URL and opens the gate. */
export function ChatNowButton({
  chatUrl,
  name,
  className,
  children,
}: {
  chatUrl: string;
  /** Character display name — surfaced in the gate's CTA copy. */
  name: string;
  className?: string;
  children: React.ReactNode;
}) {
  const { openGate } = useEmailGate();
  const slug = new URL(chatUrl).pathname.replace(/^\/chat\//, "");
  return (
    <button type="button" className={className} onClick={() => openGate(slug, name)}>
      {children}
    </button>
  );
}
