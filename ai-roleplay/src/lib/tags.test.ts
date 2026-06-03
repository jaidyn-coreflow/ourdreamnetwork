import { describe, expect, it } from "vitest";
import { FEATURED_CHARACTERS, type Tag } from "@/data/characters";
import { ACTIVE_TAGS, TAG_META, charactersForTag, getTagMeta } from "./tags";

describe("TAG_META — taxonomy completeness", () => {
  it("has metadata for every Tag literal in the union", () => {
    /* If a new tag is added to the Tag union without metadata,
     * Object.keys(TAG_META) won't include it and characters tagged
     * with it won't surface anywhere. Catch that at test time. */
    const taggedSlugs = new Set<string>();
    for (const c of FEATURED_CHARACTERS) {
      for (const t of c.tags ?? []) taggedSlugs.add(t);
    }
    for (const slug of taggedSlugs) {
      expect(
        slug in TAG_META,
        `Tag "${slug}" used on a character but missing from TAG_META`,
      ).toBe(true);
    }
  });

  it("every TAG_META entry has non-empty seoTitle, description, and intro", () => {
    for (const meta of Object.values(TAG_META)) {
      expect(meta.seoTitle.length).toBeGreaterThan(10);
      expect(meta.seoDescription.length).toBeGreaterThan(40);
      expect(meta.intro.length).toBeGreaterThan(60);
    }
  });

  it("every label is properly cased (no lowercase kebab leakage)", () => {
    /* Compound labels with stylistic hyphens are fine ("Slow-Burn",
     * "Enemies-to-Lovers"). What we're catching is the slug literal
     * leaking through verbatim ("dragon-rider" instead of "Dragon
     * Rider"), so allow hyphens but require the first letter to be
     * uppercase. */
    for (const meta of Object.values(TAG_META)) {
      expect(meta.label[0]).toBe(meta.label[0]?.toUpperCase());
      expect(meta.label).not.toMatch(/^[a-z]/);
    }
  });
});

describe("ACTIVE_TAGS — derived from live catalogue", () => {
  it("only includes tags with at least one character", () => {
    for (const meta of ACTIVE_TAGS) {
      const matches = FEATURED_CHARACTERS.filter((c) =>
        c.tags?.includes(meta.slug),
      );
      expect(matches.length).toBeGreaterThan(0);
    }
  });

  it("preserves canonical TAG_META insertion order", () => {
    const allOrder = Object.keys(TAG_META);
    const activeOrder = ACTIVE_TAGS.map((m) => m.slug);
    /* activeOrder must be a subsequence of allOrder. */
    let cursor = 0;
    for (const slug of activeOrder) {
      const found = allOrder.indexOf(slug, cursor);
      expect(found, `tag ${slug} out of canonical order`).toBeGreaterThanOrEqual(0);
      cursor = found + 1;
    }
  });
});

describe("getTagMeta — public lookup", () => {
  it("returns metadata for active tags", () => {
    const m = getTagMeta("vampire");
    expect(m).not.toBeNull();
    expect(m?.label).toBe("Vampire");
  });

  it("returns null for unknown slugs", () => {
    expect(getTagMeta("not-a-real-tag")).toBeNull();
    expect(getTagMeta("")).toBeNull();
  });
});

describe("charactersForTag — sort + filter", () => {
  it("returns only characters with the tag", () => {
    const result = charactersForTag("vampire");
    for (const c of result) {
      expect(c.tags).toContain("vampire");
    }
  });

  it("sorts by rank ascending, then unranked tail", () => {
    const result = charactersForTag("dragon-rider");
    for (let i = 1; i < result.length; i++) {
      const prev = result[i - 1];
      const cur = result[i];
      if (prev.rank != null && cur.rank != null) {
        expect(cur.rank).toBeGreaterThan(prev.rank);
      }
      if (prev.rank == null) expect(cur.rank).toBeUndefined();
    }
  });

  it("returns empty array for tags with no characters (defensive)", () => {
    /* Cast through Tag because the type union is closed; we're testing
     * the function is robust if a tag literal is added but no
     * character carries it yet. */
    const ghostTag = "not-a-real-tag" as Tag;
    expect(charactersForTag(ghostTag)).toEqual([]);
  });
});

describe("invariant — every ranked character has at least one tag", () => {
  /* Ranked characters appear prominently in nav/grids and any of them
   * landing without tags would silently exclude them from /tag pages.
   * This test catches that at PR time. */
  it("ranked characters all carry tags", () => {
    const ranked = FEATURED_CHARACTERS.filter((c) => c.rank != null);
    for (const c of ranked) {
      expect(
        c.tags && c.tags.length > 0,
        `Ranked character ${c.slug} has no tags`,
      ).toBe(true);
    }
  });
});
