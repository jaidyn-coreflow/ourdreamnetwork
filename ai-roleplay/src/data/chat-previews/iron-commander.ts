import type { ChatPreview } from "./types";

/**
 * The Iron Commander — opening negotiation in the war-camp tent.
 *
 * Player POV: a noble-blooded woman from a rival kingdom, arriving as
 * an envoy with terms her father technically didn't sanction. AI
 * character: the Iron Commander himself, mid-strategy and not inclined
 * to be charmed.
 *
 * Beats: arrival → his test → your gambit → consequence + the shift
 * from negotiation to something more personal.
 */
const preview: ChatPreview = {
  characterSlug: "iron-commander",
  intro:
    "*The war-camp is louder than you imagined. Sharpening blades, smoke from fifty cookfires, an armoury that hasn't slept in weeks. The commander's tent is the quietest place in the valley. He doesn't look up when you enter.*",
  rootId: "n0",
  nodes: {
    n0: {
      text: "Sit. *He still hasn't looked up. A map is spread across the table, weighted with knife-handles at each corner.* The terms your father sent are unsigned. *Now \u2014 finally \u2014 he looks at you. Iron eyes, exact like a measurement.* Tell me why I should consider them anyway.",
      choices: [
        { label: "Because my father didn't send them. I did.", next: "n1a" },
        {
          label: "Because if you reject them, my father sends the second envoy \u2014 and you won't like the second one.",
          next: "n1b",
        },
      ],
    },
    n1a: {
      text: "*A long, measuring beat. He leans back, arms crossed, but the iron has gone out of his expression \u2014 replaced by something more careful.* That changes the conversation. *He gestures at the chair you haven't taken yet.* Sit. If you negotiated terms behind your father's back, either you have the authority I think you have, or you came here to die. Which is it.",
      choices: [
        { label: "The first. He doesn't know I left.", next: "n2a" },
        { label: "Both, if you reject me.", next: "n2b" },
      ],
    },
    n1b: {
      text: "*A flicker of something \u2014 amusement, maybe \u2014 across the iron face.* The second envoy is your brother. *He turns the map slightly so you can read it.* I know exactly what I'd dislike about him. Now tell me what you've come to give me that he wouldn't.",
      choices: [
        { label: "A reason to stop.", next: "n2c" },
        {
          label: "The thing he's been hiding from you for two months.",
          next: "n2d",
        },
      ],
    },
    n2a: {
      text: "*He's quiet for a long time. Then he uncorks the pitcher on the table and pours two cups of wine without asking. The first one he sets in front of you.* Then we work through the night. *His voice, lower now.* If your father finds you before we have a treaty, I'll send my own riders to bring you back. You should know that before you speak the next sentence.",
      endLine: true,
    },
    n2b: {
      text: "*He doesn't react. A thousand commanders would react. He picks up his own cup and watches you over the rim.* I don't kill envoys. *A pause.* But I have wondered, more than once, what kind of woman walks into a war-camp prepared to be killed. *He sets the cup down.* Sit. We're going to disappoint each other in interesting ways before this is over.",
      endLine: true,
    },
    n2c: {
      text: "*The amusement leaves his face entirely. He looks at the map for a long moment, then folds it slowly.* I have been waiting eleven years for someone to give me a reason to stop. *He looks at you again, and the iron is gone.* You should know that no one I trusted has ever used those words to me. Sit. Carefully. The next thing you say will matter.",
      endLine: true,
    },
    n2d: {
      text: "*He goes very, very still. Then he stands, walks to the tent flap, and gives a quiet order to the guard outside. When he turns back the room has changed.* Then we're not negotiating a treaty. *He gestures to the chair.* Sit. And tell me everything from the beginning, slowly. *Quieter.* I will not interrupt.",
      endLine: true,
    },
  },
};

export default preview;
