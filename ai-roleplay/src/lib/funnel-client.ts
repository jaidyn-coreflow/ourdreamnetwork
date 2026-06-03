"use client";

import { buildRedirectUrl } from "@/lib/redirect";

function readClickid(): string {
  const m = document.cookie.match(/(?:^|;\s*)rtkclickid-store=([^;]+)/);
  return m ? decodeURIComponent(m[1]) : "";
}

/** Decorate a dummy ourdream.ai link, extract the _gl payload (paid sub19). */
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

/** GTM-decorate a full URL (organic path needs _gl on the final chat URL). */
function getDecoratedUrl(baseUrl: string): Promise<string> {
  return new Promise((resolve) => {
    const a = document.createElement("a");
    a.href = baseUrl;
    a.style.cssText = "position:fixed;left:-9999px;";
    document.body.appendChild(a);
    a.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
    setTimeout(() => {
      const decorated = a.href;
      document.body.removeChild(a);
      resolve(decorated);
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
 * Capture the email, then redirect to the character's chat URL through the
 * RedTrack funnel. The redirect NEVER awaits saveEmail (capture loss is
 * acceptable; redirect drop-off is not — see CLAUDE.md).
 */
export async function captureAndRedirect(email: string, chatSlug: string): Promise<void> {
  track("quiz_email_captured", { source: "ai-roleplay", email_provided: true });
  saveEmail(email).catch((e) => console.warn("[save-email] failed:", e));

  const clickid = readClickid();
  const inbound = new URLSearchParams(window.location.search);
  const gl = clickid ? await getGlValue() : "";
  const url = buildRedirectUrl({ chatSlug, clickid, gl, inbound });

  track("quiz_redirect", { source: "ai-roleplay", redirect_url: url, has_clickid: !!clickid });

  // Paid path already carries _gl via sub19; only organic needs decoration.
  const finalUrl = clickid ? url : await getDecoratedUrl(url);
  window.location.href = finalUrl;
}
