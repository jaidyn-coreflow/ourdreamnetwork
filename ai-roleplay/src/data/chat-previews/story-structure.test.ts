import { describe, it, expect } from "vitest";
import { _allPreviews, getChatPreview } from "./index";
import { assertPreviewValid } from "./types";
import { FEATURED_CHARACTERS } from "../characters";

describe("story trees", () => {
  it("registers exactly one preview per lead", () => {
    expect(_allPreviews.map((p) => p.characterSlug).sort()).toEqual(
      FEATURED_CHARACTERS.map((c) => c.slug).sort(),
    );
  });

  for (const p of _allPreviews) {
    describe(p.characterSlug, () => {
      it("passes referential validation", () => {
        expect(() => assertPreviewValid(p)).not.toThrow();
      });

      it("has the 7-node beat structure", () => {
        expect(Object.keys(p.nodes).sort()).toEqual(
          ["b1", "r1a", "r1b", "r1c", "r2a", "r2b", "r2c"].sort(),
        );
        expect(p.rootId).toBe("b1");
        expect(p.nodes.b1.choices).toHaveLength(3);
      });

      it("Choice 2 reconverges (all r1 nodes share the same targets)", () => {
        const targets = (id: string) =>
          (p.nodes[id].choices ?? []).map((c) => c.next).sort();
        expect(targets("r1a")).toEqual(["r2a", "r2b", "r2c"]);
        expect(targets("r1b")).toEqual(["r2a", "r2b", "r2c"]);
        expect(targets("r1c")).toEqual(["r2a", "r2b", "r2c"]);
      });

      it("terminal nodes end the story", () => {
        for (const id of ["r2a", "r2b", "r2c"]) {
          expect(p.nodes[id].endLine).toBe(true);
          expect(p.nodes[id].choices).toBeUndefined();
        }
      });
    });
  }

  it("getChatPreview resolves a known slug and rejects unknown", () => {
    expect(getChatPreview("aric-venn")?.characterSlug).toBe("aric-venn");
    expect(getChatPreview("nope")).toBeNull();
  });
});
