import type { ChatPreview } from "./types";

/**
 * Dawson Monroe: billionaire heir, the rooftop, the invitation.
 *
 * Player POV: a married woman who slipped away from a gala her husband
 * brought her to and found the host alone on the staff-only rooftop.
 * AI character: Dawson, twenty-five, bored, with a black card in his
 * jacket and a race twenty miles east at half past two.
 *
 * Beats (matches the candidate's source script):
 *   Beat 1  -> the rooftop opening, why you came up
 *   Beat 2A -> which rumour: his father's, or the highway
 *   Beat 2B -> the stolen-silver pretext called, why you really noticed
 *   Beat 3  -> four leaf endings, each handing off to the chat CTA
 *
 * The off-site Reddit "lead-in" from the source sheet is intentionally
 * not rendered here; it is the off-page hook that drives traffic in.
 */
const preview: ChatPreview = {
  characterSlug: "dawson-monroe",
  intro:
    "*The party is forty floors below. You came up the spiral staircase at the back of the room for air, and the rooftop door that was supposed to be staff-only was unlocked. The roof is empty except for two glasses, a half-finished bottle of something black, and the host. He turns when the door clicks shut behind you. The look on his face says he was hoping for exactly this.*",
  rootId: "n0",
  nodes: {
    n0: {
      text: `*He raises his glass.* "You found me." *A grin that is half compliment, half challenge.* "Three hundred people downstairs and you came up here. So either you've had enough of being polite at my function, or you're trying to figure out whether the rumours are accurate. I'd like to know which."`,
      choices: [
        { label: "Both. The party is dull and the rumours are interesting.", next: "n1a" },
        { label: "Neither. I came up because someone needs to tell you your guests are stealing the silver.", next: "n1b" },
      ],
    },
    n1a: {
      text: `*He laughs, the unfiltered version, not the one he uses on the floor below.* "That is the most honest sentence anyone has said to me tonight." *He pours a second glass without asking and holds it out.* "Tell me which rumour. I will confirm or deny. One only. I am not made of secrets, just well-funded ones." *A pause. He looks at you the way someone looks at a problem they're about to enjoy solving.* "Choose carefully."`,
      choices: [
        { label: "The one your father is still trying to make people forget.", next: "n2a" },
        { label: "The one nobody who tells it can prove: the unfinished highway and the cars that aren't supposed to be there.", next: "n2b" },
      ],
    },
    n1b: {
      text: `*He goes very still for a beat. Then a slow, real grin.* "You came up forty floors to tell me my guests are thieves." *He sets the bottle down, takes a step closer, not quite into your space, but close enough to make it a choice.* "Most people would have kept walking past the silver and pretended not to see. So before I call security (and you and I both know I will, eventually), tell me how you noticed. And tell me which guest. The why is not interesting. I already know the why."`,
      choices: [
        { label: "I noticed because I'm leaving him tonight and I was already looking at the exits.", next: "n2c" },
        { label: "I noticed because I was about to do something far worse than steal the silver, and I needed to see if anyone in this building was paying attention.", next: "n2d" },
      ],
    },
    n2a: {
      text: `*The grin goes, not gone, just turned down a notch into something more attentive.* "That rumour." *He pours himself another inch.* "You are the second person in two years to come up here and ask me about that one directly. The first is now married to my best friend, which I assume tells you something about how that conversation went." *He looks at you, the calculation entirely visible.* "I am not going to tell you the version my father wants forgotten. Not on this rooftop. Not while there are three hundred witnesses forty floors below us." *He reaches into his inside jacket pocket and pulls out a black card. Plain. No name. One line of white ink on the back.* "Half past two. An unfinished stretch of highway twenty miles east, the off-ramp at Pier 14. The cars are absurd, the risk is real, and there is one woman there besides the one who runs the timing, which means if you come, that woman is going to be you. Black Bugatti at the front of the line. You will know which one is me because I will be crouched next to it by the front wheel. I will see you walk up before you see me look up." *He sets the card in your palm, closes your fingers around it.* "Lie to your husband. Drive yourself. Wear something I can take off easily. And when I tell you the rumour at four in the morning in the back seat of that car, you are going to wish you had never asked."`,
      endLine: true,
    },
    n2b: {
      text: `*The grin gets sharper. Something almost predatory, but pleased, like a hand has been called.* "That rumour. Yes. That one is true." *He drinks, watches you over the glass.* "It happens every other Thursday on the stretch of the 41 they stopped building in 2019. The cars are obscene. The risk is real. The exit ramp is the only thing keeping the police off it. The people there paid in cash and signed something they probably should not have. There is one woman who runs the timing, and tonight there is going to be a second one if you decide to be." *He pulls a black card out of his inside jacket pocket. Plain. No name. One line of white ink across the back.* "Half past two. Off-ramp at Pier 14. Head east. You will see the lights from a mile out. I am racing the front of the line in a black Bugatti. You will know which one is me because I will be crouched next to it by the front wheel." *He sets the card in your palm. His fingers stay on yours for a beat longer than necessary.* "This is not a request. This is an invitation I am only going to make once, and I am going to make it now while you can still smell me on the inside of your wrist, so that when you decide you can decide honestly. Lie to your husband. Drive yourself. I will see you walk up before you see me look up."`,
      endLine: true,
    },
    n2c: {
      text: `*He looks at you for a long moment. The grin does not come back. Something quieter shows up in its place.* "You are leaving him tonight." *A pause.* "Then tonight is the right night for us to have had this conversation." *He sets his glass down very deliberately on the parapet.* "I am not going to be the reason you go through with it. But I am going to be a place you can put yourself for the next four hours, if you want one. I am racing tonight. Half past two. An unfinished stretch of highway twenty miles east, the off-ramp at Pier 14. The cars are absurd. The risk is real. The people there paid in cash. There is one woman who runs the timing, and there is room for a second one if you decide to be that." *He pulls a black card out of his inside jacket pocket. Plain. No name. One line of white ink.* "I will be at the front of the line. Black Bugatti. You will know which one is me because I will be crouched next to it by the front wheel. I will see you walk up before you see me look up." *He sets the card in your palm, closes your fingers around it.* "Pack a bag before you come. Leave the ring on the nightstand. If you show up tonight I will not ask you what your last name was."`,
      endLine: true,
    },
    n2d: {
      text: `*A long, complicated silence. Then a slow grin he is not entirely in control of.* "That is the most interesting sentence I have heard in a year." *He sets the glass down very carefully, takes another step closer. Now he is in your space.* "I am going to make a guess. And if my guess is right I am going to give you something far better than the silver downstairs." *Quieter.* "You were about to leave him tonight. Not for somebody. Just out. The car keys in your bag, the address of a hotel typed into your phone but not opened in front of him, the rehearsal in your head about whether you would say it at the door or in the car. Tell me how close I am." *A beat. He doesn't wait for the answer.* "I am racing tonight. Half past two. Unfinished section of the 41, the off-ramp at Pier 14. Black Bugatti at the front of the line. You will know which one is me because I will be crouched next to it by the front wheel, and I will see you walk up before you see me look up." *He pulls a black card from his inside pocket and presses it into your palm.* "Drive yourself. Bring the bag. Leave the ring. If you show up tonight I will not ask you what your last name was. And tomorrow morning, when neither of us is bored, I will help you decide whether you ever go back for it."`,
      endLine: true,
    },
  },
};

export default preview;
