/**
 * Build the outbound URL that the email gate redirects to after capture.
 *
 * Every click — paid and organic — routes through the RedTrack REDIRECT
 * tracking link for the "Google Ads - AI Roleplay" campaign. Params:
 *   - sub17   = "Female POV"      segment label (shared by all characters;
 *                                 emitted as sub17=Female+POV in the query)
 *   - clickid = <rtkclickid>      paid click linkage (omitted when absent)
 *   - sub19   = <_gl>             GA4 cross-domain linker (omitted when absent)
 *   - plus any inbound utm_, gclid, … params forwarded through
 *
 * The captured email is appended as a URL fragment (#prefill_email=…),
 * encodeURIComponent-encoded so a "+" in plus-addresses survives (%2B) rather
 * than decoding to a space, and placed AFTER all query params so the
 * destination can read it from location.hash.
 *
 * The campaign id lives in the URL PATH (RedTrack's redirect-link format).
 */

// RedTrack REDIRECT link for the "Google Ads - AI Roleplay" campaign
// (campaign id 6a20d8a94628b3bfe702b2c1).
export const REDTRACK_BASE = "https://clk.ourdreamnetwork.com/6a20d8a94628b3bfe702b2c1";

export interface RedirectInputs {
  /**
   * Per-character chat slug. Retained for future per-character routing; not
   * currently placed in the URL — all traffic shares sub17="Female POV".
   */
  chatSlug: string;
  /** Captured email — appended as the #prefill_email fragment. */
  email: string;
  clickid: string;
  gl: string;
  inbound: URLSearchParams;
}

export function buildRedirectUrl({ email, clickid, gl, inbound }: RedirectInputs): string {
  const params = new URLSearchParams();
  inbound.forEach((v, k) => {
    if (!params.has(k)) params.set(k, v);
  });

  params.set("sub17", "Female POV");
  if (gl) params.set("sub19", gl);
  if (clickid) params.set("clickid", clickid);

  // Email fragment, after all query params. encodeURIComponent keeps a "+" in
  // plus-addresses intact (%2B) instead of letting it decode to a space.
  const fragment = email ? `#prefill_email=${encodeURIComponent(email)}` : "";
  return REDTRACK_BASE + "?" + params.toString() + fragment;
}
