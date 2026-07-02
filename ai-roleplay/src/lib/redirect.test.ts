import { describe, expect, it } from "vitest";
import { buildRedirectUrl, REDTRACK_BASE } from "./redirect";

describe("buildRedirectUrl", () => {
  it("routes through the campaign link with sub17=Female POV, clickid, _gl, inbound params, and the email fragment", () => {
    const url = buildRedirectUrl({
      chatSlug: "silas-corvane-PLACEHOLDER",
      email: "fan@example.com",
      clickid: "abc123",
      gl: "1*glpayload",
      inbound: new URLSearchParams("gclid=G1&utm_source=google"),
    });
    expect(REDTRACK_BASE).toBe("https://clk.ourdreamnetwork.com/6a20d8a94628b3bfe702b2c1");
    expect(url.startsWith(REDTRACK_BASE + "?")).toBe(true);
    const u = new URL(url);
    expect(u.searchParams.get("sub17")).toBe("Female POV");
    expect(u.searchParams.has("sub11")).toBe(false);
    expect(u.searchParams.get("sub19")).toBe("1*glpayload");
    expect(u.searchParams.get("clickid")).toBe("abc123");
    expect(u.searchParams.get("gclid")).toBe("G1");
    expect(u.searchParams.get("utm_source")).toBe("google");
    expect(u.hash).toBe("#prefill_email=fan%40example.com");
  });

  it("emits sub17=Female+POV (space encoded as +) in the raw query string", () => {
    const url = buildRedirectUrl({ chatSlug: "x", email: "a@b.com", clickid: "", gl: "", inbound: new URLSearchParams() });
    expect(url).toContain("sub17=Female+POV");
  });

  it("URL-encodes the email fragment (plus-addresses survive) and puts it after all query params", () => {
    const url = buildRedirectUrl({
      chatSlug: "x",
      email: "jo+promo@gmail.com",
      clickid: "",
      gl: "",
      inbound: new URLSearchParams("utm_source=google"),
    });
    // Fragment comes after the query string.
    expect(url.indexOf("#")).toBeGreaterThan(url.indexOf("?"));
    expect(url.endsWith("#prefill_email=jo%2Bpromo%40gmail.com")).toBe(true);
    // The "+" is encoded as %2B, never a literal "+" (which would decode to a space).
    expect(url).not.toContain("prefill_email=jo+promo");
  });

  it("organic (no clickid): omits clickid and sub19 but keeps sub17 and the email fragment", () => {
    const url = buildRedirectUrl({ chatSlug: "x", email: "a@b.com", clickid: "", gl: "", inbound: new URLSearchParams() });
    const u = new URL(url);
    expect(u.searchParams.has("clickid")).toBe(false);
    expect(u.searchParams.has("sub19")).toBe(false);
    expect(u.searchParams.get("sub17")).toBe("Female POV");
    expect(u.hash).toBe("#prefill_email=a%40b.com");
  });

  it("omits sub19 when no _gl is available", () => {
    const url = buildRedirectUrl({ chatSlug: "x", email: "a@b.com", clickid: "c", gl: "", inbound: new URLSearchParams() });
    expect(new URL(url).searchParams.has("sub19")).toBe(false);
  });
});
