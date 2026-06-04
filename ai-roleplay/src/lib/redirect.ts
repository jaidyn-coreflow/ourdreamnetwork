/**
 * Build the outbound URL that the email gate redirects to after capture.
 *
 * Every click — paid and organic — routes through the RedTrack REDIRECT
 * tracking link for the "Google Ads - AI Roleplay" campaign, which forwards
 * to the "Ourdream Character Chat" offer (ourdream.ai/chat/{sub17}). Params:
 *   - sub17   = <chatSlug>        the character to open (per-character)
 *   - sub11   = "ai-roleplay"     source label for RedTrack reports
 *   - clickid = <rtkclickid>      paid click linkage (omitted when absent)
 *   - sub19   = <_gl>             GA4 cross-domain linker (omitted when absent)
 *   - plus any inbound utm_, gclid, … params forwarded through
 *
 * The campaign id lives in the URL PATH (this is RedTrack's redirect-link
 * format). The `cmpid` query param is the *universal-script* mechanism (used
 * in the Google Ads final-URL-suffix on the landing page) and is ignored by
 * the /click redirect endpoint — hence the path-based link here.
 */

// RedTrack REDIRECT link for the "Google Ads - AI Roleplay" campaign
// (campaign id 6a20d8a94628b3bfe702b2c1) → "Ourdream Character Chat" offer.
export const REDTRACK_BASE = "https://clk.ourdreamnetwork.com/6a20d8a94628b3bfe702b2c1";

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
