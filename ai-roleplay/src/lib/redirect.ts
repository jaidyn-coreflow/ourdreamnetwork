/**
 * Build the outbound URL that the email gate redirects to after capture.
 *
 * Mirrors public/index.html's redirectToRedtrack(), but the destination is
 * a per-character ourdream.ai/chat/<slug> URL instead of /create.
 *
 *   PAID   (clickid present): clk.ourdreamnetwork.com/click/<N> with
 *           sub11=ai-roleplay (source label), sub12=<chatSlug> (the chat
 *           path the RedTrack slot forwards to), sub19=<_gl> (GA4 linker),
 *           clickid=<cookie>. The RedTrack slot's destination must be
 *           configured as https://ourdream.ai/chat/{sub12}?...&clickid={clickid}
 *           &tracker=rt&_gl={sub19}. See spec "Open external dependency".
 *   ORGANIC (no clickid): RedTrack rejects empty clickid, so go direct to
 *           https://ourdream.ai/chat/<slug> with ref=googlecpc&tracker=rt.
 *           Caller GTM-decorates this URL for _gl (getDecoratedUrl).
 */

// clk.ourdreamnetwork.com/click/2 — DEDICATED chat-redirect slot. Configure
// this slot in the RedTrack dashboard before the paid path attributes.
// (index.html uses /click/1 for the /create quiz; do not reuse it.)
export const REDTRACK_BASE = "https://clk.ourdreamnetwork.com/click/2";

const OURDREAM_CHAT_BASE = "https://ourdream.ai/chat/";

export interface RedirectInputs {
  chatSlug: string;
  clickid: string;
  gl: string;
  inbound: URLSearchParams;
}

export function buildRedirectUrl({ chatSlug, clickid, gl, inbound }: RedirectInputs): string {
  const params = new URLSearchParams();
  inbound.forEach((v, k) => {
    if (!params.has(k)) params.set(k, v);
  });

  if (clickid) {
    params.set("sub11", "ai-roleplay");
    params.set("sub12", chatSlug);
    if (gl) params.set("sub19", gl);
    params.set("clickid", clickid);
    return REDTRACK_BASE + "?" + params.toString();
  }

  params.set("ref", "googlecpc");
  params.set("tracker", "rt");
  return OURDREAM_CHAT_BASE + chatSlug + "?" + params.toString();
}
