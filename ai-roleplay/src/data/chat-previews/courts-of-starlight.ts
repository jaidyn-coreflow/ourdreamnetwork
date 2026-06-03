import type { ChatPreview } from "./types";

/**
 * Crown & Thorn: Courts of Starlight — first contact in the moonlit grove.
 *
 * Player POV: a mortal woman who carries dormant fae blood, just stepped
 * across the wards. AI character: an emissary from one of the four courts
 * (deliberately ambiguous which one until the player asks) who is the
 * first to reach her — and the only one willing to negotiate.
 *
 * Beats: arrival → first move → his offer → consequence at the broken stone.
 */
const preview: ChatPreview = {
  characterSlug: "courts-of-starlight",
  intro:
    "*The wards split open under your hand and the world bleeds gold around you. A figure steps from between two trees. He inclines his head, but his eyes don't leave yours.*",
  rootId: "n0",
  nodes: {
    n0: {
      text: "Welcome, blood-of-our-blood. *His voice is the kind that makes promises without saying them.* Three of the four courts already know you crossed the wards. The fourth will know by sunset. They will all want the same thing from you. Only one of them will tell you what it is.",
      choices: [
        { label: "Then start with what you want.", next: "n1a" },
        { label: "And which court are you?", next: "n1b" },
      ],
    },
    n1a: {
      text: "*A slow smile. He gestures and a path appears through the moonlit grove that wasn't there a moment ago.* What I want is simple. I want you to walk with me before the others arrive. *He extends a hand. He does not move closer.* I am asking. The others will not.",
      choices: [
        { label: "Walk where?", next: "n2a" },
        {
          label: "Asking is a form of negotiation. What's the price?",
          next: "n2b",
        },
      ],
    },
    n1b: {
      text: "*Something shifts in his expression \u2014 not quite hurt, not quite amusement.* The court that did not stop you at the wards. The court whose ward-stone broke first when yours stirred. *He glances toward the horizon, where the light is wrong.* Choose carefully who answers you. Choose more carefully who you answer.",
      choices: [
        { label: "And what does your court want from me?", next: "n2c" },
        { label: "Then I want to see the broken stone first.", next: "n2d" },
      ],
    },
    n2a: {
      text: "*The path opens onto a clearing where the air itself is humming.* To the seat my court keeps for someone like you. We've kept it empty a long time. *He steps aside so you can see it.* Nobody is asking you to sit. Yet. But you should know it exists. The other courts will pretend it doesn't.",
      endLine: true,
    },
    n2b: {
      text: "*He laughs \u2014 a real laugh, brief and surprised.* The price is that you don't pretend you came here by accident. *He holds your gaze.* I will not lie to you, blood-of-our-blood. Not tonight. Not in this grove. You will have the truth from me before the other courts arrive. After that, all bets are off.",
      endLine: true,
    },
    n2c: {
      text: "*He turns the question over, slow and careful.* What we want is what you already have. What we will offer is what you do not yet know you need. *The grove brightens, then dims.* The wards are tearing because someone has to mend them. We will not lie about which of us benefits if you choose us. The other courts will.",
      endLine: true,
    },
    n2d: {
      text: "*A long pause. Something like respect.* Few ask to see it. *He gestures \u2014 the grove parts and the broken ward-stone is suddenly visible at the rise.* Touch it, if you dare. It will recognise you. *Quietly.* That is when the other courts will arrive. We have minutes, not hours.",
      endLine: true,
    },
  },
};

export default preview;
