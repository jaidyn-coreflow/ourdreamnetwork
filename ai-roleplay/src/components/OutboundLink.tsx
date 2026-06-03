"use client";

import { Suspense, type AnchorHTMLAttributes, type ReactNode } from "react";
import { useSearchParams } from "next/navigation";
import { buildOurdreamUrl } from "@/lib/outbound";
import { mergePersistedWithUrl } from "@/lib/tracking-storage";

/* ────────────────────────────────────────────────────────────
 * OutboundLink
 *
 * Drop-in <a> replacement for any link to ourdream.ai.
 *
 * Param resolution order (highest priority wins):
 *   1. ref=romantasyai (always set, never overridable)
 *   2. extras (per-call wizard intent)
 *   3. persisted attribution from localStorage (first-write-wins)
 *   4. live inbound URL params
 *
 * Persisted attribution overrides live URL because the visitor's
 * FIRST inbound trackers are the canonical attribution. This matches
 * ourdream's own first-write-wins rule on profile.affiliateMetadata
 * and ensures both sides converge on the same campaign / clickid /
 * affiliate even after the visitor browses internally.
 * ──────────────────────────────────────────────────────────── */

interface Props extends AnchorHTMLAttributes<HTMLAnchorElement> {
  /** Path on ourdream.ai, e.g. "/create" – defaults to "/" */
  path?: string;
  /**
   * Explicit overrides applied to the outbound URL. Used by the wizard
   * to force `gender` / `style` / etc. regardless of inbound state.
   * `ref` cannot be overridden \u2014 see buildOurdreamUrl.
   */
  extras?: Record<string, string | null | undefined>;
  children: ReactNode;
}

function InnerLink({ path = "/", extras, children, ...rest }: Props) {
  const searchParams = useSearchParams();
  /* Merge persisted attribution (localStorage, first-write-wins) on top
   * of the live URL so trackers survive internal navigation between the
   * landing page and the eventual outbound click. */
  const merged = mergePersistedWithUrl(searchParams);
  const href = buildOurdreamUrl(path, merged, extras);

  return (
    <a
      href={href}
      target="_blank"
      /* `noopener` for target=_blank security; `noreferrer` is deliberately
       * omitted so the Referrer-Policy: unsafe-url header in next.config.js
       * actually flows the Referer to ourdream.ai for first-party analytics. */
      rel="noopener"
      {...rest}
    >
      {children}
    </a>
  );
}

/**
 * Wrapped in <Suspense> so useSearchParams() doesn't force the
 * entire tree into client-side rendering during static generation.
 */
export function OutboundLink(props: Props) {
  /* Fallback renders a plain link without inbound pass-through OR
   * persisted attribution (no window during SSR). It still honours
   * wizard-supplied extras so funnel preselect survives even if SSR
   * streams ahead of useSearchParams hydration. The hydration window
   * is sub-second; clicks on the fallback link are vanishingly rare. */
  const fallbackHref = buildOurdreamUrl(props.path, undefined, props.extras);

  return (
    <Suspense
      fallback={
        <a
          href={fallbackHref}
          target="_blank"
          rel="noopener"
          className={props.className}
        >
          {props.children}
        </a>
      }
    >
      <InnerLink {...props} />
    </Suspense>
  );
}
