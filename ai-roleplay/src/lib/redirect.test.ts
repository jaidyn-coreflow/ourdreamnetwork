import { describe, expect, it } from "vitest";
import { buildRedirectUrl, REDTRACK_BASE } from "./redirect";

describe("buildRedirectUrl", () => {
  it("routes through the AI Roleplay campaign redirect link with sub17, sub11, clickid, _gl, and inbound params", () => {
    const url = buildRedirectUrl({
      chatSlug: "the-storm-rider-crown-thorn-nG3Q3Sdgvj",
      clickid: "abc123",
      gl: "1*glpayload",
      inbound: new URLSearchParams("gclid=G1&utm_source=google"),
    });
    expect(REDTRACK_BASE).toBe("https://clk.ourdreamnetwork.com/6a20d8a94628b3bfe702b2c1");
    expect(url.startsWith(REDTRACK_BASE + "?")).toBe(true);
    const qs = new URL(url).searchParams;
    expect(qs.get("sub17")).toBe("the-storm-rider-crown-thorn-nG3Q3Sdgvj");
    expect(qs.get("sub11")).toBe("ai-roleplay");
    expect(qs.get("sub19")).toBe("1*glpayload");
    expect(qs.get("clickid")).toBe("abc123");
    expect(qs.get("gclid")).toBe("G1");
    expect(qs.get("utm_source")).toBe("google");
  });

  it("uses a unique sub17 per character", () => {
    const draven = new URL(
      buildRedirectUrl({ chatSlug: "draven-thorne-C6YywpVFVj", clickid: "", gl: "", inbound: new URLSearchParams() }),
    ).searchParams.get("sub17");
    const royal = new URL(
      buildRedirectUrl({ chatSlug: "a-royal-pain-xFGMcJD4xS", clickid: "", gl: "", inbound: new URLSearchParams() }),
    ).searchParams.get("sub17");
    expect(draven).toBe("draven-thorne-C6YywpVFVj");
    expect(royal).toBe("a-royal-pain-xFGMcJD4xS");
    expect(draven).not.toBe(royal);
  });

  it("organic (no clickid): still routes through the campaign link, omits clickid and sub19", () => {
    const url = buildRedirectUrl({ chatSlug: "x", clickid: "", gl: "", inbound: new URLSearchParams() });
    expect(url.startsWith(REDTRACK_BASE + "?")).toBe(true);
    const qs = new URL(url).searchParams;
    expect(qs.get("sub17")).toBe("x");
    expect(qs.get("sub11")).toBe("ai-roleplay");
    expect(qs.has("clickid")).toBe(false);
    expect(qs.has("sub19")).toBe(false);
  });

  it("omits sub19 when no _gl is available", () => {
    const url = buildRedirectUrl({ chatSlug: "x", clickid: "c", gl: "", inbound: new URLSearchParams() });
    expect(new URL(url).searchParams.has("sub19")).toBe(false);
  });
});
