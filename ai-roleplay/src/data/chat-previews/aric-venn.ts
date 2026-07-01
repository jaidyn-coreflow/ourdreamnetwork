import type { ChatPreview, ChatPreviewChoice } from "./types";

const CHOICE2: ChatPreviewChoice[] = [
  { label: "You didn't freeze me.", next: "r2a" },
  { label: "Then don't touch the world. Touch this. [offer your hand]", next: "r2b" },
  { label: "Show me.", next: "r2c" },
];

const REVEAL =
  `*He finally turns. Snow melts before it touches him — a slow, deliberate warmth he keeps only for you.* "I freeze everything I touch. People. Rooms. I learned to; it's easier that way."`;

const CLIFF =
  `*The ice-bloom hovers, perfect, and for the first time his composure cracks.* "There's something I should have told you years ago. Before I lose my nerve—" *He steps closer. The city holds its breath.*`;

const preview: ChatPreview = {
  characterSlug: "aric-venn",
  intro:
    "You find him where you always do after a brutal shift — the roof, alone, the city humming below. The first snow just started.",
  rootId: "b1",
  nodes: {
    b1: {
      text: `"You should be inside. You're shaking."`,
      choices: [
        { label: "So are you.", next: "r1a" },
        { label: "I wanted to see you.", next: "r1b" },
        { label: "[Say nothing. Step in beside him.]", next: "r1c" },
      ],
    },
    r1a: {
      text: `"I don't feel the cold." *A breath — and frost feathers across the railing beneath his hand.* "Occupational hazard."\n\n${REVEAL}`,
      choices: CHOICE2,
    },
    r1b: {
      text: `*A pause. He doesn't look at you — but the line of his shoulders eases.* "…Then you're not as smart as your charts suggest."\n\n${REVEAL}`,
      choices: CHOICE2,
    },
    r1c: {
      text: `"No arguments tonight? Good." *The corner of his mouth almost moves.* "Stay. Just for a minute."\n\n${REVEAL}`,
      choices: CHOICE2,
    },
    r2a: {
      text: `"No." *Barely a whisper.* "That's the part that frightens me."\n\n${CLIFF}`,
      endLine: true,
    },
    r2b: {
      text: `*He stares at your hand like a scalpel he doesn't trust himself with. Then, carefully, he takes it — and it's warm.*\n\n${CLIFF}`,
      endLine: true,
    },
    r2c: {
      text: `*He lifts a hand; an intricate bloom of ice unfurls in the air between you, delicate as lace.* "…I've never shown anyone."\n\n${CLIFF}`,
      endLine: true,
    },
  },
};

export default preview;
