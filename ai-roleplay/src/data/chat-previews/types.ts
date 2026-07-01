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
 *   - Easier to validate and test (see `assertPreviewValid`).
 *
 * The interactive `ChatPreview` component is the only rendering surface.
 * It manages visited-choice path state client-side; there is no separate
 * server-rendered SEO surface.
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

