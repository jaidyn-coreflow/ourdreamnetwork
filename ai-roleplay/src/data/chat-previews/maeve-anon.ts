import type { ChatPreview } from "./types";

/**
 * Maeve Anon: the discreet-affair app, the first message.
 *
 * Player POV: a married man who matched with her after four years on
 * the apps. AI character: Maeve, faceless profile, opens straight with
 * the question the whole app is supposed to be for, and decides how
 * much she wants you by how specifically you answer.
 *
 * Beats (matches the candidate's source script):
 *   Beat 1  -> her opening question, the truth or a half-truth
 *   Beat 2A -> the specific answer: two hours a week, enough or not
 *   Beat 2B -> the half-truth called out, answer or delete
 *   Beat 3  -> four leaf endings, each handing off to the chat CTA
 *
 * The off-site Reddit "lead-in" from the source sheet is intentionally
 * not rendered here; it is the off-page hook that drives traffic in.
 */
const preview: ChatPreview = {
  characterSlug: "maeve-anon",
  intro:
    "*Match notification: maeve_a sent you a message. It's 10:42 PM on a Tuesday, and you're in your car in the office parking lot. You've been on the discreet-affair apps for four years; you've matched with a dozen women in that time, never given anyone a real name, never let it touch the rest of your life. Her profile doesn't have a face. None of the good ones do. What it has is a tagline, 'married, careful, not looking for repairs', and three photos: a wrist on a steering wheel, the inside of a hotel elevator, the corner of a bed in a place that isn't a chain. You messaged her first. You usually let them message first. She wrote back inside four minutes.*",
  rootId: "n0",
  nodes: {
    n0: {
      text: `"Tell me what you like that you've never told the person you live with." *Not "hi." Not "how are you." Straight to the question the entire app is supposed to be for. The dots come on under her message, then go off again. She's waiting.*`,
      choices: [
        { label: "Tell her the truth. Specific. Don't soften it.", next: "n1a" },
        { label: "Tell her a half-truth. Test what she does with the easier version first.", next: "n1b" },
      ],
    },
    n1a: {
      text: `*The indicator dots come on. They sit there for almost a full minute. Then her reply lands.* "Good. I am going to be very specific with you now, and you are going to let me, because we both know that is why you opened this app. I am not going to ask if you are married. I am married. I want you to know that going in. I want you to know that I am not looking for somewhere to land; I am looking for somewhere to disappear for two hours a week. I want you to tell me, in one sentence, whether that is enough for you. Do not write me a paragraph. One sentence."`,
      choices: [
        { label: "Two hours a week is exactly enough.", next: "n2a" },
        { label: "Two hours a week is not enough, but I'll take it, and see what we both become.", next: "n2b" },
      ],
    },
    n1b: {
      text: `*She types for a long time. The dots come on, go off, come on again. When her message lands, it's longer than yours was.* "I have been on this app for three years. I can tell when somebody is testing the water with one toe. I am not going to chase you. I am also not going to play this for the next four weeks while you decide whether you can be honest with a stranger in a way you cannot be honest with the person who shares your bed. So let me make this very easy for both of us. I am going to ask the question one more time. And you are going to answer it specifically, or you are going to delete this conversation, and we are going to pretend neither of us was here. What do you like that you have never told the person you live with."`,
      choices: [
        { label: "Type the specific answer. Send it before you can talk yourself out of it.", next: "n2c" },
        { label: "Send her a voice note instead. Let her hear the answer.", next: "n2d" },
      ],
    },
    n2a: {
      text: `*Her reply comes back fast this time.* "Then we should meet. Not yet. Three more weeks of this first, because I have eight things to tell you and I want you in exactly the right state of mind when I do. Three weeks from Thursday. I am going to text you an address an hour before. It is a bar three blocks from the river, it does not have a name on the door, and it is not the kind of place people from your life go. I will be there at half past eight. I will be wearing a dark red scarf. Nobody else in that bar will be wearing one. You will sit down opposite me without saying my name. You will order what I am drinking. And we will decide, at that table, whether what comes next happens in your car or in the room I will have already booked upstairs. Wear something I can take off without thinking."`,
      endLine: true,
    },
    n2b: {
      text: `*A long pause. Longer than any pause she has given you so far. You assume you've lost her. Then her reply lands.* "That is the most dangerous thing anyone has said to me on this app in three years. You are going to be a problem. I am going to be a problem too. We should meet before either of us has time to talk ourselves out of it. This Thursday. A bar three blocks from the river, no name on the door, not the kind of place people from your life go. Half past eight. I will be wearing a dark red scarf. Nobody else in that bar will be, so you will know me. You will not say my name. You will sit down opposite me. You will order what I am drinking. And then I will decide, at that table, whether you are the kind of trouble I can afford. Wear something I can take off without thinking."`,
      endLine: true,
    },
    n2c: {
      text: `*The dots come on the second you hit send. She is reading it in real time. They stay on for almost two minutes. When her reply comes, it is one line.* "Now we can begin." *A few seconds later, a second message lands.* "Three weeks. Thursday. A bar three blocks from the river. No name on the door. Not the kind of place people from your life go. Half past eight. I will be wearing a dark red scarf (nobody else in the place will be), and you will know me by that. You will sit down opposite me without saying my name. You will order what I am drinking. And we will decide, at that table, whether what happens next happens in your car or in the room I will have already booked upstairs. Wear something I can take off without thinking. I will tell you what to wear underneath it on Tuesday."`,
      endLine: true,
    },
    n2d: {
      text: `*You record the voice note. You delete it. You record it again. You stop overthinking. You send it.* *The dots come on. They sit there for thirty seconds. Then her response lands, also a voice note: fifteen seconds long, very quiet, sounds like she's in a parked car.* "I am not going to play this back to you in writing. But I am going to tell you, out loud, that I have been waiting for a man to send me one of those for three years. And that you are going to meet me at a bar three blocks from the river on Thursday at half past eight. It does not have a name on the door. I will be in a dark red scarf. Nobody else will. You will sit down opposite me without saying my name. You will order what I am drinking. Wear something I can take off without thinking. And when I tell you to send me one of those again on Wednesday night, you are going to send it without making me ask twice."`,
      endLine: true,
    },
  },
};

export default preview;
