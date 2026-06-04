/**
 * Build the outbound URL that the email gate redirects to after capture.
 *
 * EVERY click — paid and organic — routes through RedTrack's click router
 * at clk.ourdreamnetwork.com/click, carrying the character's chat slug in
 * `sub17` (unique per character; the RedTrack slot forwards it to
 * ourdream.ai/chat/<sub17>). Params:
 *   - sub17   = <chatSlug>        the character to open (per-character)
 *   - sub11   = "ai-roleplay"     source label for RedTrack reports
 *   - clickid = <rtkclickid>      paid click linkage (omitted when absent)
 *   - sub19   = <_gl>             GA4 cross-domain linker (omitted when absent)
 *   - plus any inbound utm_, gclid, … params forwarded through
 *
 * The rtkclickid-store cookie is same-domain (cookiedomain=ourdreamnetwork.com),
 * so RedTrack also sees it on the request; we pass clickid explicitly to match
 * the proven index.html funnel. No-cookie visitors are attributed to the
 * uniclick `defaultcampaignid`.
 */

// clk.ourdreamnetwork.com/click — RedTrack click router. Its destination
// template forwards to https://ourdream.ai/chat/{sub17}?...&_gl={sub19}.
// (index.html's quiz uses /click/1; this chat funnel uses the default /click.)
export const REDTRACK_BASE = "https://clk.ourdreamnetwork.com/click";

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

  params.set("sub11", "ai-roleplay");
  params.set("sub17", chatSlug);
  if (gl) params.set("sub19", gl);
  if (clickid) params.set("clickid", clickid);

  return REDTRACK_BASE + "?" + params.toString();
}
