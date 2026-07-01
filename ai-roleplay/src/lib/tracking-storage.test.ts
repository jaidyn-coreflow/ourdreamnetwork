import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  _trackingInternals,
  captureTrackingParams,
  mergePersistedWithUrl,
  readPersistedTracking,
} from "./tracking-storage";

const { STORAGE_KEY } = _trackingInternals;

/* ── Minimal in-memory localStorage stub ───────────────────────────────
 *
 * Vitest runs in a node environment by default. Rather than switching the
 * whole suite to jsdom (heavier), we install a small stub on globalThis.
 * The stub mirrors the read/write/remove surface of localStorage and is
 * cleared between tests.
 */

class StorageStub {
  private store = new Map<string, string>();
  getItem(k: string): string | null {
    return this.store.has(k) ? (this.store.get(k) as string) : null;
  }
  setItem(k: string, v: string): void {
    this.store.set(k, v);
  }
  removeItem(k: string): void {
    this.store.delete(k);
  }
  clear(): void {
    this.store.clear();
  }
  /* Test helper: simulate a quota error on the next setItem. */
  failNextWrite = false;
}

let stub: StorageStub;
let originalWindow: typeof globalThis.window | undefined;

beforeEach(() => {
  stub = new StorageStub();
  originalWindow = (globalThis as { window?: typeof globalThis.window }).window;
  /* Patch a window-shaped object onto globalThis. We only need
   * window.localStorage for the module under test. */
  (globalThis as unknown as { window?: { localStorage: StorageStub } }).window = {
    localStorage: new Proxy(stub, {
      get(target, prop) {
        if (prop === "setItem" && target.failNextWrite) {
          target.failNextWrite = false;
          return () => {
            throw new Error("QuotaExceededError");
          };
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return (target as any)[prop].bind(target);
      },
    }) as unknown as StorageStub,
  };
});

afterEach(() => {
  if (originalWindow === undefined) {
    delete (globalThis as { window?: unknown }).window;
  } else {
    (globalThis as { window?: typeof globalThis.window }).window =
      originalWindow;
  }
  vi.restoreAllMocks();
});

/* ── readPersistedTracking ─────────────────────────────────────────── */

describe("readPersistedTracking", () => {
  it("returns empty map when storage is empty", () => {
    expect(readPersistedTracking()).toEqual({});
  });

  it("returns the stored map when valid JSON is present", () => {
    stub.setItem(
      STORAGE_KEY,
      JSON.stringify({ clickid: "abc", utm_source: "meta" }),
    );
    expect(readPersistedTracking()).toEqual({
      clickid: "abc",
      utm_source: "meta",
    });
  });

  it("returns empty map on corrupted JSON (never throws)", () => {
    stub.setItem(STORAGE_KEY, "not valid json {");
    expect(readPersistedTracking()).toEqual({});
  });

  it("returns empty map when stored value is not an object", () => {
    stub.setItem(STORAGE_KEY, JSON.stringify("a string"));
    expect(readPersistedTracking()).toEqual({});
  });

  it("returns empty map when stored value is an array", () => {
    stub.setItem(STORAGE_KEY, JSON.stringify(["clickid", "abc"]));
    expect(readPersistedTracking()).toEqual({});
  });

  it("filters out non-string values defensively", () => {
    stub.setItem(
      STORAGE_KEY,
      JSON.stringify({
        clickid: "abc",
        utm_source: 42, // bogus
        sub1: null, // bogus
        sub2: "real",
        empty: "", // empty string
      }),
    );
    expect(readPersistedTracking()).toEqual({
      clickid: "abc",
      sub2: "real",
    });
  });

  it("is SSR-safe (returns empty when window is undefined)", () => {
    delete (globalThis as { window?: unknown }).window;
    expect(readPersistedTracking()).toEqual({});
  });
});

/* ── captureTrackingParams ─────────────────────────────────────────── */

describe("captureTrackingParams", () => {
  it("writes new attribution values to storage", () => {
    captureTrackingParams(
      new URLSearchParams("clickid=abc&utm_source=meta&fbclid=xyz"),
    );
    expect(JSON.parse(stub.getItem(STORAGE_KEY)!)).toEqual({
      clickid: "abc",
      utm_source: "meta",
      fbclid: "xyz",
    });
  });

  it("respects first-write-wins (existing key not overwritten)", () => {
    stub.setItem(
      STORAGE_KEY,
      JSON.stringify({ clickid: "first", utm_source: "meta" }),
    );
    captureTrackingParams(
      new URLSearchParams("clickid=second&utm_source=google&fbclid=new"),
    );
    /* clickid + utm_source preserve their first values, fbclid is new
     * so it gets added. */
    expect(JSON.parse(stub.getItem(STORAGE_KEY)!)).toEqual({
      clickid: "first",
      utm_source: "meta",
      fbclid: "new",
    });
  });

  it("drops macro-guarded values on capture", () => {
    captureTrackingParams(
      new URLSearchParams(
        "clickid={transaction_id}&utm_source={utm_source}&fbclid=real",
      ),
    );
    /* The two macros must NOT land in storage; only the real value does. */
    expect(JSON.parse(stub.getItem(STORAGE_KEY)!)).toEqual({
      fbclid: "real",
    });
  });

  it("does NOT persist funnel preselects (per-session intent)", () => {
    /* gender, style, promo, etc. should never be captured to storage
     * because they represent per-session funnel intent rather than
     * attribution. Persisting them would cause stale funnel values to
     * leak into outbound clicks across sessions. */
    captureTrackingParams(
      new URLSearchParams(
        "clickid=keep&gender=female&style=anime&promo=abc&closed=true",
      ),
    );
    expect(JSON.parse(stub.getItem(STORAGE_KEY)!)).toEqual({
      clickid: "keep",
    });
  });

  it("does NOT persist params outside the allow-list", () => {
    captureTrackingParams(
      new URLSearchParams("clickid=keep&random=junk&internal=xyz"),
    );
    expect(JSON.parse(stub.getItem(STORAGE_KEY)!)).toEqual({
      clickid: "keep",
    });
  });

  it("captures Everflow sub-params and Google Ads macros", () => {
    captureTrackingParams(
      new URLSearchParams(
        "sub1=a&sub2=b&sub3=c&keyword=ai+girlfriend&campaignid=999",
      ),
    );
    expect(JSON.parse(stub.getItem(STORAGE_KEY)!)).toEqual({
      sub1: "a",
      sub2: "b",
      sub3: "c",
      keyword: "ai girlfriend",
      campaignid: "999",
    });
  });

  it("is a no-op when no allow-listed params are present", () => {
    captureTrackingParams(new URLSearchParams("random=x&unknown=y"));
    expect(stub.getItem(STORAGE_KEY)).toBeNull();
  });

  it("returns the merged map for caller observability", () => {
    stub.setItem(STORAGE_KEY, JSON.stringify({ clickid: "first" }));
    const result = captureTrackingParams(
      new URLSearchParams("clickid=second&fbclid=new"),
    );
    expect(result).toEqual({ clickid: "first", fbclid: "new" });
  });

  it("accepts a plain Record<string, string> as source", () => {
    captureTrackingParams({ clickid: "abc", utm_source: "meta" });
    expect(JSON.parse(stub.getItem(STORAGE_KEY)!)).toEqual({
      clickid: "abc",
      utm_source: "meta",
    });
  });

  it("survives localStorage write failures (private mode / quota)", () => {
    stub.failNextWrite = true;
    /* Should not throw even though setItem will reject. */
    expect(() =>
      captureTrackingParams(new URLSearchParams("clickid=abc")),
    ).not.toThrow();
  });

  it("is SSR-safe (no-op when window is undefined)", () => {
    delete (globalThis as { window?: unknown }).window;
    expect(() =>
      captureTrackingParams(new URLSearchParams("clickid=abc")),
    ).not.toThrow();
  });
});

/* ── mergePersistedWithUrl ─────────────────────────────────────────── */

describe("mergePersistedWithUrl", () => {
  it("returns just the URL params when storage is empty", () => {
    const merged = mergePersistedWithUrl(
      new URLSearchParams("clickid=live&gender=female"),
    );
    expect(merged.get("clickid")).toBe("live");
    expect(merged.get("gender")).toBe("female");
  });

  it("returns just the persisted map when no URL params are supplied", () => {
    stub.setItem(STORAGE_KEY, JSON.stringify({ clickid: "stored" }));
    const merged = mergePersistedWithUrl();
    expect(merged.get("clickid")).toBe("stored");
  });

  it("persisted attribution OVERRIDES live URL values (first-write-wins)", () => {
    stub.setItem(
      STORAGE_KEY,
      JSON.stringify({ clickid: "first", utm_source: "meta" }),
    );
    const merged = mergePersistedWithUrl(
      new URLSearchParams("clickid=second&utm_source=google"),
    );
    expect(merged.get("clickid")).toBe("first");
    expect(merged.get("utm_source")).toBe("meta");
  });

  it("preserves live URL values for non-persisted keys (e.g. funnel preselects)", () => {
    stub.setItem(STORAGE_KEY, JSON.stringify({ clickid: "stored" }));
    const merged = mergePersistedWithUrl(
      new URLSearchParams("gender=female&style=anime&promo=spring"),
    );
    /* Funnel preselects from URL survive untouched. */
    expect(merged.get("gender")).toBe("female");
    expect(merged.get("style")).toBe("anime");
    expect(merged.get("promo")).toBe("spring");
    /* Stored attribution is layered on top. */
    expect(merged.get("clickid")).toBe("stored");
  });

  it("handles null URL params gracefully", () => {
    stub.setItem(STORAGE_KEY, JSON.stringify({ clickid: "stored" }));
    const merged = mergePersistedWithUrl(null);
    expect(merged.get("clickid")).toBe("stored");
  });
});
