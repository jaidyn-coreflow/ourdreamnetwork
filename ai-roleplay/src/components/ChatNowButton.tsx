"use client";

import { useEmailGate } from "@/components/EmailGate";

/** Derives the chat slug from an ourdream.ai chat URL and opens the gate. */
export function ChatNowButton({
  chatUrl,
  className,
  children,
}: {
  chatUrl: string;
  className?: string;
  children: React.ReactNode;
}) {
  const { openGate } = useEmailGate();
  const slug = new URL(chatUrl).pathname.replace(/^\/chat\//, "");
  return (
    <button type="button" className={className} onClick={() => openGate(slug)}>
      {children}
    </button>
  );
}
