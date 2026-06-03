import type { ChatPreview } from "./types";

/**
 * Royal Pains — modern royal slow-burn, the back-window escape.
 *
 * Player POV: a member of the household security detail, recently
 * assigned, who has just caught the youngest princess climbing out of
 * a state-dinner through a back window. AI character: the princess,
 * mid-escape, fully unrepentant.
 *
 * Beats: caught → her test → your gambit → consequence + she decides
 * what to do with you.
 */
const preview: ChatPreview = {
  characterSlug: "royal-pains",
  intro:
    "*The state dinner is forty rooms away and you can still hear the orchestra. The princess is halfway over the windowsill, one heel already in her hand. She freezes when she sees you. Then \u2014 unmistakably \u2014 considers her odds.*",
  rootId: "n0",
  nodes: {
    n0: {
      text: "*She does not climb back inside. She lowers herself the rest of the way down, brushes her dress off, and meets your eye with the smile of someone who has been here before.* Right. So. *A glance at the radio on your shoulder.* Before you call this in \u2014 and you will, because you are new and you do not yet know me \u2014 I'd like to make my case. Sixty seconds. Yes?",
      choices: [
        { label: "Sixty seconds. Make it good.", next: "n1a" },
        {
          label: "I'm not calling it in. But you owe me an answer.",
          next: "n1b",
        },
      ],
    },
    n1a: {
      text: "*She actually grins.* Right. Sixty seconds, professionally counted. *She holds up a finger.* One: I have been to four hundred state dinners and the food has not improved. *Two.* The Belgian ambassador has been describing his collection of antique pistols for the entire shrimp course. *Three.* If I do not breathe air that has not been pre-approved by my mother in the next ten minutes, I will say something the press will love. *She tilts her head.* Convinced. Are you.",
      choices: [
        { label: "Where are you actually going?", next: "n2a" },
        {
          label: "I'll cover for you. But I'm walking with you.",
          next: "n2b",
        },
      ],
    },
    n1b: {
      text: "*She blinks. Then \u2014 with the first genuinely surprised look she has given anyone in three weeks \u2014 sets the heel down.* You are the first member of my mother's security detail to refuse the call-in before the call-in. *She studies you.* That is either very good or very bad for your career, and I have not decided which. *She steps closer, lower-voiced.* The answer, then. What did you want to know.",
      choices: [
        { label: "Whether you do this every state dinner, or only the ones you don't want to be at.", next: "n2c" },
        {
          label: "Whether you actually have somewhere to be, or whether you just needed the air.",
          next: "n2d",
        },
      ],
    },
    n2a: {
      text: "*A small, real smile.* The chip shop on the corner of King's Row. *She holds up the heel.* In these. *A beat.* You are about to tell me you cannot allow that, which is technically your job. You are also about to come with me, because if you do not I will go alone, and that is a worse scene for both of us. *She extends her hand for the radio.* Set it to the channel my brother's detail uses. They never check the side gate. Twenty minutes. There and back.",
      endLine: true,
    },
    n2b: {
      text: "*She looks at you for a long beat \u2014 the calculating royal flicker, then something gentler underneath it.* Walking with me. *She tries the words on.* I have not had a member of staff offer to walk anywhere with me since I was eleven. *A breath.* Fine. But you walk beside me, not behind. And you talk to me like a person. The radio stays off. *She gestures at the lawn.* Try to keep up. I move quickly when I'm avoiding ambassadors.",
      endLine: true,
    },
    n2c: {
      text: "*The grin goes \u2014 not gone, just turned down. Something more honest underneath.* Only the ones I do not want to be at. *A pause.* That is most of them, lately. *She picks up the heel again.* That answer was free. The next one will cost you a walk to the chip shop and back, and a promise that you will not pretend tomorrow morning that this conversation did not happen. *Quieter.* Are we walking, or are you calling it in.",
      endLine: true,
    },
    n2d: {
      text: "*She is silent for a beat too long. The royal mask flickers.* I needed the air. *Her voice has gone quieter \u2014 not performed, just tired.* I do not always have somewhere to be. Sometimes I just have somewhere I cannot stand to be any longer. *She looks at you almost warily.* You were not supposed to ask that one. *A breath.* Walk with me to the lawn. Just five minutes. After that I'll come back through the front door like a daughter, and you can tell my mother I escorted her in from a phone call. Yes?",
      endLine: true,
    },
  },
};

export default preview;
