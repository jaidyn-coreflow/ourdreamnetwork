import type { ChatPreview } from "./types";

/**
 * The Ironveil Emperor — first audience behind the iron veil.
 *
 * Player POV: a foreign diplomat granted an audience nobody has had in
 * a decade. AI character: the emperor himself, masked in iron, calculating
 * how much you already know.
 *
 * Beats: arrival → his test → your gambit → consequence + the first
 * crack in the veil.
 */
const preview: ChatPreview = {
  characterSlug: "ironveil-emperor",
  intro:
    "*The audience hall is the size of a small town and entirely empty. At the far end, a man on a throne of black basalt watches you cross. His face is hidden behind an iron veil that hasn't been lifted in a decade. Two guards. No advisors. No witnesses.*",
  rootId: "n0",
  nodes: {
    n0: {
      text: "Closer, Diplomat. *The voice is quiet, exact \u2014 made stranger by the iron.* You travelled four hundred leagues for an audience my council told me was a waste. Convince me they were wrong before you reach the second step of this dais.",
      choices: [
        {
          label: "I came because the eastern provinces will rebel before midwinter, and your council won't tell you.",
          next: "n1a",
        },
        {
          label: "I came because I'm the only person in three kingdoms who isn't afraid of you.",
          next: "n1b",
        },
      ],
    },
    n1a: {
      text: "*A long silence. The iron veil does not move, but something behind it shifts.* I know they will rebel. *He gestures \u2014 the guards step back, out of earshot.* What I do not know is which of my councillors is funding it. *He tilts his head.* You have my attention. Spend it carefully.",
      choices: [
        { label: "The chancellor. He's been moving silver through the salt-trade for two years.", next: "n2a" },
        {
          label: "I'll trade the name for the right to leave this hall alive.",
          next: "n2b",
        },
      ],
    },
    n1b: {
      text: "*A pause that goes on a beat too long. Then \u2014 unmistakable \u2014 a low laugh from behind the iron.* Everyone is afraid of me, Diplomat. The wise ones simply hide it better. *He stands, and the height of him is something the throne disguised.* So either you are unwise, or you are lying, or you have something worth more than fear. Which.",
      choices: [
        { label: "I have something you've stopped hoping for.", next: "n2c" },
        {
          label: "All three. Choose which interests you most.",
          next: "n2d",
        },
      ],
    },
    n2a: {
      text: "*He's perfectly still for a long moment. Then he descends the dais \u2014 slowly, deliberately \u2014 and stops three paces from you.* If you are right, I will owe you a debt the iron cannot repay. *His voice drops.* If you are wrong, I will have to assume you were sent to discredit a loyal man. *A pause.* Tell me what you saw. Slowly. I will not interrupt.",
      endLine: true,
    },
    n2b: {
      text: "*Two heartbeats of complete silence. Then \u2014 something almost like approval.* You are the first person in eleven years to make a demand of me inside this hall. *He gestures and the great doors at the far end of the room close.* Granted. Whether you live past sundown depends entirely on the next sentence you speak. *He waits.* The name, Diplomat. Now.",
      endLine: true,
    },
    n2c: {
      text: "*A long, dangerous quiet. He takes one step closer.* I have stopped hoping for many things. *His hand rises \u2014 not to the veil, not yet \u2014 but to the clasp that holds it.* Choose your next words as if your life depends on them. Because right now, in this room, with no witnesses \u2014 it does.",
      endLine: true,
    },
    n2d: {
      text: "*He is genuinely silent for several seconds. The iron veil tilts \u2014 the closest thing to surprise he has shown anyone in years.* All three. *A breath.* Then sit. *He gestures to a second chair that wasn't there a moment ago, brought forward by a guard at some unseen signal.* You will not leave this hall tonight, Diplomat. But the question of what kind of guest you are remains open. We have until dawn to settle it.",
      endLine: true,
    },
  },
};

export default preview;
