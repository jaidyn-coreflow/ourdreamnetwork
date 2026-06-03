import { describe, expect, it } from "vitest";
import { FEATURED_CHARACTERS } from "@/data/characters";
import {
  WIZARD_GENDERS,
  WIZARD_STYLES,
  bestMatch,
  choicesToExtras,
  filterCharacters,
  topMatches,
} from "./match";

describe("filterCharacters — gender filter", () => {
  it("returns the full catalogue when no filters are set", () => {
    expect(filterCharacters({}).length).toBe(FEATURED_CHARACTERS.length);
  });

  it("filters by gender", () => {
    const result = filterCharacters({ gender: "female" });
    expect(result.length).toBeGreaterThan(0);
    expect(result.every((c) => c.gender === "female")).toBe(true);
  });

  it("ignores gender=any (treats as wildcard)", () => {
    expect(filterCharacters({ gender: "any" }).length).toBe(
      FEATURED_CHARACTERS.length,
    );
  });

  it("returns at least one character for every gender option", () => {
    /* Protects the wizard reveal step from ever dead-ending users. */
    for (const gender of WIZARD_GENDERS) {
      expect(filterCharacters({ gender }).length).toBeGreaterThan(0);
    }
  });
});

describe("filterCharacters — sort order", () => {
  it("ranks ascending; unranked tail follows", () => {
    const all = filterCharacters({});
    const ranked = all.filter((c) => c.rank != null);
    for (let i = 1; i < ranked.length; i++) {
      expect(ranked[i].rank).toBeGreaterThan(ranked[i - 1].rank!);
    }
    const firstUnrankedIdx = all.findIndex((c) => c.rank == null);
    if (firstUnrankedIdx !== -1) {
      expect(all.slice(0, firstUnrankedIdx).every((c) => c.rank != null)).toBe(true);
    }
  });

  it("Bonded Throne (rank 1) leads the unfiltered grid", () => {
    expect(filterCharacters({})[0].slug).toBe("dragon-rider-bonded-throne");
  });

  it("leads with rank-1 character of the chosen gender", () => {
    /* Bonded Throne is rank 1 + female. */
    expect(filterCharacters({ gender: "female" })[0].slug).toBe(
      "dragon-rider-bonded-throne",
    );
    /* Iron Commander is rank 3 + male — should be the rank-1 male. */
    expect(filterCharacters({ gender: "male" })[0].slug).toBe("iron-commander");
  });
});

describe("bestMatch + topMatches", () => {
  it("bestMatch returns the rank-1 character of the filtered set", () => {
    expect(bestMatch({ gender: "female" })?.slug).toBe(
      "dragon-rider-bonded-throne",
    );
  });

  it("topMatches respects N", () => {
    expect(topMatches({}, 3)).toHaveLength(3);
  });

  it("never returns null bestMatch with current data (defensive)", () => {
    for (const gender of WIZARD_GENDERS) {
      expect(bestMatch({ gender })).not.toBeNull();
    }
  });
});

describe("choicesToExtras — outbound URL params", () => {
  it("emits gender + style for concrete choices", () => {
    expect(choicesToExtras({ gender: "female", style: "realistic" })).toEqual({
      gender: "female",
      style: "realistic",
    });
  });

  it("omits 'any' values so ourdream defaults take over", () => {
    expect(choicesToExtras({ gender: "any", style: "any" })).toEqual({});
  });

  it("returns an empty object for empty choices", () => {
    expect(choicesToExtras({})).toEqual({});
  });
});

describe("WIZARD_STYLES — vocabulary", () => {
  it("matches what ourdream's /create accepts", () => {
    /* Locked to the ourdream contract: realistic | anime | any. */
    expect(WIZARD_STYLES).toEqual(["realistic", "anime", "any"]);
  });
});
