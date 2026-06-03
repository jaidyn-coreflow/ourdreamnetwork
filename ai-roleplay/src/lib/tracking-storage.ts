/**
 * First-write-wins persistent capture of allow-listed inbound tracking
 * params.
 *
 * Why this exists:
 *   `next/link` does not preserve query strings across internal
 *   navigation. A visitor who lands on `/?clickid=abc&utm_source=meta`
 *   and then browses to a character page before clicking out to ourdream
 *   would otherwise lose the entire tracking chain by the time the
 *   outbound click fires. This module captures inbound trackers on first
 *   load and replays them on every subsequent outbound click.
 *
 * Attribution model:
 *   First-write-wins per key. This deliberately mirrors ourdream's own
 *   first-write-wins rule on `profile.affiliateMetadata` so the chain
 *   stays consistent: whichever clickid / utm / affiliate ourdream sees
 *   FIRST is the one that gets credit, and our localStorage holds the
 *   same first values across the visitor's lifetime on the site.
 *
 * Scope:
 *   Only attribution-class params are persisted (affiliate IDs, click
 *   IDs, sub-params, UTMs, ad-platform IDs, Google Ads ValueTrack
 *   macros). Funnel preselects (gender, style, promo, etc.) are
 *   intentionally NOT persisted because they represent per-session
 *   intent rather than attribution; persisting them would cause stale
 *   funnel values to leak across visits.
 *
 * Macro guard:
 *   Values matching the `isUnfilledMacro` pattern (e.g. "{transaction_id}",
 *   "{12}") are silently dropped on capture. Storing them would defeat
 *   the purpose of the macro guard in `buildOurdreamUrl`.
 *
 * Storage shape:
 *   Single key (`romantasyai.tracking`) holding a JSON-encoded
 *   Record<string, string>. One key + one parse minimises localStorage
 *   reads at outbound-click time.
 */

import { _internals, isUnfilledMacro } from "./outbound";

const STORAGE_KEY = "romantasyai.tracking";

/* Attribution-class subset of PASSTHROUGH_PARAMS. Funnel preselects are
 * deliberately excluded \u2014 see module-level docstring. */
const PERSISTED_PARAMS = [
  ..._internals.AFFILIATE_PARAMS,
  ..._internals.SUB_PARAMS,
  ..._internals.UTM_PARAMS,
  ..._internals.AD_CLICK_IDS,
  ..._internals.GOOGLE_ADS_MACROS,
] as const;

export type TrackingMap = Record<string, string>;

/* ── Storage primitives ────────────────────────────────────────────── */

/**
 * Read the persisted tracking map. Returns an empty map on SSR (no
 * window) or when storage is empty / corrupted / disabled.
 */
export function readPersistedTracking(): TrackingMap {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return {};
    }
    /* Defensive: ensure we only ever return string values. */
    const out: TrackingMap = {};
    for (const [k, v] of Object.entries(parsed as Record<string, unknown>)) {
      if (typeof v === "string" && v.length > 0) out[k] = v;
    }
    return out;
  } catch {
    return {};
  }
}

function writePersistedTracking(map: TrackingMap): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  } catch {
    /* localStorage may be full / disabled / private mode. Failing silent
     * is correct: tracking enrichment is best-effort and must never
     * block the user's actual interaction with the page. */
  }
}

/* ── Public API ────────────────────────────────────────────────────── */

/**
 * Capture allow-listed attribution params from a URL or search-param
 * source into localStorage with first-write-wins semantics.
 *
 *  - Only keys in PERSISTED_PARAMS are considered.
 *  - Macro-guarded values (e.g. "{12}") are dropped, never persisted.
 *  - Existing keys are NEVER overwritten (first-write-wins).
 *  - SSR-safe: no-ops without a window.
 *
 * Returns the merged map (existing + newly written) so callers can
 * inspect or test the result without a follow-up read.
 */
export function captureTrackingParams(
  source: URLSearchParams | Record<string, string>,
): TrackingMap {
  const sp =
    source instanceof URLSearchParams
      ? source
      : new URLSearchParams(source);

  const existing = readPersistedTracking();
  let dirty = false;

  for (const key of PERSISTED_PARAMS) {
    const val = sp.get(key);
    if (!val) continue;
    if (isUnfilledMacro(val)) continue;
    if (existing[key]) continue; // first-write-wins
    existing[key] = val;
    dirty = true;
  }

  if (dirty) writePersistedTracking(existing);
  return existing;
}

/**
 * Merge persisted attribution + a live URLSearchParams into one map
 * suitable for handing to `buildOurdreamUrl(...)`.
 *
 * Persisted values WIN over live URL values for the keys that are
 * persisted (preserving first-write-wins). Live URL values are kept for
 * any non-persisted keys (funnel preselects, anything else passing
 * through).
 */
export function mergePersistedWithUrl(
  urlParams?: URLSearchParams | null,
): URLSearchParams {
  const merged = new URLSearchParams();
  if (urlParams) {
    urlParams.forEach((value, key) => merged.set(key, value));
  }
  const persisted = readPersistedTracking();
  for (const [key, value] of Object.entries(persisted)) {
    /* First-write-wins: persisted attribution overrides any live URL
     * value for the same key. */
    merged.set(key, value);
  }
  return merged;
}

/* ── Test-only exports ─────────────────────────────────────────────── */

export const _trackingInternals = {
  STORAGE_KEY,
  PERSISTED_PARAMS,
};
