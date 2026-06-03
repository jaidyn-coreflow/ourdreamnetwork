import { describe, expect, it } from "vitest";
import { FEATURED_CHARACTERS } from "@/data/characters";
import { _allPreviews, getChatPreview, hasChatPreview } from "./index";
import { assertPreviewValid, walkAllPaths } from "./types";

/* PR 4 + PR 5 launch characters: every ranked top-12 has a preview. */
const TOP_12_SLUGS = [
  "dragon-rider-bonded-throne",
  "courts-of-starlight",
  "iron-commander",
  "ironveil-emperor",
  "storm-rider",
  "centurion",
  "crimson-covenant",
  "quilana-vaelrith",
  "royal-pains",
  "adrian-wolfe",
  "maeve-anon",
  "dawson-monroe",
];

describe("chat-previews registry", () => {
  it("registers a preview for every top-12 ranked character", () => {
    for (const slug of TOP_12_SLUGS) {
      expect(hasChatPreview(slug), `missing preview for ${slug}`).toBe(true);
    }
  });

  it("registers exactly the top-12 (no extras yet, no gaps)", () => {
    expect(_allPreviews.map((p) => p.characterSlug).sort()).toEqual(
      [...TOP_12_SLUGS].sort(),
    );
  });

  it("returns null for characters without a preview", () => {
    expect(getChatPreview("nonexistent-slug")).toBeNull();
    /* Pick an unranked character that should never have a preview yet. */
    expect(getChatPreview("draven-thorne")).toBeNull();
  });

  it("every preview's slug points at a real character in the catalogue", () => {
    const knownSlugs = new Set(FEATURED_CHARACTERS.map((c) => c.slug));
    for (const p of _allPreviews) {
      expect(
        knownSlugs.has(p.characterSlug),
        `preview slug ${p.characterSlug} not in catalogue`,
      ).toBe(true);
    }
  });
});

describe("preview structural integrity (per character)", () => {
  for (const preview of _allPreviews) {
    describe(preview.characterSlug, () => {
      it("passes the strict validator", () => {
        expect(() => assertPreviewValid(preview)).not.toThrow();
      });

      it("has a 2x2 branching shape (1 root + 2 mid + 4 leaves = 7 nodes)", () => {
        /* PR 4 launch contract. Future characters may deepen, but the
         * three launch characters all share this canonical shape. */
        expect(Object.keys(preview.nodes).length).toBe(7);
      });

      it("has exactly 4 leaf endLines and 3 branching nodes", () => {
        const nodes = Object.values(preview.nodes);
        const leaves = nodes.filter((n) => n.endLine === true);
        const branches = nodes.filter((n) => n.choices != null);
        expect(leaves.length).toBe(4);
        expect(branches.length).toBe(3);
      });

      it("walks 4 root-to-leaf paths, each with 3 character beats + 2 player choices", () => {
        const paths = walkAllPaths(preview);
        expect(paths.length).toBe(4);
        for (const path of paths) {
          const characterBeats = path.filter((s) => s.speaker === "character");
          const playerChoices = path.filter((s) => s.speaker === "player");
          expect(characterBeats.length).toBe(3);
          expect(playerChoices.length).toBe(2);
        }
      });

      it("every root-to-leaf path ends on an endLine node", () => {
        const paths = walkAllPaths(preview);
        for (const path of paths) {
          const lastCharacter = [...path]
            .reverse()
            .find((s) => s.speaker === "character");
          expect(lastCharacter).toBeDefined();
          const node = preview.nodes[lastCharacter!.nodeId!];
          expect(node.endLine).toBe(true);
        }
      });

      it("emits at least 200 words of dialogue total (SEO content floor)", () => {
        const totalWords = walkAllPaths(preview)
          .flat()
          .map((s) => s.text)
          .join(" ")
          .split(/\s+/)
          .filter(Boolean).length;
        expect(totalWords).toBeGreaterThanOrEqual(200);
      });
    });
  }
});

describe("validator catches authoring errors", () => {
  it("throws on missing rootId", () => {
    expect(() =>
      assertPreviewValid({
        characterSlug: "test",
        rootId: "missing",
        nodes: { n0: { text: "hi", endLine: true } },
      }),
    ).toThrow(/rootId/);
  });

  it("throws on a choice pointing to a missing node", () => {
    expect(() =>
      assertPreviewValid({
        characterSlug: "test",
        rootId: "n0",
        nodes: {
          n0: {
            text: "hi",
            choices: [
              { label: "a", next: "n1" },
              { label: "b", next: "ghost" },
            ],
          },
          n1: { text: "ok", endLine: true },
        },
      }),
    ).toThrow(/ghost/);
  });

  it("throws on a node with both choices and endLine", () => {
    expect(() =>
      assertPreviewValid({
        characterSlug: "test",
        rootId: "n0",
        nodes: {
          n0: {
            text: "hi",
            endLine: true,
            choices: [
              { label: "a", next: "n0" },
              { label: "b", next: "n0" },
            ],
          },
        },
      }),
    ).toThrow(/both choices and endLine/);
  });

  it("throws on a node with neither choices nor endLine", () => {
    expect(() =>
      assertPreviewValid({
        characterSlug: "test",
        rootId: "n0",
        nodes: { n0: { text: "hi" } },
      }),
    ).toThrow(/either choices or endLine/);
  });

  it("throws on unreachable nodes", () => {
    expect(() =>
      assertPreviewValid({
        characterSlug: "test",
        rootId: "n0",
        nodes: {
          n0: { text: "hi", endLine: true },
          orphan: { text: "lonely", endLine: true },
        },
      }),
    ).toThrow(/unreachable/);
  });
});
