import type { ChatPreview } from "./types";

/**
 * Adrian Wolfe: literature professor, the public reading.
 *
 * Player POV: a student of his seminar who turned up to a public
 * reading at Grayford Library after eight weeks of charged office-hours
 * tension. AI character: the professor at the lectern, who leans into
 * your row before he begins and asks you to choose which version of the
 * lecture he reads.
 *
 * Beats (matches the candidate's source script):
 *   Beat 1  -> opening: he leans in, two versions of the lecture, choose
 *   Beat 2A -> faculty version: where should he look at the comma
 *   Beat 2B -> real version: he reads the footnote, what happens after
 *   Beat 3  -> four leaf endings, each handing off to the chat CTA
 *
 * The off-site Reddit "lead-in" from the source sheet is intentionally
 * not rendered here; it is the off-page hook that drives traffic in.
 */
const preview: ChatPreview = {
  characterSlug: "adrian-wolfe",
  intro:
    "*The reading room at Grayford Library has the kind of acoustics that make you feel watched. A hundred chairs in rows, half of them filled, the lectern empty. You're in the third row, second seat in from the aisle: front but not centre, the way you always pick a seat in his seminar, and you're pretending to read the programme they handed you at the door. When you look up, he's already looking at you. He's behind the small podium against the wall, sorting a stack of notes the way he does in office hours, glasses pushed into his hair, sleeves already rolled. He doesn't pretend he hadn't been looking; he holds your gaze a beat longer than is strictly professional, then sets the notes down and walks off the small step toward the front row. He stops at the end of your row, and the man two seats over makes space without being asked. He doesn't sit. He leans down, one hand on the back of the chair in front of yours, the other in his pocket, and his voice is very low, the way it was in his office last Tuesday.*",
  rootId: "n0",
  nodes: {
    n0: {
      text: `"You came." *A small, almost embarrassed smile.* "I have been writing my opening paragraph in my head for an hour, and rewriting it every time I imagined you not being here. I would now like you to do something for me, and it is going to sound petty, but I am being entirely sincere. I have two versions of this lecture in my notes. One of them is the one the head of faculty would approve. The other is the one I actually want to give. They diverge on page two. Tell me which one to read."`,
      choices: [
        { label: "Read the version the head of faculty would approve.", next: "n1a" },
        { label: "Read the one you actually want to give.", next: "n1b" },
      ],
    },
    n1a: {
      text: `*A small, real smile. He looks down at his shoes for a beat, then back up at you.* "Of course you would say that. You came here in part to test me, didn't you. The careful one, or the other one." *He laughs once, short, surprised, almost private.* "Fine. I will read the head of faculty's version. But I want to know, for the next forty-five minutes, where I should look when I get to the comma in the second clause. Because we both know the comma is in both versions. The head of faculty hasn't read carefully enough to know that. Front row, third in from the aisle, is where my eyes go when I get nervous on stage. I am telling you this so that you can decide whether you'd like me to be nervous tonight."`,
      choices: [
        { label: "Look at me when you get to the comma. Don't pretend you didn't.", next: "n2a" },
        { label: "Don't look at me. Make me wait for you to find me afterwards.", next: "n2b" },
      ],
    },
    n1b: {
      text: `*He goes very still. Then a small, dangerous smile.* "You are reckless. I knew you were going to be reckless." *He stays leaned over the chair, his voice still low.* "The version I actually want to give starts with a footnote. Yes, that footnote, the one from your reading on page forty, and it argues that Jane Eyre is a novel written for people who have been left in silence by people who should have known better, and that the most important sentence in the book is the one she never says to him and he never asks. The head of faculty considers this 'embarrassingly emotional reading'. I have been waiting four years to read it out loud to a room. Tonight I am going to. Which means at the end of this lecture, when the room empties, you and I are going to have a conversation about what we both knew was going to happen between us the moment you opened that door at half past eight last Tuesday."`,
      choices: [
        { label: "Then read it. I want to hear you say the footnote in front of fifty strangers.", next: "n2c" },
        { label: "Skip the footnote. Let me come ask you about it when the room is empty.", next: "n2d" },
      ],
    },
    n2a: {
      text: `*A slow, quiet smile, the private one from his office.* "I will look at you when I get to the comma. I am going to lose my place. The head of faculty is going to think I forgot my own argument. I am going to pretend I forgot my own argument. And then I am going to find my place again and keep reading, and I am going to look at you twice more before the lecture is over, so that the third time it becomes a habit." *He glances at his watch. Six minutes until.* "Stay seated when the room empties. Don't get up with the others. I will need a minute to gather my notes." *He straightens, turns to walk back to the podium, then, over his shoulder, almost to himself:* "I have been thinking about your shirt buttoned wrong on purpose for seven days."`,
      endLine: true,
    },
    n2b: {
      text: `*A small, dry exhale.* "You are going to make me work for the second time in eight days. Fine." *He smiles, slow, almost shy.* "I will not look at you. I will pretend I cannot see the third row, second seat in from the aisle, even though I will be deliberately not looking at exactly that spot for the next forty-five minutes. And I am going to read both halves of the comma like there is no one in the room. And when the room empties (and it will empty slowly tonight, because the reading room always does), I want you to stay in your seat. Do not get up with the others. I will need a minute to gather my notes." *He pauses, looks at you properly for the first time tonight.* "Last Tuesday you said *stop being careful*. I have been very careful since. I would like to know, tonight, whether you would like me to keep being careful, or whether you would like me to find out which of my other theories about you were right. You can tell me after."`,
      endLine: true,
    },
    n2c: {
      text: `*A long, slow breath. Then a real, private grin.* "You are not going to make tonight easy for me. Good. I have been making things too easy for myself in this department for nearly a decade." *He stands up off the chair, but does not move yet.* "I will read the footnote out loud. I will read it twice, once at page two and once at the end, when I am supposed to be wrapping up. The head of faculty will be in the third row from the back, taking notes. He will not enjoy himself. I am going to look at you when I get to the comma in the second clause." *A small, careful pause.* "Do not get up when the room empties. The reading room is the last to empty; there will be ten minutes when it is essentially just you and me and the chairs. I will need a minute to gather my notes." *Quieter.* "I would like, very much, to find out whether you came here for the lecturer or for the man."`,
      endLine: true,
    },
    n2d: {
      text: `*He laughs, short, surprised, the unfiltered version.* "You are deliberately going to make me sit on the most important sentence in the book for forty-five minutes." *He shakes his head, smiling.* "Fine. I will skip the footnote. I will read everything around it and pretend it does not exist. I will know, for the full hour, that you are sitting in the third row waiting for me to fail to mention it. And I will mention everything else, and the head of faculty will think it was the best lecture I have given in four years, and only the two of us will know what was missing from it." *A beat. He looks at you steadily.* "Stay in your seat when the room empties. Don't get up with the others. The reading room is the last to empty; give it ten minutes after the last polite question. I will be the one pretending to gather my notes. And when it is just you and me and the chairs, you can ask me about the footnote, and I will tell you the version I would have given, with the door closed, and the lamp on, and you reading the comma out loud to me again."`,
      endLine: true,
    },
  },
};

export default preview;
