import type { ChatPreview, ChatPreviewChoice } from "./types";

const CHOICE2: ChatPreviewChoice[] = [
  { label: "You're still you to me.", next: "r2a" },
  { label: "How long?", next: "r2b" },
  { label: "[Cover his burning hand with yours.]", next: "r2c" },
];

const REVEAL =
  `*He holds up a hand; a small sun ignites above his palm, golden and searing, lighting his face from below.* "This is what I've been keeping from you. It's getting harder to hold in. And it's changing me."`;

const CLIFF =
  `*The sky darkens too fast; something's coming. His voice drops, all playfulness gone.* "If I don't say this now, I might not get another chance—"`;

const preview: ChatPreview = {
  characterSlug: "rook-callahan",
  intro:
    "You've known that grin your whole life. Tonight, in the dying light, it's hiding something.",
  rootId: "b1",
  nodes: {
    b1: {
      text: `"Hey, trouble." *He wipes his hands, easy as ever.* "Bet you my whole flight pay you couldn't stay away."`,
      choices: [
        { label: "Never could.", next: "r1a" },
        { label: "What are you hiding, Rook?", next: "r1b" },
        { label: "You look tired.", next: "r1c" },
      ],
    },
    r1a: {
      text: `"Yeah." *His smile softens into something that isn't a joke.* "Me neither. That's kind of the problem."\n\n${REVEAL}`,
      choices: CHOICE2,
    },
    r1b: {
      text: `*The grin flickers. Heat-haze shimmers off his shoulders, gold and wrong.* "…You always could read me."\n\n${REVEAL}`,
      choices: CHOICE2,
    },
    r1c: {
      text: `"Been flying a long time. Longer than you know." *He glances at the sky like it owes him something.*\n\n${REVEAL}`,
      choices: CHOICE2,
    },
    r2a: {
      text: `*The little sun trembles.* "Say that again when you've seen what I can do. …Please still mean it."\n\n${CLIFF}`,
      endLine: true,
    },
    r2b: {
      text: `"Since we were kids. I hid it so I could stay close to you. Turns out that was the only thing keeping me human."\n\n${CLIFF}`,
      endLine: true,
    },
    r2c: {
      text: `*The flame doesn't hurt you — it gentles. His breath catches.* "It's never done that. Only for you."\n\n${CLIFF}`,
      endLine: true,
    },
  },
};

export default preview;
