/**
 * Choose-Your-Own-Adventure chat preview \u2014 typed dialogue tree.
 *
 * Authoring contract:
 *   - Every preview has a `rootId` that names the opening character node.
 *   - Each `node` is a single character message addressed to the player.
 *   - A node EITHER has `choices` (mid-tree) OR `endLine` (terminal). Never both.
 *   - Terminal nodes are followed by the universal "Continue this story
 *     on ourdream \u2192" CTA in the renderer; they don't carry their own CTA
 *     (we intentionally route every leaf to the same chat deep-link so we
 *     never accidentally lose a click).
 *   - 3-turn target: root + 2 reply layers. Authors can ship deeper trees
 *     when the dialogue benefits, but the renderer caps eager-render to
 *     prevent runaway content.
 *
 * Why a flat `nodes: Record<id, node>` instead of a literal nested tree:
 *   - Lets choices reconverge cheaply (two options can both lead to the
 *     same response when the dialogue beats overlap).
 *   - Easier to validate, test, and walk in `walkAllPaths()`.
 *   - JSON-LD output enumerates nodes once, not per path.
 *
 * SEO note:
 *   The renderer emits ALL node text as visible HTML up front (collapsed
 *   under a `<details>` for users, fully visible to crawlers). Bots see
 *   every line of dialogue without executing JS. The interactive UI sits
 *   on top.
 */

export type NodeId = string;

export interface ChatPreviewChoice {
  /** The button label \u2014 also rendered as the player's "reply" bubble. */
  label: string;
  /** Target node id within this preview. */
  next: NodeId;
}

export interface ChatPreviewNode {
  /**
   * The character's spoken line. Plain text only \u2014 no markdown, no HTML.
   * Use *single asterisks* for italic stage direction (e.g. "*She turns
   * from the balcony*"); the renderer handles the styling.
   */
  text: string;
  /**
   * Mid-tree node: 2-3 reply options shown as buttons.
   * Mutually exclusive with `endLine`.
   */
  choices?: ChatPreviewChoice[];
  /**
   * Terminal node: a final character beat that closes the preview.
   * The renderer follows this with the universal outbound CTA.
   * Mutually exclusive with `choices`.
   */
  endLine?: true;
}

export interface ChatPreview {
  /** Slug must match `Character.slug` exactly so the lookup keys align. */
  characterSlug: string;
  /**
   * Optional scene-setter shown italicised above the first character bubble.
   * Use sparingly \u2014 most previews open straight into dialogue.
   */
  intro?: string;
  /** Id of the opening character node. */
  rootId: NodeId;
  /** All character nodes, keyed by id. */
  nodes: Record<NodeId, ChatPreviewNode>;
}

/* ── Authoring helpers ─────────────────────────────────────────────── */

/**
 * Validate a preview's referential integrity at module init.
 * Throws in dev so authoring mistakes (typo'd `next`, orphan nodes,
 * choice+endLine collisions) surface before they hit the wire.
 *
 * Not called in production builds (the dev guard is enough).
 */
export function assertPreviewValid(p: ChatPreview): void {
  if (!(p.rootId in p.nodes)) {
    throw new Error(
      `[chat-preview ${p.characterSlug}] rootId "${p.rootId}" missing from nodes`,
    );
  }
  for (const [id, node] of Object.entries(p.nodes)) {
    if (node.choices && node.endLine) {
      throw new Error(
        `[chat-preview ${p.characterSlug}] node "${id}" has both choices and endLine`,
      );
    }
    if (!node.choices && !node.endLine) {
      throw new Error(
        `[chat-preview ${p.characterSlug}] node "${id}" must have either choices or endLine`,
      );
    }
    if (node.choices) {
      if (node.choices.length < 2 || node.choices.length > 3) {
        throw new Error(
          `[chat-preview ${p.characterSlug}] node "${id}" has ${node.choices.length} choices; expected 2-3`,
        );
      }
      for (const ch of node.choices) {
        if (!(ch.next in p.nodes)) {
          throw new Error(
            `[chat-preview ${p.characterSlug}] node "${id}" choice "${ch.label}" → "${ch.next}" (missing)`,
          );
        }
      }
    }
  }
  /* Reachability: every node must be reachable from rootId. Cheap BFS. */
  const seen = new Set<NodeId>([p.rootId]);
  const queue: NodeId[] = [p.rootId];
  while (queue.length) {
    const cur = queue.shift()!;
    const node = p.nodes[cur];
    for (const ch of node.choices ?? []) {
      if (!seen.has(ch.next)) {
        seen.add(ch.next);
        queue.push(ch.next);
      }
    }
  }
  for (const id of Object.keys(p.nodes)) {
    if (!seen.has(id)) {
      throw new Error(
        `[chat-preview ${p.characterSlug}] node "${id}" is unreachable from root`,
      );
    }
  }
}

/**
 * Enumerate every root-to-leaf path. Used for SEO surface (rendering all
 * dialogue) and for the JSON-LD `Conversation` enumeration.
 *
 * Each path is a sequence: [rootNode, choice1, node2, choice2, node3, ...]
 * where choice items are the player's reply labels.
 */
export interface PreviewPathStep {
  speaker: "character" | "player";
  text: string;
  /** Source node id (only for character steps; useful for keys). */
  nodeId?: NodeId;
}

export function walkAllPaths(p: ChatPreview): PreviewPathStep[][] {
  const paths: PreviewPathStep[][] = [];

  const visit = (id: NodeId, acc: PreviewPathStep[]) => {
    const node = p.nodes[id];
    const next: PreviewPathStep[] = [
      ...acc,
      { speaker: "character", text: node.text, nodeId: id },
    ];
    if (node.endLine || !node.choices) {
      paths.push(next);
      return;
    }
    for (const ch of node.choices) {
      visit(ch.next, [...next, { speaker: "player", text: ch.label }]);
    }
  };

  visit(p.rootId, []);
  return paths;
}
