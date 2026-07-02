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

/** The Google Ads conversion payload. Fired on valid email submit. */
export function buildLeadEvent(email: string) {
  return {
    event: "generate_lead" as const,
    currency: "USD" as const,
    value: 1.0,
    user_data: { email },
  };
}

/** Fire-and-forget save; never blocks the redirect. */
function saveEmail(email: string): Promise<unknown> {
  return fetch("/api/save-email", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, mode: "experience", marketingConsent: false }),
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
  // generate_lead is the primary Google Ads conversion — must fire on valid
  // submit BEFORE the redirect (see CLAUDE.md). It is the only GTM-wired event
  // in this funnel.
  track("generate_lead", buildLeadEvent(email));
  saveEmail(email).catch((e) => console.warn("[save-email] failed:", e));

  const clickid = readClickid();
  const inbound = mergePersistedWithUrl(new URLSearchParams(window.location.search));
  const gl = await getGlValue();
  const url = buildRedirectUrl({ chatSlug, email, clickid, gl, inbound });

  window.location.href = url;
}
