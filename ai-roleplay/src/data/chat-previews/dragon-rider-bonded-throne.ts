import type { ChatPreview } from "./types";

/**
 * The Bonded Throne — opening throne-room confrontation.
 *
 * Player POV: a male rider candidate summoned to the dragon citadel.
 * AI character: the bonded queen, watching from the dais; her dragon
 * is the silent third presence in every choice.
 *
 * Beats: arrival → her test → your gambit → consequence + invitation.
 */
const preview: ChatPreview = {
  characterSlug: "dragon-rider-bonded-throne",
  intro:
    "*The throne-hall doors swing open. A black dragon coils at the foot of the dais, eye-slit narrowing as you cross the threshold. The woman on the throne does not stand.*",
  rootId: "n0",
  nodes: {
    n0: {
      text: "So. They sent me another rider candidate. *A small gesture \u2014 the dragon's head lifts.* Tell me why I shouldn't have him eat you on principle.",
      choices: [
        {
          label: "Because the southern citadel is burning, and you're the only queen left with bonded riders.",
          next: "n1a",
        },
        {
          label: "Try me first.",
          next: "n1b",
        },
      ],
    },
    n1a: {
      text: "*The dragon makes a low sound that might be amusement. She rises and walks the length of the dais.* You read the dispatches. Most candidates can't get past the wax seal. *She stops, watching you.* What does the second page say.",
      choices: [
        { label: "That you'll lose the gateway by midwinter.", next: "n2a" },
        {
          label: "That three of your sworn houses are already negotiating with the south.",
          next: "n2b",
        },
      ],
    },
    n1b: {
      text: "*Her eyes narrow. The dragon's tail twitches once against the marble. Then \u2014 surprise \u2014 a short, almost-laugh.* The last man who said that ran for the door before the dragon finished standing up. *She steps off the dais.* You didn't.",
      choices: [
        {
          label: "I rode my horse to death getting here. There's nowhere left to run.",
          next: "n2c",
        },
        {
          label: "I came to win or burn. I'll let you decide which.",
          next: "n2d",
        },
      ],
    },
    n2a: {
      text: "*She stops in front of you. The dragon settles \u2014 not retreating, but waiting.* Then we have until midwinter to make you a rider, and until spring to make you a lord. *Her gaze pins you.* You start tomorrow at dawn. If you survive the bond, I'll see you again at council \u2014 and we'll talk about the second page.",
      endLine: true,
    },
    n2b: {
      text: "*A flicker of something \u2014 anger, or grief \u2014 across her face, quickly buried.* Names. *She holds out a hand.* You give me three names and I give you a place in this hall. *Her voice drops.* Lie to me and the dragon will know.",
      endLine: true,
    },
    n2c: {
      text: "*She studies you for a long moment, then unclasps her cloak and lays it across the arm of the throne.* Then we'll find you a different reason to stay alive. *A small nod toward the dragon.* He's the easy part. The court is harder. *She turns toward the side door.* Walk with me.",
      endLine: true,
    },
    n2d: {
      text: "*Her mouth lifts at one corner. Not quite a smile.* You'll fit in here. *She gestures to the dragon, who lowers its head almost to the marble in front of you.* Touch him. Slowly. If he lets you, the bond starts tonight. If he doesn't \u2014 *a beat* \u2014 you'll have answered my question.",
      endLine: true,
    },
  },
};

export default preview;
