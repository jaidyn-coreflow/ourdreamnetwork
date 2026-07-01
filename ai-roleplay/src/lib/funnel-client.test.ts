import { describe, it, expect } from "vitest";
import { buildLeadEvent } from "./funnel-client";

describe("buildLeadEvent", () => {
  it("builds the Google Ads generate_lead payload", () => {
    expect(buildLeadEvent("a@b.com")).toEqual({
      event: "generate_lead",
      currency: "USD",
      value: 1.0,
      user_data: { email: "a@b.com" },
    });
  });
});
