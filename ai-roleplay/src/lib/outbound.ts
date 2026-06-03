/**
 * Build a tracking-safe URL to ourdream.ai.
 *
 * Behaviour:
 *  - Always sets `ref=romantasyai` (last-touch attribution to this site).
 *  - Forwards every documented affiliate / ad-platform / funnel param
 *    from the current page URL when present.
 *  - Preserves casing for params that are case-sensitive at ourdream
 *    (`TRid`, `TSid`).
 *  - Never adds UTMs we didn't receive.
 *
 * Param categories (see docs/mvp.md §6):
 *   1. Affiliate / click-ID tracking — drives postbacks
 *   2. Everflow sub-params (sub1–sub5) — landing routing + click-ID
 *   3. UTM + ad-platform click IDs — analytics + Conversions APIs
 *   4. Google Ads value-track macros — keyword-level reporting
 *   5. Funnel / UX params (gender, style, promo, etc.) — preselects
 */

const OURDREAM_BASE = "https://ourdream.ai";

/** First-touch reattribution to romantasyai.com itself. */
const SITE_REF = "romantasyai";

/**
 * Matches values that are exactly one curly-wrapped token, e.g.
 * "{transaction_id}", "{offer_id}", "{12}". These are unsubstituted
 * affiliate-network macros \u2014 the upstream link template never had its
 * placeholders resolved by the network's tracking layer (often because
 * the link was clicked outside the network's redirect, e.g. from an
 * email forward, a bookmark, or a direct test).
 *
 * We never relay these to ourdream because doing so would poison their
 * first-write-wins attribution storage with junk values that look like
 * real click IDs but don't reconcile against any postback.
 *
 * Defensive on purpose: requires the value to be ENTIRELY one
 * brace-wrapped token. Values with braces in the middle (e.g.
 * "click_abc{12}xyz") are passed through untouched so we never strip
 * legitimate data that happens to contain braces.
 */
const UNFILLED_MACRO = /^\{[^}]+\}$/;

/** Exported helper so tracking-storage can apply the same guard. */
export function isUnfilledMacro(val: string): boolean {
  return UNFILLED_MACRO.test(val);
}

/* ── 1. Affiliate / click-ID params ──────────────────────────────── */
const AFFILIATE_PARAMS = [
  "click_id",     // Voluum-style click ID
  "clickid",      // Everflow / RedTrack / generic ad clickid
  "cid",          // Aylo
  "exotracker",   // ExoClick
  "aclid",        // TrafficJunky
  "adniumconv",   // Adnium
  "TRid",         // TwinRed (case-sensitive)
  "TSid",         // TrafficStars (case-sensitive)
  "tracker",      // routing flag (rt = RedTrack, 456 = Everflow)
  "affid",        // Affiliate ID (canonical inbound name)
  "aff_id",       // Everflow tracking-domain affiliate ID
  "dpo",          // DPO tracking
  "source",       // Traffic source / SFW funnel routing
  "reward",       // Reward type override
  "rdt_cid",      // Reddit Ads click ID
] as const;

/* ── 2. Everflow sub-parameters ──────────────────────────────────── */
const SUB_PARAMS = ["sub1", "sub2", "sub3", "sub4", "sub5"] as const;

/* ── 3. UTM + ad-platform click IDs ──────────────────────────────── */
const UTM_PARAMS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
] as const;

const AD_CLICK_IDS = [
  "fbclid",       // Meta
  "gclid",        // Google Ads
  "msclkid",      // Microsoft Ads
  "ttclid",       // TikTok Ads
] as const;

/* ── 4. Google Ads ValueTrack macros ─────────────────────────────── */
const GOOGLE_ADS_MACROS = [
  "adgroup",
  "keyword",
  "matchtype",
  "network",
  "device",
  "placement",
  "adposition",
  "loc_physical",
  "loc_interest",
  "campaignid",
  "adgroupid",
  "feeditemid",
  "targetid",
] as const;

/* ── 5. Funnel / UX preselects ───────────────────────────────────── */
const FUNNEL_PARAMS = [
  "gender",   // female | male | trans | any
  "style",    // sfw | nsfw | realistic | anime | any
  "promo",    // promo code (7-day localStorage on ourdream)
  "closed",   // closed-funnel state
  "signup",   // auto-open signup dialog
  "login",    // auto-open login dialog
  "upgrade",  // routes funnel users to upgrade page
] as const;

/**
 * Full pass-through list. Order is preserved when building the outbound URL,
 * which keeps the resulting query strings deterministic for snapshot tests
 * and human inspection in browser dev-tools.
 */
const PASSTHROUGH_PARAMS = [
  ...AFFILIATE_PARAMS,
  ...SUB_PARAMS,
  ...UTM_PARAMS,
  ...AD_CLICK_IDS,
  ...GOOGLE_ADS_MACROS,
  ...FUNNEL_PARAMS,
] as const;

/**
 * @param path     Path on ourdream.ai (default "/").
 * @param current  Inbound search params to forward (from useSearchParams or URL).
 * @param extras   Explicit overrides to set on the outbound URL (wizard-driven
 *                 funnel preselects, e.g. {gender: "female", style: "anime"}).
 *                 `extras` is applied LAST so it always wins over inbound
 *                 conflicts \u2014 user choices in our wizard outrank stale URL state.
 *                 Empty / nullish values are skipped.
 */
export function buildOurdreamUrl(
  path = "/",
  current?: URLSearchParams | Record<string, string>,
  extras?: Record<string, string | null | undefined>,
): string {
  const url = new URL(path, OURDREAM_BASE);

  if (current) {
    const sp =
      current instanceof URLSearchParams
        ? current
        : new URLSearchParams(current);

    for (const key of PASSTHROUGH_PARAMS) {
      const val = sp.get(key);
      /* Drop unfilled macros (e.g. "{transaction_id}") so we don't
       * poison ourdream's localStorage with garbage that fails postback
       * reconciliation. See UNFILLED_MACRO comment above. */
      if (val && !isUnfilledMacro(val)) {
        url.searchParams.set(key, val);
      }
    }
  }

  if (extras) {
    for (const [key, val] of Object.entries(extras)) {
      /* `ref` is the site's identity \u2014 callers can never override it via
       * extras, even by mistake. Attribution must not be a footgun. */
      if (key === "ref") continue;
      /* Same macro guard applied to wizard extras. Defence in depth: our
       * own code shouldn't generate macros, but if upstream data leaks
       * into extras it shouldn't break attribution either. */
      if (val && !isUnfilledMacro(val)) {
        url.searchParams.set(key, val);
      }
    }
  }

  /* `ref=romantasyai` fires ONLY when no affiliate is identified on the
   * outbound URL. Rationale:
   *
   *   - Affiliate visitor (affid / aff_id present): the affiliate's
   *     attribution is the canonical truth. Layering ref=romantasyai on
   *     top creates a duplicate attribution claim that risks confusing
   *     ourdream's profile.affiliateMetadata storage and any reporting
   *     that groups by ref vs affid.
   *
   *   - Organic / direct visitor (no affid, no aff_id): ref=romantasyai
   *     is the only signal that this user came from us. Without it we'd
   *     lose attribution for every non-affiliate-driven conversion.
   *
   * Ordered last so the `current` and `extras` loops have already
   * resolved whether affid / aff_id will be present in the final URL.
   * Macro-guarded values were already dropped above, so an unfilled
   * `affid={12}` correctly counts as "no affid present" here and ref
   * still fires as the fallback.
   */
  if (!url.searchParams.has("affid") && !url.searchParams.has("aff_id")) {
    url.searchParams.set("ref", SITE_REF);
  }

  return url.toString();
}

/* Exported for tests + observability. Not part of the public API contract. */
export const _internals = {
  AFFILIATE_PARAMS,
  SUB_PARAMS,
  UTM_PARAMS,
  AD_CLICK_IDS,
  GOOGLE_ADS_MACROS,
  FUNNEL_PARAMS,
  PASSTHROUGH_PARAMS,
  OURDREAM_BASE,
  SITE_REF,
};
