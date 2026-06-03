import type { ChatPreview } from "./types";

/**
 * The Centurion — frontier camp, the senator's daughter arrives.
 *
 * Player POV: a senator's daughter who has just delivered orders that
 * will undo half of the centurion's hard-won frontier strategy. AI
 * character: the centurion, dust-streaked from drill, reading the
 * orders by lamplight.
 *
 * Beats: arrival → his test → your gambit → consequence + the line
 * he is about to step over.
 */
const preview: ChatPreview = {
  characterSlug: "centurion",
  intro:
    "*The frontier camp smells of wet cloak-leather and woodsmoke. The centurion's tent is the warmest space in the valley. He is reading your father's orders by lamplight, and he has not invited you to sit.*",
  rootId: "n0",
  nodes: {
    n0: {
      text: "*He sets the seal-broken scroll down. Does not look at you yet.* These orders ask me to abandon the northern wall and march my legion three weeks south. *Now he looks up. Steady, exact, completely unimpressed by anyone's name.* Tell me, Daughter-of-the-Senate \u2014 did you read what you were carrying.",
      choices: [
        { label: "Every word. I know what they ask. I came anyway.", next: "n1a" },
        {
          label: "I wrote them. My father signed them because he didn't notice.",
          next: "n1b",
        },
      ],
    },
    n1a: {
      text: "*A small, dangerous nod.* Then we are having a different conversation than I expected. *He gestures, finally, at the chair on his side of the brazier.* Sit. Close. The walls of this tent are thin and the men who carried you here have ears. *Once you are seated:* If you knew what these orders cost \u2014 the wall, the alliance, the queen across it \u2014 then tell me what you are buying with them.",
      choices: [
        { label: "Time. Three weeks south is where the real betrayal is, and we have to be there before midwinter.", next: "n2a" },
        {
          label: "You. The Senate is moving to replace you, and these orders are the only way to keep your legion in your hands.",
          next: "n2b",
        },
      ],
    },
    n1b: {
      text: "*He goes very still. The kind of still that cavalry recognise as the moment before a charge.* Say that one more time. *Not anger \u2014 something closer to recognition.* Slowly. And tell me whether you are confessing to me as a soldier confesses to his commander, or as something else.",
      choices: [
        { label: "I forged them. Slowly enough that you'd see it. Quickly enough that the Senate wouldn't.", next: "n2c" },
        {
          label: "Both. Whichever answer keeps me in this tent past dawn.",
          next: "n2d",
        },
      ],
    },
    n2a: {
      text: "*He stands, paces once, sits back down.* Then we are not abandoning the wall, we are baiting a trap. *He takes the orders, folds them, holds them in the brazier flame.* My signature stays on the report that goes back to the Senate. Yours stays out of it. *He watches the parchment burn.* Tell me everything you know about what's waiting south. We have until the next watch-bell to plan, and after that we move.",
      endLine: true,
    },
    n2b: {
      text: "*A long, weighing silence. The lamp gutters once.* You came four hundred leagues to keep me my legion. *He sets the orders down very carefully, as if they might break.* Why. *The single word is gentler than any you've heard from him today.* And do not lie to me, Daughter-of-the-Senate. I will know.",
      endLine: true,
    },
    n2c: {
      text: "*He looks at you for a long moment, then \u2014 unmistakably \u2014 nods. Once. Like a soldier accepting a duty.* You committed treason in your father's hand to bring me a warning. *He stands, walks to the tent flap, gives a quiet order to the guard.* The orders are now misplaced. The Senate will be told they never arrived. *Quieter, returning to the brazier.* Sit. Tell me what you knew that I did not. Tell me how. And tell me why you risked the rope to do it.",
      endLine: true,
    },
    n2d: {
      text: "*He does not react to the line, but the lamp catches something complicated in his face.* Past dawn. *He says it like he's testing the shape of it.* Then we both have decisions to make before the watch-bell, and we are going to make them carefully. *He gestures to the chair again.* Sit. Closer this time. The walls of this tent are thin, and what we are about to discuss cannot leave it.",
      endLine: true,
    },
  },
};

export default preview;
