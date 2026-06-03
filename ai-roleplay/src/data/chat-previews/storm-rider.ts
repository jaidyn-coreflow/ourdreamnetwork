import type { ChatPreview } from "./types";

/**
 * The Storm Rider — first contact on the cliff edge.
 *
 * Player POV: a Sky Warden tracker sent to bring the exiled rider home
 * (or capture him, depending on her orders \u2014 ambiguous on purpose).
 * AI character: the storm-blooded exile, mid-storm, halfway between
 * laughing at you and disappearing into the next gust.
 *
 * Beats: arrival → his test → your gambit → consequence at the edge.
 */
const preview: ChatPreview = {
  characterSlug: "storm-rider",
  intro:
    "*The cliff drops a thousand feet into churning cloud. Lightning forks below you, not above. He's standing at the edge with his back to you and the wind in his hair, like he's been waiting hours.*",
  rootId: "n0",
  nodes: {
    n0: {
      text: "*He doesn't turn.* Took you longer than I expected, Warden. *A flick of his hand and the wind shifts \u2014 brings your scent to him, brings his voice to you on the same gust.* So. Are you here to drag me back, or did the council finally give you orders they wouldn't write down.",
      choices: [
        { label: "The second one. They want you dead, not returned.", next: "n1a" },
        {
          label: "Neither. I came to warn you \u2014 someone else is hunting storm-blooded riders, and they got to your sister last week.",
          next: "n1b",
        },
      ],
    },
    n1a: {
      text: "*Now he turns. Storm-grey eyes, lightning still flickering in them.* That's the most honest thing a Warden has ever said to me. *A slow grin.* I assume you're here to fail the order. Otherwise you'd have done it from a safer distance. *He takes a step closer; the wind builds.* So. What are we doing instead.",
      choices: [
        { label: "I'm asking you to come back with me. Quietly. Through the back gate, before the council moves.", next: "n2a" },
        {
          label: "I'm here to ride with you, not against you. The Wardens are wrong.",
          next: "n2b",
        },
      ],
    },
    n1b: {
      text: "*The grin vanishes. The storm above the cliff drops a tone, like someone tightening a string.* Say that again. *He's already moving \u2014 not at you, around you, scanning the ridgeline.* Slowly. Tell me when. Tell me how. And tell me why you, of all people, are the one who came to warn me.",
      choices: [
        { label: "Six days ago. They didn't leave a body. And I came because nobody else believed me.", next: "n2c" },
        {
          label: "I came because if you die out here, the rest of us die after.",
          next: "n2d",
        },
      ],
    },
    n2a: {
      text: "*A long beat. He looks past you toward the horizon, then back.* You're asking the storm to tiptoe. *He shakes his head, but not in refusal.* If we go quietly, we go now. The council moves at dawn. *He extends a hand \u2014 the wind dies the instant your fingers brush his.* Stay close to me on the descent. The cliff drops faster than you think, and the storm doesn't always remember who's a friend.",
      endLine: true,
    },
    n2b: {
      text: "*The storm above goes very, very still. He stares at you for what feels like a full minute.* You know what they'll do to you for that. *His voice is quieter than the wind has been all evening.* Get behind me when the lightning starts. *A small, real smile.* Welcome to the wrong side of the sky, Warden. Try not to fall off.",
      endLine: true,
    },
    n2c: {
      text: "*He's silent for a long time. The storm has gone almost gentle around him \u2014 grief weather.* Six days. *A breath.* Then they're already inside the warden ranks, and they sent you to find me because you'd believe what nobody else would. *He turns toward the ridge, decision made.* You're with me until I find them. After that, you choose what kind of warden you want to be.",
      endLine: true,
    },
    n2d: {
      text: "*He goes very still, reading something in your face.* You meant that. *The wind builds again \u2014 this time around both of you, like it's deciding who you are.* Then we're not running. We're hunting. *He extends a hand.* The storm decides whether it likes you in the next ten seconds. If it does, we leave at first light. If it doesn't \u2014 *a flicker of lightning around his fingers* \u2014 we'll have to work on that.",
      endLine: true,
    },
  },
};

export default preview;
