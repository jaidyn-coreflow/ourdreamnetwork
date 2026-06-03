import { describe, expect, it } from "vitest";
import { buildRedirectUrl, REDTRACK_BASE } from "./redirect";

describe("buildRedirectUrl", () => {
  it("paid path: routes through RedTrack with sub11=ai-roleplay, clickid, _gl, and the chat slug", () => {
    const url = buildRedirectUrl({
      chatSlug: "draven-thorne-C6YywpVFVj",
      clickid: "abc123",
      gl: "1*glpayload",
      inbound: new URLSearchParams("gclid=G1&utm_source=google"),
    });
    expect(url.startsWith(REDTRACK_BASE + "?")).toBe(true);
    const qs = new URL(url).searchParams;
    expect(qs.get("sub11")).toBe("ai-roleplay");
    expect(qs.get("sub12")).toBe("draven-thorne-C6YywpVFVj");
    expect(qs.get("sub19")).toBe("1*glpayload");
    expect(qs.get("clickid")).toBe("abc123");
    expect(qs.get("gclid")).toBe("G1");
    expect(qs.get("utm_source")).toBe("google");
  });

  it("organic path (no clickid): goes direct to the chat URL with ref + inbound params", () => {
    const url = buildRedirectUrl({
      chatSlug: "draven-thorne-C6YywpVFVj",
      clickid: "",
      gl: "",
      inbound: new URLSearchParams("utm_source=bing"),
    });
    expect(url).toBe(
      "https://ourdream.ai/chat/draven-thorne-C6YywpVFVj?utm_source=bing&ref=googlecpc&tracker=rt",
    );
  });

  it("omits sub19 when no _gl is available on the paid path", () => {
    const url = buildRedirectUrl({ chatSlug: "x", clickid: "c", gl: "", inbound: new URLSearchParams() });
    expect(new URL(url).searchParams.has("sub19")).toBe(false);
  });
});
