import { describe, it, expect } from "vitest";
import { FEATURED_CHARACTERS, getCharacter } from "./characters";

const EXPECTED_SLUGS = [
  "aric-venn",
  "lucen-aldair",
  "marlowe-vesper",
  "silas-corvane",
  "rook-callahan",
];

describe("FEATURED_CHARACTERS", () => {
  it("has exactly the 5 signature leads", () => {
    expect(FEATURED_CHARACTERS.map((c) => c.slug).sort()).toEqual(
      [...EXPECTED_SLUGS].sort(),
    );
  });

  it("every lead has all required fields populated", () => {
    for (const c of FEATURED_CHARACTERS) {
      expect(c.name.length).toBeGreaterThan(0);
      expect(c.power.length).toBeGreaterThan(0);
      expect(c.hook.length).toBeGreaterThan(0);
      expect(c.imageUrl.startsWith("/ai-roleplay/characters/")).toBe(true);
      expect(c.chatUrl.startsWith("https://ourdream.ai/chat/")).toBe(true);
      expect(c.gate.headline.length).toBeGreaterThan(0);
      expect(c.gate.sub.length).toBeGreaterThan(0);
      expect(c.gate.button.length).toBeGreaterThan(0);
    }
  });

  it("slugs are unique", () => {
    const set = new Set(FEATURED_CHARACTERS.map((c) => c.slug));
    expect(set.size).toBe(FEATURED_CHARACTERS.length);
  });

  it("getCharacter returns the lead by slug and undefined otherwise", () => {
    expect(getCharacter("aric-venn")?.name).toBe("Dr. Aric Venn");
    expect(getCharacter("nope")).toBeUndefined();
  });
});
