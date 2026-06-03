import type { ChatPreview } from "./types";

/**
 * Quilana Vaelrith — first private encounter in the Vaelrith library.
 *
 * Player POV: a stranger from a distant land who has just arrived at
 * House Vaelrith with no obvious ambition. AI character: the tsundere
 * vampire princess, betrothed to someone she despises, who has just
 * caught you alone in her family's library after midnight.
 *
 * Beats: discovery → her test → your gambit → consequence + the first
 * crack in the ice.
 */
const preview: ChatPreview = {
  characterSlug: "quilana-vaelrith",
  intro:
    "*The Vaelrith library is twelve floors high and lit, at this hour, by a single lamp at one of the long reading tables. You did not expect to find her here. She did not expect to be found.*",
  rootId: "n0",
  nodes: {
    n0: {
      text: "*She does not raise her head from the book. The lamp catches the edge of her cheekbone and nothing else.* Whoever you are, you are several corridors past where guests are permitted at this hour. *Her voice is impossibly even.* Either you are lost, in which case you should turn around, or you are not, in which case you should explain yourself before I have to call for the steward.",
      choices: [
        { label: "I'm not lost. I came looking for someone who wasn't at the betrothal feast.", next: "n1a" },
        {
          label: "I'm reading the same book on the third floor. I came down to check what edition you had.",
          next: "n1b",
        },
      ],
    },
    n1a: {
      text: "*She closes the book. Slowly. Sets it down. Now she looks at you \u2014 sharp, severe, mildly insulted that you found her at all.* My absence from the feast was a private matter. *A beat.* You are the foreigner. *Another beat \u2014 fractionally too long, like she's annoyed she remembered.* The court cannot place you. I cannot place you. I imagine that is intentional. Was it.",
      choices: [
        { label: "It was. I came here without a story so I could choose one once I knew which house needed which.", next: "n2a" },
        {
          label: "It wasn't. I genuinely have no business at your court. That seems to bother people more than I expected.",
          next: "n2b",
        },
      ],
    },
    n1b: {
      text: "*She blinks once. The faintest narrowing of her eyes, which on her registers as actual surprise.* You are reading the third volume of the Vaelrith codex on a guest visit. *A pause.* That is either very impressive or very suspicious, and I have not decided which. *She gestures, with poor grace, at the chair across from her.* Sit. Tell me what you make of the chapter on the Vaelrith southern lineage. I would like to know whether to dismiss you or to be alarmed.",
      choices: [
        { label: "I think the southern lineage didn't fail \u2014 it was failed. The dates don't agree with the official history.", next: "n2c" },
        {
          label: "I think the chapter is a forgery. Whoever wrote it had reason to make your house seem older than it is.",
          next: "n2d",
        },
      ],
    },
    n2a: {
      text: "*A long, considering silence. Her face does not move, but the lamp catches something complicated in her eyes.* That is the first honest sentence I have heard at this court in three months. *She returns to her book \u2014 but does not close it again.* You will leave the library before the next bell. You will not mention this conversation. *Quieter.* You will, however, be in the south garden tomorrow at the third hour. I will have decided by then whether you are useful or merely interesting.",
      endLine: true,
    },
    n2b: {
      text: "*The corner of her mouth does something that is almost, but not quite, a smile.* Then you are either a fool or the most dangerous person in this house. *She closes the book.* I do not yet know which. *She rises \u2014 the candle catches the embroidery of her robe, severe and old.* Walk with me to the corridor. Quietly. The steward should not know I was here either, and he certainly should not know I was here with you.",
      endLine: true,
    },
    n2c: {
      text: "*She is perfectly still for a long moment.* You read three volumes very carefully on a guest visit. *Her tone has shifted \u2014 still cool, but the disdain is gone.* The southern lineage was failed. By a name I cannot say in this library after dark. *She gestures sharply at the chair across from her.* Sit. We have until the next bell. After that you will leave by the eastern stair, and you will not have been here. *Quieter.* If you tell anyone what we are about to discuss, it will be the last conversation either of us has.",
      endLine: true,
    },
    n2d: {
      text: "*She goes very still.* You are the third person in eighty years to notice. *A breath.* The other two are dead. *She looks at you for a long, level moment, and the iron princess flickers \u2014 just for a heartbeat \u2014 into something younger and more tired.* Sit down. Now. Quietly. *She closes the book.* If you leave this library tonight without telling me how you knew, I will assume you are an enemy. If you tell me, I will assume you are something I do not yet have a word for. Choose carefully.",
      endLine: true,
    },
  },
};

export default preview;
