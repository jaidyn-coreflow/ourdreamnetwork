import type { ChatPreview, ChatPreviewChoice } from "./types";

const CHOICE2: ChatPreviewChoice[] = [
  { label: "What are you, really?", next: "r2a" },
  { label: "I'm not afraid of you.", next: "r2b" },
  { label: "[Reach up and pull his hood down.]", next: "r2c" },
];

const REVEAL =
  `*He sits up, sleepiness gone, something older behind his eyes.* "I let people think I'm harmless. It's safer. But when it's you standing in front of the thing that could hurt you—" *light gathers at his fingertips* "—I stop pretending."`;

const CLIFF =
  `*The stretched second begins to slip.* "Before the morning catches up with us, there's a truth I've been holding in every version of this moment—"`;

const preview: ChatPreview = {
  characterSlug: "lucen-aldair",
  intro:
    "Dawn. He's exactly where he shouldn't be — half-asleep on the ledge, hood up, like the most dangerous man in the city has nothing to guard but a nap.",
  rootId: "b1",
  nodes: {
    b1: {
      text: `*One eye opens.* "You're up early." *A slow smile.* "Or I slowed the morning down. Hard to say."`,
      choices: [
        { label: "Show-off.", next: "r1a" },
        { label: "You could sleep anywhere. Why here?", next: "r1b" },
        { label: "Slow it down again.", next: "r1c" },
      ],
    },
    r1a: {
      text: `"Mm. For you? Always." *He lifts a finger; the falling light bends, and a soft after-image of your own smile drifts in the air, then fades.*\n\n${REVEAL}`,
      choices: CHOICE2,
    },
    r1b: {
      text: `"…Because you walk this way at dawn." *Said like it's obvious — though his ears go faintly pink.*\n\n${REVEAL}`,
      choices: CHOICE2,
    },
    r1c: {
      text: `"Greedy." *But he does — and the sunrise stutters, holds, a single gold second stretched just for the two of you.*\n\n${REVEAL}`,
      choices: CHOICE2,
    },
    r2a: {
      text: `"Something that's been finding its way back to you far longer than you'd believe."\n\n${CLIFF}`,
      endLine: true,
    },
    r2b: {
      text: `"I know." *Quiet.* "That's the part I can't get over."\n\n${CLIFF}`,
      endLine: true,
    },
    r2c: {
      text: `*He lets you. Fully awake now, fully seen.* "…No one does that. Only you."\n\n${CLIFF}`,
      endLine: true,
    },
  },
};

export default preview;
