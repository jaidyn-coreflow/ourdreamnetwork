import type { ChatPreview, ChatPreviewChoice } from "./types";

const CHOICE2: ChatPreviewChoice[] = [
  { label: "Then don't let it take you.", next: "r2a" },
  { label: "Paint me for real, then.", next: "r2b" },
  { label: "[Touch the floating water.]", next: "r2c" },
];

const REVEAL =
  `*He crosses to you, plum hair damp, mismatched eyes bright.* "I'm not from here. Something drowned a long time ago and washed up wearing my face. The sea wants it back." *Water beads off his palm, rising, not falling.* "It's patient. I'm not."`;

const CLIFF =
  `*Thunder. The tide surges up the beach toward the studio door.* "There's something I have to tell you before the water does—"`;

const preview: ChatPreview = {
  characterSlug: "marlowe-vesper",
  intro:
    "His studio smells of salt and turpentine. Every canvas is the sea — and, you realize slowly, every canvas is also you.",
  rootId: "b1",
  nodes: {
    b1: {
      text: `"Don't move." *Brush frozen mid-air.* "I finally get the light right and you walk in and ruin it by being better than the painting."`,
      choices: [
        { label: "You painted me. We've never met.", next: "r1a" },
        { label: "It's beautiful.", next: "r1b" },
        { label: "Why is it storming?", next: "r1c" },
      ],
    },
    r1a: {
      text: `"Haven't we?" *A crooked, haunted grin. Outside, the tide draws back from the shore as if leaning in to listen.*\n\n${REVEAL}`,
      choices: CHOICE2,
    },
    r1b: {
      text: `"It's unfinished." *He sets the brush down.* "Like everything I care about. …Sit with me anyway."\n\n${REVEAL}`,
      choices: CHOICE2,
    },
    r1c: {
      text: `"Because I'm—" *he catches himself as rain lashes the glass* "—in a mood. The sea and I have that problem."\n\n${REVEAL}`,
      choices: CHOICE2,
    },
    r2a: {
      text: `*The rising water stills.* "Say that again like you mean it and I might believe it's possible."\n\n${CLIFF}`,
      endLine: true,
    },
    r2b: {
      text: `"…If I do, you're mine. That's how it works with me." *He's only half joking.*\n\n${CLIFF}`,
      endLine: true,
    },
    r2c: {
      text: `*It wraps your fingers, warm as a summer sea.* "It likes you," *he breathes.* "So do I. That's the dangerous part."\n\n${CLIFF}`,
      endLine: true,
    },
  },
};

export default preview;
