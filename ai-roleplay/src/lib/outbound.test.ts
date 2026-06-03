import { describe, expect, it } from "vitest";
import { _internals, buildOurdreamUrl, isUnfilledMacro } from "./outbound";

const { OURDREAM_BASE, SITE_REF, PASSTHROUGH_PARAMS } = _internals;

/* ── Helpers ─────────────────────────────────────────────────────── */

function urlOf(href: string) {
  return new URL(href);
}

function paramsOf(href: string) {
  return urlOf(href).searchParams;
}

/* ── Suites ──────────────────────────────────────────────────────── */

describe("buildOurdreamUrl — base behaviour", () => {
  it("defaults to ourdream.ai root", () => {
    const url = urlOf(buildOurdreamUrl());
    expect(url.origin).toBe(OURDREAM_BASE);
    expect(url.pathname).toBe("/");
  });

  it("respects custom paths", () => {
    expect(urlOf(buildOurdreamUrl("/create")).pathname).toBe("/create");
    expect(urlOf(buildOurdreamUrl("/chat/the-iron-commander")).pathname).toBe(
      "/chat/the-iron-commander",
    );
  });

  it("sets ref=romantasyai when no affiliate is identified", () => {
    expect(paramsOf(buildOurdreamUrl()).get("ref")).toBe(SITE_REF);
    expect(paramsOf(buildOurdreamUrl("/create")).get("ref")).toBe(SITE_REF);
  });

  it("overrides any inbound ref with romantasyai (last-touch) when no affid", () => {
    const sp = new URLSearchParams("ref=joe81");
    expect(paramsOf(buildOurdreamUrl("/", sp)).get("ref")).toBe(SITE_REF);
  });

  it("discards inbound ref entirely when affid is present", () => {
    /* Affiliate's affid is the canonical attribution; the inbound ref
     * is not in PASSTHROUGH_PARAMS so it's never preserved, and our
     * default ref is suppressed because affid wins. */
    const sp = new URLSearchParams("ref=joe81&affid=1456");
    const out = paramsOf(buildOurdreamUrl("/", sp));
    expect(out.has("ref")).toBe(false);
    expect(out.get("affid")).toBe("1456");
  });

  it("never adds passthrough params that weren't on the inbound URL", () => {
    const out = paramsOf(buildOurdreamUrl());
    for (const key of PASSTHROUGH_PARAMS) {
      expect(out.has(key)).toBe(false);
    }
  });
});

describe("buildOurdreamUrl — affiliate / click-ID pass-through", () => {
  it("forwards Everflow clickid + tracker", () => {
    const sp = new URLSearchParams({ tracker: "456", clickid: "ef_abc123" });
    const out = paramsOf(buildOurdreamUrl("/create", sp));
    expect(out.get("tracker")).toBe("456");
    expect(out.get("clickid")).toBe("ef_abc123");
  });

  it("forwards every documented affiliate-network click ID", () => {
    const sp = new URLSearchParams({
      click_id: "voluum_1",
      cid: "aylo_1",
      exotracker: "exo_1",
      aclid: "tj_1",
      adniumconv: "adn_1",
      affid: "9001",
      aff_id: "ef_9001",
      dpo: "dpo_1",
      source: "reddit",
      reward: "trial",
      rdt_cid: "reddit_1",
    });
    const out = paramsOf(buildOurdreamUrl("/create", sp));
    expect(out.get("click_id")).toBe("voluum_1");
    expect(out.get("cid")).toBe("aylo_1");
    expect(out.get("exotracker")).toBe("exo_1");
    expect(out.get("aclid")).toBe("tj_1");
    expect(out.get("adniumconv")).toBe("adn_1");
    expect(out.get("affid")).toBe("9001");
    expect(out.get("aff_id")).toBe("ef_9001");
    expect(out.get("dpo")).toBe("dpo_1");
    expect(out.get("source")).toBe("reddit");
    expect(out.get("reward")).toBe("trial");
    expect(out.get("rdt_cid")).toBe("reddit_1");
  });

  it("preserves case for TRid (TwinRed) and TSid (TrafficStars)", () => {
    const sp = new URLSearchParams("TRid=tr_1&TSid=ts_1");
    const href = buildOurdreamUrl("/create", sp);
    /* URLSearchParams.get is case-sensitive — confirm both casings round-trip */
    expect(paramsOf(href).get("TRid")).toBe("tr_1");
    expect(paramsOf(href).get("TSid")).toBe("ts_1");
    /* And that the literal substring appears in the URL (no lower-casing) */
    expect(href).toContain("TRid=tr_1");
    expect(href).toContain("TSid=ts_1");
    /* Lowercase variants must NOT have leaked into the output */
    expect(paramsOf(href).get("trid")).toBe(null);
    expect(paramsOf(href).get("tsid")).toBe(null);
  });

  it("ignores empty-string param values", () => {
    const sp = new URLSearchParams("clickid=&tracker=");
    const out = paramsOf(buildOurdreamUrl("/", sp));
    expect(out.has("clickid")).toBe(false);
    expect(out.has("tracker")).toBe(false);
  });
});

describe("buildOurdreamUrl — Everflow sub-parameters", () => {
  it("forwards sub1 through sub5", () => {
    const sp = new URLSearchParams({
      sub1: "female",
      sub2: "sfw",
      sub3: "fae-court",
      sub4: "dragon-rider",
      sub5: "tracker_click_xyz",
    });
    const out = paramsOf(buildOurdreamUrl("/create", sp));
    expect(out.get("sub1")).toBe("female");
    expect(out.get("sub2")).toBe("sfw");
    expect(out.get("sub3")).toBe("fae-court");
    expect(out.get("sub4")).toBe("dragon-rider");
    expect(out.get("sub5")).toBe("tracker_click_xyz");
  });

  it("preserves sub5 alongside conflicting clickid (both are forwarded)", () => {
    const sp = new URLSearchParams({
      clickid: "ef_native",
      sub5: "redtrack_native",
    });
    const out = paramsOf(buildOurdreamUrl("/create", sp));
    expect(out.get("clickid")).toBe("ef_native");
    expect(out.get("sub5")).toBe("redtrack_native");
  });
});

describe("buildOurdreamUrl — UTM + ad-platform click IDs", () => {
  it("forwards the full UTM set", () => {
    const sp = new URLSearchParams({
      utm_source: "newsletter",
      utm_medium: "email",
      utm_campaign: "april_drop",
      utm_term: "dragon",
      utm_content: "hero_cta",
    });
    const out = paramsOf(buildOurdreamUrl("/create", sp));
    expect(out.get("utm_source")).toBe("newsletter");
    expect(out.get("utm_medium")).toBe("email");
    expect(out.get("utm_campaign")).toBe("april_drop");
    expect(out.get("utm_term")).toBe("dragon");
    expect(out.get("utm_content")).toBe("hero_cta");
  });

  it("forwards Meta / Google / Microsoft / TikTok click IDs", () => {
    const sp = new URLSearchParams({
      fbclid: "fb_x",
      gclid: "g_x",
      msclkid: "ms_x",
      ttclid: "tt_x",
    });
    const out = paramsOf(buildOurdreamUrl("/create", sp));
    expect(out.get("fbclid")).toBe("fb_x");
    expect(out.get("gclid")).toBe("g_x");
    expect(out.get("msclkid")).toBe("ms_x");
    expect(out.get("ttclid")).toBe("tt_x");
  });
});

describe("buildOurdreamUrl — Google Ads ValueTrack macros", () => {
  it("forwards the full keyword-level macro set", () => {
    const sp = new URLSearchParams({
      adgroup: "romantasy_us",
      keyword: "ai girlfriend",
      matchtype: "p",
      network: "g",
      device: "m",
      placement: "youtube",
      adposition: "1t1",
      loc_physical: "9001959",
      loc_interest: "20174",
      campaignid: "111",
      adgroupid: "222",
      feeditemid: "333",
      targetid: "kwd-444",
    });
    const out = paramsOf(buildOurdreamUrl("/create", sp));
    expect(out.get("adgroup")).toBe("romantasy_us");
    expect(out.get("keyword")).toBe("ai girlfriend");
    expect(out.get("matchtype")).toBe("p");
    expect(out.get("network")).toBe("g");
    expect(out.get("device")).toBe("m");
    expect(out.get("placement")).toBe("youtube");
    expect(out.get("adposition")).toBe("1t1");
    expect(out.get("loc_physical")).toBe("9001959");
    expect(out.get("loc_interest")).toBe("20174");
    expect(out.get("campaignid")).toBe("111");
    expect(out.get("adgroupid")).toBe("222");
    expect(out.get("feeditemid")).toBe("333");
    expect(out.get("targetid")).toBe("kwd-444");
  });
});

describe("buildOurdreamUrl — funnel / UX preselects", () => {
  it("forwards gender + style for /create deeplink", () => {
    const sp = new URLSearchParams({ gender: "female", style: "realistic" });
    const out = paramsOf(buildOurdreamUrl("/create", sp));
    expect(out.get("gender")).toBe("female");
    expect(out.get("style")).toBe("realistic");
  });

  it("forwards promo / closed / signup / login / upgrade", () => {
    const sp = new URLSearchParams({
      promo: "FAEROSE25",
      closed: "yes",
      signup: "true",
      login: "true",
      upgrade: "true",
    });
    const out = paramsOf(buildOurdreamUrl("/create", sp));
    expect(out.get("promo")).toBe("FAEROSE25");
    expect(out.get("closed")).toBe("yes");
    expect(out.get("signup")).toBe("true");
    expect(out.get("login")).toBe("true");
    expect(out.get("upgrade")).toBe("true");
  });
});

describe("buildOurdreamUrl — input shape variants", () => {
  it("accepts a plain Record<string,string>", () => {
    const out = paramsOf(
      buildOurdreamUrl("/create", { gender: "male", clickid: "cid_1" }),
    );
    expect(out.get("gender")).toBe("male");
    expect(out.get("clickid")).toBe("cid_1");
  });

  it("accepts URLSearchParams", () => {
    const sp = new URLSearchParams("gender=trans&style=anime");
    const out = paramsOf(buildOurdreamUrl("/create", sp));
    expect(out.get("gender")).toBe("trans");
    expect(out.get("style")).toBe("anime");
  });

  it("ignores unknown / not-allow-listed params (e.g. utm-style typos)", () => {
    const sp = new URLSearchParams({
      utm_souce: "typo", // misspelled — should NOT be forwarded
      foo: "bar",
      __proto__: "hax",
    });
    const out = paramsOf(buildOurdreamUrl("/create", sp));
    expect(out.has("utm_souce")).toBe(false);
    expect(out.has("foo")).toBe(false);
    expect(out.has("__proto__")).toBe(false);
  });

  it("never strips or rewrites the chat path even with a complex query", () => {
    const sp = new URLSearchParams({
      tracker: "456",
      clickid: "x",
      sub5: "y",
      gender: "female",
    });
    const href = buildOurdreamUrl("/chat/the-storm-rider-crown-thorn-nG3Q3Sdgvj", sp);
    const url = urlOf(href);
    expect(url.pathname).toBe("/chat/the-storm-rider-crown-thorn-nG3Q3Sdgvj");
    expect(url.searchParams.get("ref")).toBe(SITE_REF);
    expect(url.searchParams.get("tracker")).toBe("456");
    expect(url.searchParams.get("clickid")).toBe("x");
    expect(url.searchParams.get("sub5")).toBe("y");
    expect(url.searchParams.get("gender")).toBe("female");
  });
});

describe("buildOurdreamUrl — extras (wizard-driven overrides)", () => {
  it("sets explicit extras on the outbound URL", () => {
    const out = paramsOf(
      buildOurdreamUrl("/create", undefined, {
        gender: "female",
        style: "realistic",
      }),
    );
    expect(out.get("gender")).toBe("female");
    expect(out.get("style")).toBe("realistic");
  });

  it("extras win over inbound conflicts (wizard outranks stale URL state)", () => {
    const sp = new URLSearchParams({ gender: "male", style: "anime" });
    const out = paramsOf(
      buildOurdreamUrl("/create", sp, {
        gender: "female",
        style: "realistic",
      }),
    );
    expect(out.get("gender")).toBe("female");
    expect(out.get("style")).toBe("realistic");
  });

  it("does not strip inbound trackers when extras are supplied", () => {
    const sp = new URLSearchParams({
      clickid: "ef_1",
      utm_source: "tiktok",
    });
    const out = paramsOf(
      buildOurdreamUrl("/create", sp, { gender: "female" }),
    );
    expect(out.get("clickid")).toBe("ef_1");
    expect(out.get("utm_source")).toBe("tiktok");
    expect(out.get("gender")).toBe("female");
  });

  it("skips empty / null / undefined extras", () => {
    const out = paramsOf(
      buildOurdreamUrl("/create", undefined, {
        gender: "female",
        style: "",
        promo: null,
        sub1: undefined,
      }),
    );
    expect(out.get("gender")).toBe("female");
    expect(out.has("style")).toBe(false);
    expect(out.has("promo")).toBe(false);
    expect(out.has("sub1")).toBe(false);
  });

  it("ignores ref in extras — site identity cannot be overridden", () => {
    const out = paramsOf(
      buildOurdreamUrl("/create", undefined, { ref: "evil-affiliate" }),
    );
    expect(out.get("ref")).toBe(SITE_REF);
  });
});

describe("buildOurdreamUrl — unfilled-macro guard", () => {
  /* The diagnosed production case: an upstream affiliate template
   * contained `affid={12}` and the network's macro engine never
   * substituted it, so the value arrived at romantasyai.com as the
   * literal string "{12}". We must NOT relay that to ourdream because
   * their first-write-wins localStorage will then store "{12}" as the
   * affiliate ID and every subsequent postback will fail to reconcile. */
  const MACROS = ["{12}", "{transaction_id}", "{offer_id}", "{aff_sub}"];

  it.each(MACROS)("drops inbound macro value %s", (macro) => {
    const sp = new URLSearchParams({
      affid: macro,
      clickid: macro,
      sub1: macro,
      utm_source: macro,
    });
    const out = paramsOf(buildOurdreamUrl("/create", sp));
    expect(out.has("affid")).toBe(false);
    expect(out.has("clickid")).toBe(false);
    expect(out.has("sub1")).toBe(false);
    expect(out.has("utm_source")).toBe(false);
  });

  it("drops macro values supplied via extras", () => {
    const out = paramsOf(
      buildOurdreamUrl("/create", undefined, {
        affid: "{12}",
        clickid: "{transaction_id}",
        gender: "female",
      }),
    );
    expect(out.has("affid")).toBe(false);
    expect(out.has("clickid")).toBe(false);
    /* Real values supplied alongside macros must still survive. */
    expect(out.get("gender")).toBe("female");
  });

  it("does NOT drop values that merely contain braces in the middle", () => {
    /* Defensive: only EXACTLY one brace-wrapped token is treated as a
     * macro. Real click IDs may contain braces in the middle (rare but
     * possible) and we must not silently strip those. */
    const sp = new URLSearchParams({
      clickid: "abc{12}xyz",
      sub1: "prefix{token}",
      sub2: "{token}suffix",
    });
    const out = paramsOf(buildOurdreamUrl("/create", sp));
    expect(out.get("clickid")).toBe("abc{12}xyz");
    expect(out.get("sub1")).toBe("prefix{token}");
    expect(out.get("sub2")).toBe("{token}suffix");
  });

  it("does NOT drop values that are bracketed differently", () => {
    /* Square brackets, parens, etc. are not macros \u2014 only `{...}`. */
    const sp = new URLSearchParams({
      sub1: "[12]",
      sub2: "(transaction_id)",
      sub3: "<token>",
    });
    const out = paramsOf(buildOurdreamUrl("/create", sp));
    expect(out.get("sub1")).toBe("[12]");
    expect(out.get("sub2")).toBe("(transaction_id)");
    expect(out.get("sub3")).toBe("<token>");
  });

  it("ref is still always set even when every other inbound is a macro", () => {
    const sp = new URLSearchParams({
      affid: "{12}",
      clickid: "{transaction_id}",
      utm_source: "{utm_source}",
    });
    const out = paramsOf(buildOurdreamUrl("/create", sp));
    expect(out.get("ref")).toBe(SITE_REF);
  });

  describe("isUnfilledMacro helper", () => {
    it.each(["{12}", "{a}", "{transaction_id}", "{some_long_token-name}"])(
      "matches %s",
      (s) => {
        expect(isUnfilledMacro(s)).toBe(true);
      },
    );

    it.each([
      "12",
      "{}",
      "{",
      "}",
      "{12}suffix",
      "prefix{12}",
      "{12}{34}",
      "[12]",
      "",
    ])("does not match %s", (s) => {
      expect(isUnfilledMacro(s)).toBe(false);
    });
  });
});

describe("buildOurdreamUrl — conditional ref (affiliate-aware)", () => {
  /* The ref=romantasyai default is suppressed whenever an affiliate is
   * identified on the outbound URL via affid or aff_id. Rationale lives
   * in the buildOurdreamUrl source comment. */

  it("fires ref when no affid / aff_id is present", () => {
    expect(paramsOf(buildOurdreamUrl()).get("ref")).toBe(SITE_REF);
  });

  it("suppresses ref when affid arrives via inbound URL", () => {
    const sp = new URLSearchParams("affid=1456&clickid=abc");
    const out = paramsOf(buildOurdreamUrl("/create", sp));
    expect(out.has("ref")).toBe(false);
    expect(out.get("affid")).toBe("1456");
    expect(out.get("clickid")).toBe("abc");
  });

  it("suppresses ref when aff_id (Everflow tracking-domain) arrives", () => {
    const sp = new URLSearchParams("aff_id=ef_1456");
    const out = paramsOf(buildOurdreamUrl("/create", sp));
    expect(out.has("ref")).toBe(false);
    expect(out.get("aff_id")).toBe("ef_1456");
  });

  it("suppresses ref when affid arrives via wizard extras", () => {
    const out = paramsOf(
      buildOurdreamUrl("/create", undefined, {
        affid: "1456",
        gender: "female",
      }),
    );
    expect(out.has("ref")).toBe(false);
    expect(out.get("affid")).toBe("1456");
  });

  it("re-fires ref when affid arrives unfilled (macro guard drops it)", () => {
    /* Most important edge case: the URL has affid={12} but the macro
     * guard strips it. The final URL has no affid, so we need the
     * fallback ref to still fire. Prevents organic visitors who
     * accidentally got a malformed link from being attribution-less. */
    const sp = new URLSearchParams("affid={12}&clickid={transaction_id}");
    const out = paramsOf(buildOurdreamUrl("/create", sp));
    expect(out.has("affid")).toBe(false);
    expect(out.get("ref")).toBe(SITE_REF);
  });

  it("suppresses ref when affid is present alongside other trackers", () => {
    /* The realistic affiliate case: affid + clickid + tracker + sub1
     * arriving together. Affiliate attribution wins; ref is omitted. */
    const sp = new URLSearchParams({
      affid: "1456",
      clickid: "abc123",
      tracker: "456",
      sub1: "campaign_x",
      utm_source: "meta",
    });
    const out = paramsOf(buildOurdreamUrl("/create", sp));
    expect(out.has("ref")).toBe(false);
    expect(out.get("affid")).toBe("1456");
    expect(out.get("clickid")).toBe("abc123");
    expect(out.get("tracker")).toBe("456");
    expect(out.get("sub1")).toBe("campaign_x");
    expect(out.get("utm_source")).toBe("meta");
  });

  it("fires ref for organic UTM-only traffic (no affid)", () => {
    /* Common case: visitor lands via a UTM-tagged campaign that isn't
     * tied to an affiliate (e.g. organic social, owned email). ref
     * should still fire so romantasyai gets the attribution. */
    const sp = new URLSearchParams({
      utm_source: "newsletter",
      utm_medium: "email",
      utm_campaign: "spring",
    });
    const out = paramsOf(buildOurdreamUrl("/create", sp));
    expect(out.get("ref")).toBe(SITE_REF);
    expect(out.get("utm_source")).toBe("newsletter");
  });

  it("fires ref for organic ad clicks without an affid (gclid only)", () => {
    /* Direct Google Ads traffic that doesn't route through an
     * affiliate network: gclid present, no affid. Ref still fires. */
    const sp = new URLSearchParams("gclid=abc123");
    const out = paramsOf(buildOurdreamUrl("/create", sp));
    expect(out.get("ref")).toBe(SITE_REF);
    expect(out.get("gclid")).toBe("abc123");
  });
});

describe("PASSTHROUGH_PARAMS — list integrity", () => {
  it("contains no duplicates", () => {
    const set = new Set(PASSTHROUGH_PARAMS);
    expect(set.size).toBe(PASSTHROUGH_PARAMS.length);
  });

  it("does not include `ref` (which is set explicitly, not passed through)", () => {
    expect(PASSTHROUGH_PARAMS).not.toContain("ref");
  });
});
