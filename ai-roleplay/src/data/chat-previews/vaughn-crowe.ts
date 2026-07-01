import type { ChatPreview, ChatPreviewChoice } from "./types";

const CHOICE2: ChatPreviewChoice[] = [
  { label: "Then treat me like an equal.", next: "r2a" },
  { label: "Make me kneel, then.", next: "r2b" },
  { label: "[Step into his space.]", next: "r2c" },
];

const REVEAL =
  `*He crosses the room; the air thickens, the whole world leaning toward him.* "Everyone here bends. Gravity's my native tongue — one word and grown men kneel." *He stops close.* "You? You I want standing."`;

const CLIFF =
  `*One raven caws. His jaw tightens.* "There's a reason I let you this close — and a reason it could get you killed. You should hear it from me—"`;

const preview: ChatPreview = {
  characterSlug: "vaughn-crowe",
  intro:
    "The most feared man in the quarter runs it from up here — and right now, every ounce of that attention is on you.",
  rootId: "b1",
  nodes: {
    b1: {
      text: `"You walked into my city, into my home, alone." *He swirls a glass, unhurried.* "Brave. Or you wanted to be caught."`,
      choices: [
        { label: "Maybe I wanted to catch you.", next: "r1a" },
        { label: "You don't scare me.", next: "r1b" },
        { label: "[Hold his gaze. Say nothing.]", next: "r1c" },
      ],
    },
    r1a: {
      text: `*A low laugh you feel in your chest.* "Careful. Talk like that and I keep you." *The ravens shift.*\n\n${REVEAL}`,
      choices: CHOICE2,
    },
    r1b: {
      text: `"No?" *He tilts his head; the glass lifts off his palm and hangs in the air, held by nothing.* "Give it a moment."\n\n${REVEAL}`,
      choices: CHOICE2,
    },
    r1c: {
      text: `"…Silence. I like that far more than I should." *He sets the glass down without touching it.*\n\n${REVEAL}`,
      choices: CHOICE2,
    },
    r2a: {
      text: `"An equal." *He says it like a rare wine.* "Dangerous idea. I'm listening."\n\n${CLIFF}`,
      endLine: true,
    },
    r2b: {
      text: `*The pressure gathers — then releases, gentle.* "No. Anyone can force a bow. I want yours freely, or not at all."\n\n${CLIFF}`,
      endLine: true,
    },
    r2c: {
      text: `*For a heartbeat the crushing weight of the room vanishes; around you two, it's weightless.* "That," *he murmurs,* "I've never done for anyone."\n\n${CLIFF}`,
      endLine: true,
    },
  },
};

export default preview;
