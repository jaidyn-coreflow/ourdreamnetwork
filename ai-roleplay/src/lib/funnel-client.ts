"use client";

import { buildRedirectUrl } from "@/lib/redirect";
import { mergePersistedWithUrl } from "@/lib/tracking-storage";

function readClickid(): string {
  const m = document.cookie.match(/(?:^|;\s*)rtkclickid-store=([^;]+)/);
  return m ? decodeURIComponent(m[1]) : "";
}

/**
 * Decorate a dummy ourdream.ai link via GTM's cross-domain linker, then
 * extract the _gl payload. Carried to RedTrack as sub19 so the user's GA4
 * session stitches from ourdreamnetwork.com to ourdream.ai across the hop.
 */
function getGlValue(): Promise<string> {
  return new Promise((resolve) => {
    const a = document.createElement("a");
    a.href = "https://ourdream.ai/";
    a.style.cssText = "position:fixed;left:-9999px;";
    document.body.appendChild(a);
    a.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
    setTimeout(() => {
      const match = a.href.match(/[?&]_gl=([^&]+)/);
      document.body.removeChild(a);
      resolve(match ? decodeURIComponent(match[1]) : "");
    }, 100);
  });
}

function track(event: string, params: Record<string, unknown>) {
  (window as unknown as { dataLayer?: unknown[] }).dataLayer ??= [];
  (window as unknown as { dataLayer: unknown[] }).dataLayer.push({ event, ...params });
}

/** Fire-and-forget save; never blocks the redirect. */
function saveEmail(email: string): Promise<unknown> {
  return fetch("/api/save-email", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, mode: "ai-roleplay", marketingConsent: false }),
  });
}

/**
 * Capture the email, then redirect the user to the chosen character through
 * the RedTrack click router (clk.ourdreamnetwork.com/click?sub17=<chatSlug>).
 * Every click routes through RedTrack; no-cookie visitors are attributed to
 * the uniclick defaultcampaignid. The redirect NEVER awaits saveEmail
 * (capture loss is acceptable; redirect drop-off is not — see CLAUDE.md).
 */
export async function captureAndRedirect(email: string, chatSlug: string): Promise<void> {
  track("quiz_email_captured", { source: "ai-roleplay", email_provided: true });
  saveEmail(email).catch((e) => console.warn("[save-email] failed:", e));

  const clickid = readClickid();
  // Merge first-touch attribution that TrackingCapture persisted to
  // localStorage on landing — so gclid/utm/etc. survive internal navigation
  // (e.g. catalogue → character page → click), not just direct ad landings.
  const inbound = mergePersistedWithUrl(new URLSearchParams(window.location.search));
  // Always fetch _gl (sub19) — both paid and organic clicks hop to ourdream.ai
  // through RedTrack, so GA4 session continuity needs the linker either way.
  const gl = await getGlValue();
  const url = buildRedirectUrl({ chatSlug, clickid, gl, inbound });

  track("quiz_redirect", { source: "ai-roleplay", redirect_url: url, has_clickid: !!clickid });

  window.location.href = url;
}
