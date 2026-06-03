"use client";

import { Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { captureTrackingParams } from "@/lib/tracking-storage";

/**
 * Mounted once in the root layout. On every page load with new search
 * params, captures the allow-listed attribution params into localStorage
 * with first-write-wins semantics so they survive internal navigation.
 *
 * Why this matters:
 *   `next/link` does NOT preserve query strings across internal nav.
 *   Without this capture layer, a visitor who lands on
 *   `/?clickid=abc&utm_source=meta` and then browses to a character
 *   page before clicking out to ourdream loses the entire tracking
 *   chain at the first internal click. With the capture, OutboundLink
 *   replays the original attribution on every outbound regardless of
 *   how many internal hops happened first.
 *
 * Renders nothing.
 */
function CaptureInner() {
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!searchParams) return;
    captureTrackingParams(searchParams);
  }, [searchParams]);

  return null;
}

/**
 * Suspense wrapper so `useSearchParams()` doesn't force the entire
 * static-prerendered tree into client-side rendering during build.
 * The fallback renders nothing, so there's no visual cost.
 */
export function TrackingCapture() {
  return (
    <Suspense fallback={null}>
      <CaptureInner />
    </Suspense>
  );
}
