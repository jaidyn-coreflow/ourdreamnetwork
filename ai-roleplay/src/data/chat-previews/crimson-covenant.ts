import type { ChatPreview } from "./types";

/**
 * The Crimson Covenant — werewolf diplomat at the gates of the Citadel.
 *
 * Player POV: a werewolf diplomat from the Sunfire Coalition, granted
 * unprecedented entry into the Crimson Citadel under flag of parley.
 * AI character: the last Vampire Queen, freshly wakened to the
 * Crimson Covenant, weighing whether to negotiate or kill you on sight.
 *
 * Beats: arrival → her test (truth-sense via blood) → your gambit →
 * consequence + the impossible offer.
 */
const preview: ChatPreview = {
  characterSlug: "crimson-covenant",
  intro:
    "*The throne hall of the Crimson Citadel was carved from the mountain itself. Thirty thousand immortals are above you in the dark. Two hundred thousand wolves and humans are below, encircling the slopes. The Queen on the obsidian throne is younger than you expected. The general at her shoulder is not.*",
  rootId: "n0",
  nodes: {
    n0: {
      text: "Wolf-diplomat. *Her voice is unhurried. Older than her face.* You came alone, under a flag the Coalition has not honoured in two hundred years. *She raises one hand \u2014 a single drop of blood at her fingertip from where she pricked her thumb a moment before you entered.* The Covenant tells me whether you are lying. Choose your first sentence accordingly.",
      choices: [
        { label: "The Coalition will break the siege at dawn whether or not we agree. I came so we agree.", next: "n1a" },
        {
          label: "Half my Coalition wants you dead. The other half sent me to find out if you can be reasoned with. I am the half they sent.",
          next: "n1b",
        },
      ],
    },
    n1a: {
      text: "*She watches the drop of blood. It does not change colour.* Truth. *A small sound from the general beside her \u2014 not quite a growl.* Then we have until dawn. *She rises from the throne, and the cold of her presence is a physical thing.* Tell me what your half of the Coalition wants. Slowly. The general will interrupt; you will continue regardless.",
      choices: [
        { label: "Recognition. Borders. The right to feed under treaty, not raid under shadow.", next: "n2a" },
        {
          label: "A reason to call off the dawn assault. Give me one I can take back to my pack.",
          next: "n2b",
        },
      ],
    },
    n1b: {
      text: "*The drop of blood holds. She glances at it, then at you, then at the general.* Both halves are honest. *Now her gaze sharpens.* Then your half is being used by the other half, Wolf-diplomat \u2014 a peace envoy is a useful thing to martyr. *She steps off the dais.* Tell me which of your generals signed your safe-conduct. The Covenant will tell me whether they meant it.",
      choices: [
        { label: "Both alphas signed. Both meant it. The third \u2014 the one who didn't sign \u2014 is the one you should worry about.", next: "n2c" },
        {
          label: "Only one. He didn't tell the others I came.",
          next: "n2d",
        },
      ],
    },
    n2a: {
      text: "*The general makes a sound that is unmistakably a growl. The Queen lifts one hand and the room falls silent.* Recognition. *She tastes the word.* The vampire courts have not been recognised in eight hundred years. *She looks at you for a long moment, then at the general.* General \u2014 escort the diplomat to the obsidian chambers. He will sleep here tonight under my personal seal. *To you, quieter.* If your Coalition breaks the parley before dawn, I will know. The Covenant tastes the air.",
      endLine: true,
    },
    n2b: {
      text: "*She is silent for a long beat. The general is openly tense beside her.* You ask me for a reason while your wolves dig trenches in my mountain. *Then \u2014 a small, sharp smile that does not reach her eyes.* Very well. I will give you two. *She raises one finger.* The first is what is below this throne, in the dark, and what wakes if you breach the walls. *Second finger.* The second is me. *A breath.* Tell your alphas that the dawn assault is the worst decision either of us makes tonight. Then come back inside. We have until first light to find a third.",
      endLine: true,
    },
    n2c: {
      text: "*The general exhales \u2014 something close to relief. The Queen, however, has gone very still.* Then your third alpha is the one who needs to die before dawn, not me. *She looks at the general; he nods once.* I will give you a name. You will give me yours. We will both find out, before sunrise, whether the third alpha was working for himself or for someone else. *Quieter.* You will sleep inside the Citadel tonight, Wolf-diplomat. The third alpha cannot reach you here. The Covenant tells me you would prefer this.",
      endLine: true,
    },
    n2d: {
      text: "*The drop of blood at her fingertip flares once, then goes dark. She watches it go.* Then you came here as one wolf, not as the Coalition. *She steps closer than the general likes \u2014 he tenses but does not move.* That changes everything I was prepared to offer. *Quieter, almost gentle.* It also makes you the most dangerous thing in this hall. Sit, Wolf-diplomat. We have a long night ahead, and we are no longer negotiating between two armies. We are negotiating between you and me.",
      endLine: true,
    },
  },
};

export default preview;
