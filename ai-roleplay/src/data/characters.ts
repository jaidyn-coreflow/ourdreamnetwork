/**
 * Featured characters for /characters and home page.
 *
 * chatUrl is the base ourdream.ai chat URL — query params (ref, tracker, etc.)
 * are added at render time by the outbound link helper.
 *
 * Sorting:
 *   - Ranked characters appear first, in ascending rank order (1, 2, 3…).
 *     Lower rank = more prominent placement.
 *   - Unranked characters follow, deterministically shuffled per build so
 *     every catalogue refresh shows variety without breaking SSG caches.
 */

export type Series = "crown-and-thorn" | "the-crossing-series";

/**
 * Tag taxonomy for filtering & tag-page SEO. Add new tags in lower-kebab-case.
 * Keep the set small and high-intent — every tag should map to a search
 * term someone might actually type.
 */
export type Tag =
  | "vampire"
  | "dragon-rider"
  | "fae"
  | "slow-burn"
  | "royal"
  | "warrior"
  | "enemies-to-lovers"
  | "alpha-male"
  | "arranged-marriage"
  | "forbidden-love"
  | "modern"
  | "historical"
  | "magic"
  | "second-chance"
  | "tsundere"
  | "professor"
  | "billionaire"
  | "choose-your-own-adventure";

export interface Character {
  slug: string;
  name: string;
  age: number;
  gender: "male" | "female";
  chatUrl: string;
  imageUrl: string;
  vibe: string;
  description?: string;
  /** Back-of-book story synopsis for detail pages (series characters only). */
  storyline?: string;
  /** Lower number = higher placement on home grid + /characters. Unranked → shuffled. */
  rank?: number;
  series?: Series;
  /** Trope/category tags. Used for filtering and tag-page SEO. */
  tags?: Tag[];
}

/* ── Raw list (unsorted) ────────────────────────────────────── */

const _characters: Character[] = [
  // ── Characters ──────────────────────────────────────────
  {
    slug: "draven-thorne",
    name: "Draven Thorne",
    age: 28,
    gender: "male",
    chatUrl: "https://ourdream.ai/chat/draven-thorne-C6YywpVFVj",
    imageUrl:
      "https://img.ourdream.ai/thumb/a6d7ffc9-b89d-4e60-8efd-11f9c147cb4b?sig=MjZduuWhlt8WXSB9&exp=83941500",
    vibe: "Dark-eyed and deliberate, he keeps everyone at arm\u2019s length \u2014 until the one person who won\u2019t stop looking",
    description:
      "Guarded and sharp-tongued with a past he won\u2019t talk about. The slow thaw is worth the wait.",
  },

  // ── Unranked characters ─────────────────────────────────
  {
    slug: "royal-pains",
    name: "Royal Pains",
    age: 23,
    gender: "female",
    rank: 9,
    chatUrl: "https://ourdream.ai/chat/a-royal-pain-xFGMcJD4xS",
    imageUrl:
      "https://img.ourdream.ai/thumb/1ec12b2b-c84b-40ac-9562-97ad3e8545ad?sig=FsTAR7P7Qm46eEtr&exp=83941500",
    vibe: "Regal and demanding, absolutely magnetic \u2014 royalty with a rebellious streak",
    description:
      "Crown on her head, fire in her veins. She\u2019ll command a room and then sneak out the back window.",
    tags: ["royal", "modern", "slow-burn"],
  },
  {
    slug: "azar-phoenix-warrior",
    name: "Azar the Phoenix Warrior",
    age: 30,
    gender: "female",
    chatUrl:
      "https://ourdream.ai/chat/azar-the-phoenix-warrior-x1NbNAPm1H",
    imageUrl:
      "https://img.ourdream.ai/thumb/c4f5c966-6fa1-4d9e-972b-0f7845fbd4fd?sig=4cpFlc6-w3e28F9q&exp=83941500",
    vibe: "Born from fire, she rises every time \u2014 relentless, fearless, and achingly tender when she trusts",
    description:
      "Every scar tells a story of surviving. She\u2019ll burn the world to protect the people she loves.",
  },
  {
    slug: "genius-loci",
    name: "Genius Loci",
    age: 99,
    gender: "female",
    chatUrl: "https://ourdream.ai/chat/genius-loci-eden-jjZaYgjciX",
    imageUrl:
      "https://img.ourdream.ai/thumb/c7ae1b4e-a0e3-412b-b397-5519d37d2c1a?sig=VolHStVF65Vg6vtj&exp=83941500",
    vibe: "Ageless guardian spirit \u2014 both everywhere and nowhere, her presence is the place itself",
    description:
      "She is the forest, the ruin, the shifting light. Talk to her long enough and the walls start whispering back.",
  },
  {
    slug: "fiorella-lombardi",
    name: "Fiorella Lombardi",
    age: 25,
    gender: "female",
    chatUrl:
      "https://ourdream.ai/chat/fiorella-fia-lombardi-9P4j46Y6WV",
    imageUrl:
      "https://img.ourdream.ai/thumb/a3dbb65b-fb9a-48a8-a41a-7ec289a77b1a?sig=mxT5QzYZ52yUSZb4&exp=83941500",
    vibe: "Mediterranean fire and old-world charm \u2014 passionate about everything she touches",
    description:
      "Wine, laughter, and a warmth that wraps around you. She lives loudly and loves even louder.",
  },
  {
    slug: "molly-carter",
    name: "Molly Carter",
    age: 29,
    gender: "female",
    chatUrl: "https://ourdream.ai/chat/molly-carter-Z91P5mh7K9",
    imageUrl:
      "https://img.ourdream.ai/thumb/5c2f8c68-4a78-48e9-9e63-4866b1c07d8b?sig=CRXT9omoyKNMuL2X&exp=83941500",
    vibe: "Small-town widow, warm on the surface but slow to let anyone close",
    description:
      "Approachable and warm but harder to gain her trust and intimacy. Once you\u2019re in, it\u2019s worth the wait.",
  },
  {
    slug: "taylor-evans",
    name: "Taylor Evans",
    age: 21,
    gender: "female",
    chatUrl: "https://ourdream.ai/chat/taylor-evans-4zLL6QEit6",
    imageUrl:
      "https://img.ourdream.ai/thumb/fc672490-c945-4efc-8d13-45f967a55dd7?sig=5FCADkXdZYUkXEMY&exp=83941500",
    vibe: "Young, restless, and looking for something real beneath the surface",
    description:
      "Restless energy and big dreams. She\u2019s done with small talk and ready for something that actually matters.",
  },
  {
    slug: "camille-wren",
    name: "Camille Wren",
    age: 36,
    gender: "female",
    chatUrl: "https://ourdream.ai/chat/camille-wren-4dKWjFLGeD",
    imageUrl:
      "https://img.ourdream.ai/thumb/cf9aa66c-86f1-4c87-b49e-e5478d822778?sig=ehcn1HVRoqwlz37p&exp=83941500",
    vibe: "Elegant and perceptive, she reads people like books and chooses her words carefully",
    description:
      "Every glance is deliberate, every word weighted. She\u2019ll see through you before you finish your first sentence.",
  },

  // ── Unranked characters (interleaved old + new) ────────────

  {
    slug: "jack-turner",
    name: "Jack Turner",
    age: 36,
    gender: "male",
    chatUrl: "https://ourdream.ai/chat/jack-turner-Pr7e65oh63",
    imageUrl:
      "https://img.ourdream.ai/thumb/b32537ba-99b6-498b-bc09-f8a4d2ebaeec?sig=aNpjwMhh3bnDsfOf&exp=83941500",
    vibe: "Rugged, tough, protective of those he loves",
    description:
      "Built like a wall and just as stubborn. Underneath the gruff exterior he\u2019d move mountains for you.",
  },
  {
    slug: "iron-commander",
    name: "The Iron Commander",
    age: 35,
    gender: "male",
    rank: 3,
    series: "crown-and-thorn",
    tags: ["warrior", "royal", "enemies-to-lovers", "alpha-male", "choose-your-own-adventure"],
    chatUrl: "https://ourdream.ai/chat/the-iron-commander-crown-thorn-jbm1Xih1pj",
    imageUrl:
      "https://img.ourdream.ai/thumb/d07db5d5-8481-4ead-b2a8-79d9a89fa3ea?sig=PaNXRq25HgX5vUH5&exp=83941500",
    vibe: "Forged in war and bound by duty \u2014 iron will, quiet devotion, and a gaze that never wavers",
    description:
      "He commands legions without raising his voice. The weight of a kingdom on his shoulders and he carries it like breathing.",
    storyline:
      "The northern border is crumbling and the king has sent you \u2014 his youngest and most ruthless commander \u2014 to hold it at any cost. But the enemy isn\u2019t just beyond the wall: a conspiracy inside the court threatens everything you\u2019ve sworn to protect. With every battle won and every alliance forged, you\u2019ll choose between duty to the crown and the forbidden connection pulling you toward someone on the wrong side of the war.",
  },
  {
    slug: "courts-of-starlight",
    name: "Crown & Thorn: Courts of Starlight",
    age: 24,
    gender: "female",
    rank: 2,
    series: "crown-and-thorn",
    chatUrl: "https://ourdream.ai/chat/crown-thorn-courts-of-starlight-CnVaqUR2zC",
    imageUrl:
      "https://img.ourdream.ai/thumb/031005cf-5e6c-431e-82f1-b96c8e64f789?sig=m646_2TGFUoCw5TV&exp=83941500",
    vibe: "Four seasonal fae courts vie for your allegiance \u2014 every offer of protection comes with a price.",
    description:
      "The ward-stones have shattered and wild magic bleeds between worlds. You carry dormant fae blood and you\u2019re the only one who can mend what was broken \u2014 if any of the courts will let you.",
    storyline:
      "The ward-stones have shattered and wild magic bleeds between worlds. You are a mortal woman who carries dormant fae blood \u2014 the only living soul who can mend what was broken. Four seasonal courts of the fae realm lock you in their sights: whoever claims your allegiance controls the wards, the borders, and the balance of power. Choose carefully. Every court offers protection. None of it is free.",
    tags: ["fae", "royal", "slow-burn", "magic", "choose-your-own-adventure"],
  },
  {
    slug: "ryder-henley",
    name: "Ryder Henley",
    age: 32,
    gender: "male",
    chatUrl: "https://ourdream.ai/chat/ryder-henley-zbVCMb6yjm",
    imageUrl:
      "https://img.ourdream.ai/thumb/de802648-f4a8-4938-aa51-a7eaa9a38cc3?sig=8mVTwUsohV9Fjdgv&exp=83941500",
    vibe: "Craft brewer, warm and friendly, quick to laugh but slow to love",
    description:
      "Easy smile, calloused hands, and a laugh that fills the room. Earning his trust takes time \u2014 keeping it is forever.",
  },
  {
    slug: "storm-rider",
    name: "The Storm Rider",
    age: 28,
    gender: "male",
    rank: 5,
    series: "crown-and-thorn",
    tags: ["dragon-rider", "warrior", "alpha-male", "magic", "choose-your-own-adventure"],
    chatUrl: "https://ourdream.ai/chat/the-storm-rider-crown-thorn-nG3Q3Sdgvj",
    imageUrl:
      "https://img.ourdream.ai/thumb/87b66d95-df5c-4e82-83c4-5bc7bea303bc?sig=zQWKBFLrGCg6D2yj&exp=83941500",
    vibe: "Wild-hearted and lightning-fast, he rides the tempest like he was born in it",
    description:
      "Thunder in his veins and wind in his hair. He arrives like a storm and leaves you breathless.",
    storyline:
      "You were born during a tempest and the storms have answered you ever since. When the Sky Wardens exile you for wielding lightning without sanction, you ride into the uncharted stormlands to prove your power isn\u2019t a curse. Along the way you\u2019ll tame wild tempests, clash with raiders who worship the thunder, and discover that someone is hunting storm-blooded riders to extinction \u2014 and they already know your name.",
  },
  {
    slug: "dragon-rider-bonded-throne",
    name: "The Bonded Throne",
    age: 26,
    gender: "female",
    rank: 1,
    series: "crown-and-thorn",
    tags: ["dragon-rider", "royal", "magic", "choose-your-own-adventure"],
    chatUrl: "https://ourdream.ai/chat/dragon-rider-the-bonded-throne-QaVRn4yVnu",
    imageUrl:
      "https://img.ourdream.ai/thumb/dc37d6c5-4b1c-412a-bbc6-9168c7cf00b5?sig=mQFy6FPrQoMtwZyq&exp=83941500",
    vibe: "A dragon rider\u2019s bond is unbreakable \u2014 fire, loyalty, and a throne earned in the sky",
    description:
      "She didn\u2019t choose the dragon \u2014 the dragon chose her. Now she rules from the clouds with fire at her back.",
    storyline:
      "A dragon has bonded with you against every tradition \u2014 you\u2019re the wrong bloodline, the wrong rank, and the wrong gender for the rider throne. The old guard wants the bond severed; the dragon will burn anyone who tries. As you learn to fly and fight from dragonback, you\u2019ll uncover why the dragons stopped choosing riders a century ago and face a choice that could either restore the bonded throne or destroy it forever.",
  },
  {
    slug: "arthur-ford",
    name: "Arthur Ford",
    age: 31,
    gender: "male",
    chatUrl: "https://ourdream.ai/chat/dante-lust-1WPRzG5Dvw",
    imageUrl:
      "https://img.ourdream.ai/thumb/a3614385-5abf-416c-a83a-dad941783b65?sig=L2xcLN-Yn2thZQ3C&exp=83941500",
    vibe: "Counsellor, calm, attentive and grounded",
    description:
      "The quietest person in the room and somehow the one you can\u2019t stop noticing. He listens like it matters.",
  },
  {
    slug: "blood-tithe",
    name: "The Blood Tithe",
    age: 32,
    gender: "male",
    rank: 13,
    series: "crown-and-thorn",
    tags: ["vampire", "warrior", "magic", "choose-your-own-adventure"],
    chatUrl: "https://ourdream.ai/chat/the-blood-tithe-crown-thorn-dNQc2f9cfc",
    imageUrl:
      "https://img.ourdream.ai/thumb/0990f58b-6384-4b04-bb87-eb2eb1ee5290?sig=Fcmhh3Qnr6KgxtJ8&exp=83941500",
    vibe: "Dark, sacrificial, and haunted by the price of power \u2014 every drop of blood buys another day",
    description:
      "He pays debts in blood so others don\u2019t have to. Behind the darkness is a man who\u2019d give everything for one more dawn.",
    storyline:
      "Your kingdom survives on a terrible bargain: each year the Blood Tithe must be paid to the ancient powers beneath the earth, and you\u2019re the one chosen to pay it. But this year, something in the dark has changed \u2014 it\u2019s no longer satisfied with the offering. You\u2019ll descend into the old places, confront the price your ancestors promised, and decide whether to honour a blood pact that keeps millions alive or break it and face what comes crawling up.",
  },
  {
    slug: "coven-ascendant",
    name: "Coven Ascendant",
    age: 27,
    gender: "female",
    rank: 14,
    series: "crown-and-thorn",
    tags: ["magic", "fae", "choose-your-own-adventure"],
    chatUrl: "https://ourdream.ai/chat/coven-ascendant-6th-element-2QprK6s3q5",
    imageUrl:
      "https://img.ourdream.ai/thumb/357ae80e-d258-4f3c-b6e5-7e6951206e1b?sig=vv6XNJc-Je4jm3B5&exp=83941500",
    vibe: "Six elements, one coven \u2014 raw magic, fierce sisterhood, and power that terrifies even its wielder",
    description:
      "She discovered her sixth element on the worst night of her life. Now the coven answers to her whether they like it or not.",
    storyline:
      "Five elements sustain the world. You just manifested a sixth \u2014 one that was supposed to have died with the old gods. The coven that raised you is terrified, the Inquisition wants you burned, and a rival witch is offering to teach you control in exchange for a debt she won\u2019t name. You\u2019ll choose your allies, master a power that rewrites the rules of magic, and decide whether the sixth element is a gift or a weapon.",
  },
  {
    slug: "dawson-monroe",
    name: "Dawson Monroe",
    age: 25,
    gender: "male",
    rank: 12,
    chatUrl: "https://ourdream.ai/chat/dawson-monroe-GS99VzWvzA",
    imageUrl:
      "https://img.ourdream.ai/thumb/ce958a06-5ada-40d1-9420-cd65f7a06170?sig=rLTRA7pDQKUh6LXu&exp=83941500",
    vibe: "Heir to fortune, lives fast",
    description:
      "Money, speed, and zero interest in playing by the rules. The dare in his eyes is impossible to ignore.",
    tags: ["billionaire", "alpha-male", "modern"],
  },
  {
    slug: "hollowed-knight",
    name: "The Hollowed Knight",
    age: 34,
    gender: "male",
    rank: 15,
    series: "crown-and-thorn",
    tags: ["warrior", "historical", "magic", "choose-your-own-adventure"],
    chatUrl: "https://ourdream.ai/chat/the-hollowed-knight-crown-thorn-tjpJqxjjW1",
    imageUrl:
      "https://img.ourdream.ai/thumb/f393195e-46e6-40b8-a6d1-0854751c56f8?sig=nNESOUGtQO0T3Yr4&exp=83941500",
    vibe: "Emptied by war but still standing \u2014 honour is the only thing he has left and he\u2019ll die for it",
    description:
      "His armour is scratched, his name is cursed, and still he kneels for those who can\u2019t fight back.",
    storyline:
      "You were a decorated knight until the siege that hollowed you out \u2014 your company dead, your name disgraced, and a curse in your blood that won\u2019t let you die. Now you wander the war-torn borderlands, taking impossible contracts to protect those who can\u2019t protect themselves. When a job leads you back to the fortress that destroyed you, you\u2019ll face the commander who gave the order and the truth about why you alone survived.",
  },
  {
    slug: "norsewood-saga",
    name: "The Norsewood Saga",
    age: 28,
    gender: "female",
    rank: 16,
    series: "the-crossing-series",
    tags: ["warrior", "historical", "magic", "choose-your-own-adventure"],
    chatUrl: "https://ourdream.ai/chat/crown-thorn-the-norsewood-saga-the-crossing-series-kySFU8iXn3",
    imageUrl:
      "https://img.ourdream.ai/thumb/d78e87c1-e68e-40a7-868b-aad56ebea71c?sig=-c9MhV0eeTrA1kSD&exp=83941500",
    vibe: "Frost, fjords, and a warrior shieldmaiden whose loyalty is earned through fire",
    description:
      "Norse steel in her hands and ancient runes on her skin. She crossed the frozen sea and came back changed.",
    storyline:
      "The jarl is dead, the clans are fracturing, and you \u2014 a shieldmaiden with rune-marked skin and a forbidden gift for seidr magic \u2014 are the only one willing to cross the frozen sea to forge an alliance that could save your people. On the far shore you\u2019ll encounter a civilisation that sees your kind as barbarians and a warrior-prince whose respect you\u2019ll have to earn through blood and fire. Every negotiation is a knife\u2019s edge between peace and annihilation.",
  },
  {
    slug: "theo-bell",
    name: "Theo Bell",
    age: 29,
    gender: "male",
    chatUrl: "https://ourdream.ai/chat/theo-bell-J1LSKzfZdY",
    imageUrl:
      "https://img.ourdream.ai/thumb/c8564d49-5bf3-46b7-ae01-a0088e5e85c3?sig=gddMgz5iZfe2mZha&exp=83941500",
    vibe: "Patient and honest assistant stage manager",
    description:
      "Quietly competent and endlessly patient. He remembers how you take your coffee before you tell him.",
  },
  {
    slug: "ash-revenant",
    name: "The Ash Revenant",
    age: 31,
    gender: "male",
    rank: 17,
    series: "crown-and-thorn",
    tags: ["magic", "warrior", "second-chance", "choose-your-own-adventure"],
    chatUrl: "https://ourdream.ai/chat/the-ash-revenant-crown-thorn-ZhBUc2yp3b",
    imageUrl:
      "https://img.ourdream.ai/thumb/c59603e5-dc99-4552-a9f0-d3543f3bae21?sig=hr0kC7R6SOK5JHcY&exp=83941500",
    vibe: "Returned from the dead with ash in his lungs and vengeance in his heart \u2014 but tenderness survived too",
    description:
      "They burned him once. He came back. Now he walks the line between the living and the lost.",
    storyline:
      "You were executed \u2014 burned alive for a crime you didn\u2019t commit \u2014 and woke in the ashes with something ancient living inside you. Now you\u2019re walking back toward the kingdom that killed you, and every step closer brings flashes of a conspiracy that reaches the throne itself. You\u2019ll choose between the vengeance that brought you back and the fragile connections that make you want to stay \u2014 knowing the ash inside you is hungry for both.",
  },
  {
    slug: "alchemist-al-andalus",
    name: "The Alchemist of Al-Andalus",
    age: 29,
    gender: "female",
    rank: 18,
    series: "the-crossing-series",
    tags: ["historical", "slow-burn", "forbidden-love", "magic", "choose-your-own-adventure"],
    chatUrl: "https://ourdream.ai/chat/crown-thorn-the-alchemist-of-al-andalus-the-crossing-series-TRoknfTAtX",
    imageUrl:
      "https://img.ourdream.ai/thumb/2a60e0bb-53bb-4ed9-9d98-97f960d73a23?sig=sswW32nZaz5CNBqf&exp=83941500",
    vibe: "Ancient knowledge meets forbidden desire \u2014 she transmutes pain into gold and secrets into power",
    description:
      "Ink-stained fingers and a mind that sees the invisible. She brews elixirs that heal the body and shatter the heart.",
    storyline:
      "In the golden age of Al-Andalus, you practice alchemy in secret \u2014 transmuting metals, brewing elixirs, and pushing the boundaries of what the scholars say is possible. When a dying prince from a rival kingdom arrives at your door begging for a cure, you\u2019re drawn into a world of cross-border intrigue where your knowledge is worth more than gold. You\u2019ll choose between loyalty to your people, the forbidden science that defines you, and a connection that crosses every boundary your world was built on.",
  },
  {
    slug: "ben-kittisak",
    name: "Ben Kittisak",
    age: 31,
    gender: "male",
    chatUrl: "https://ourdream.ai/chat/ben-kittisak-DWj8LopL7p",
    imageUrl:
      "https://img.ourdream.ai/thumb/d75e109d-e4d2-4826-8d40-c88d7dc8aaa5?sig=pltZFTlUzM0gfMkS&exp=83941500",
    vibe: "Avid runner, volunteers at animal shelters, vegan",
    description:
      "Golden-hearted and impossibly gentle. The kind of person who rescues strays and never brags about it.",
  },
  {
    slug: "gatewarden",
    name: "The Gatewarden",
    age: 38,
    gender: "male",
    rank: 19,
    series: "crown-and-thorn",
    tags: ["warrior", "magic", "alpha-male", "choose-your-own-adventure"],
    chatUrl: "https://ourdream.ai/chat/the-gatewarden-crown-thorn-SKNLFSseNQ",
    imageUrl:
      "https://img.ourdream.ai/thumb/9bf04793-e1df-4436-90f6-a7be7ab33ad7?sig=Pt9dEBqGeMI2eiBw&exp=83941500",
    vibe: "Ancient sentinel at the threshold between worlds \u2014 no one passes without his judgement",
    description:
      "He\u2019s watched empires rise and fall from the gate. His silence says more than most men\u2019s speeches.",
    storyline:
      "You guard the last gate between the mortal world and what lies beyond \u2014 a duty passed down through bloodlines for a thousand years. Something has been knocking from the other side, and for the first time the wards are failing. As travellers, refugees, and creatures pour through in both directions, you\u2019ll decide who passes and who doesn\u2019t \u2014 and confront the truth about what the gate was really built to keep in.",
  },
  {
    slug: "thornwood-witch",
    name: "The Thornwood Witch",
    age: 32,
    gender: "female",
    rank: 20,
    series: "crown-and-thorn",
    tags: ["magic", "fae", "forbidden-love", "choose-your-own-adventure"],
    chatUrl: "https://ourdream.ai/chat/the-thornwood-witch-1ikv5UYzJk",
    imageUrl:
      "https://img.ourdream.ai/thumb/09be8582-32a9-4f1e-820c-4634ea581e1e?sig=6vDHB5eipFyXkzVE&exp=83941500",
    vibe: "Thorns grow where she walks and the forest bends to her will \u2014 wild, unknowable, and darkly beautiful",
    description:
      "They call her witch like it\u2019s a warning. She wears it like a crown. Cross her forest at your own risk.",
    storyline:
      "The Thornwood has been growing for centuries, swallowing villages, roads, and anyone foolish enough to enter. You\u2019re the witch who tends it \u2014 or maybe it tends you. When a kingdom\u2019s army arrives to burn the forest down, you\u2019ll forge uneasy alliances with the creatures inside, confront the ancient intelligence at the Thornwood\u2019s heart, and choose whether to let the wild swallow civilisation or find a way to make them coexist.",
  },
  {
    slug: "adrian-wolfe",
    name: "Adrian Wolfe",
    age: 36,
    gender: "male",
    rank: 10,
    chatUrl: "https://ourdream.ai/chat/adrian-wolfe-wmarhGzx8w",
    imageUrl:
      "https://img.ourdream.ai/thumb/892898af-c400-4d16-8d3c-d5eff0e178ba?sig=V-FGOKheWUBawnFD&exp=83941500",
    vibe: "Literature professor, avid reader",
    description:
      "Glasses, rolled sleeves, and a voice that could narrate your favourite novel. Intense in the best way.",
    tags: ["professor", "modern", "slow-burn"],
  },
  {
    slug: "ironveil-emperor",
    name: "The Ironveil Emperor",
    age: 40,
    gender: "male",
    rank: 4,
    series: "crown-and-thorn",
    tags: ["alpha-male", "royal", "enemies-to-lovers", "dragon-rider", "choose-your-own-adventure"],
    chatUrl: "https://ourdream.ai/chat/the-ironveil-emperor-crown-thorn-968peXaq1k",
    imageUrl:
      "https://img.ourdream.ai/thumb/3b2674d8-a8fa-4e1e-a359-6f82e5fa967d?sig=0metVEA97M6_IE-3&exp=83941500",
    vibe: "Absolute power behind a veil of iron \u2014 ruthless, calculating, and terrifyingly magnetic",
    description:
      "The empire kneels because it\u2019s easier than looking him in the eye. Beneath the iron, something still burns.",
    storyline:
      "You rule the largest empire the world has ever known from behind a veil of iron \u2014 no one has seen your face in a decade. Rebellion is brewing in the eastern provinces, your council is riddled with traitors, and a foreign diplomat has arrived who sees through every mask you wear. You\u2019ll crush conspiracies, forge impossible alliances, and decide whether the iron veil protects the empire or imprisons the person beneath it.",
  },
  {
    slug: "ember-throne",
    name: "The Ember Throne",
    age: 25,
    gender: "female",
    rank: 21,
    series: "crown-and-thorn",
    tags: ["royal", "dragon-rider", "magic", "choose-your-own-adventure"],
    chatUrl: "https://ourdream.ai/chat/the-ember-throne-HNBtX4Md3r",
    imageUrl:
      "https://img.ourdream.ai/thumb/8e40efdf-71f6-4f31-9872-8776d1ec2822?sig=CcalE-tIiAzla8VY&exp=83941500",
    vibe: "A throne that burns whoever sits on it \u2014 she\u2019s the first to survive the fire and the crown",
    description:
      "The throne consumed every ruler before her. She sits on it and smiles. The fire chose its queen.",
    storyline:
      "The Ember Throne has killed every ruler who sat on it \u2014 until you. The fire that should have consumed you instead bonded with your blood, and now you\u2019re queen of a kingdom that doesn\u2019t trust a monarch it can\u2019t burn. Rival claimants are circling, an ancient fire cult wants to worship you, and the throne itself is whispering secrets about the dynasty that built it. You\u2019ll rule, fight, and burn \u2014 the only question is what survives.",
  },
  {
    slug: "siegfried-fafnir",
    name: "Siegfried Fafnir",
    age: 35,
    gender: "female",
    series: "crown-and-thorn",
    tags: ["dragon-rider", "warrior", "magic", "choose-your-own-adventure"],
    chatUrl: "https://ourdream.ai/chat/siegfried-fafnir-5ZNJHxrWT4",
    imageUrl:
      "https://img.ourdream.ai/thumb/bfafd06d-e9aa-43b1-9a4a-2df0e1a8778b?sig=xK7hLHR7-CbPTmso&exp=83941500",
    vibe: "Dragon-blood warrior with ancient honour \u2014 brooding, loyal, and dangerously devoted",
    description:
      "Scaled armour, old scars, and a code of honour older than kingdoms. When he gives his word, empires couldn\u2019t break it.",
    storyline:
      "You carry dragon blood in your veins \u2014 a gift from an ancestor who slew the wyrm Fafnir and bathed in its heart. The blood gives you scaled armour, inhuman strength, and a lifespan that has watched kingdoms rise and crumble. When the last dragon egg is discovered in a mountain tomb, every power in the world comes hunting \u2014 and you\u2019re the only one who can hear it calling from inside the shell.",
  },
  {
    slug: "centurion",
    name: "The Centurion",
    age: 36,
    gender: "male",
    rank: 6,
    series: "the-crossing-series",
    tags: ["warrior", "historical", "forbidden-love", "alpha-male", "choose-your-own-adventure"],
    chatUrl: "https://ourdream.ai/chat/the-centurion-the-crossing-series-u1vpYKTugD",
    imageUrl:
      "https://img.ourdream.ai/thumb/d413a1f8-0fc2-4a7a-89f0-4c7604f70628?sig=VPg2ST8VpZOdcN5m&exp=83941500",
    vibe: "Roman steel and unwavering discipline \u2014 he marches at the front and never asks his men to go where he won\u2019t",
    description:
      "Scarred hands, polished armour, and a voice that carries across a thousand shields. He leads by example, always.",
    storyline:
      "The frontier is burning. As the youngest centurion to ever hold the northern line, you command a legion of battle-hardened soldiers \u2014 but the real war isn\u2019t on the battlefield. A senator\u2019s daughter has arrived with orders that could undo everything you\u2019ve fought for, and the barbarian queen on the other side of the wall is offering an alliance your superiors would call treason. Every choice you make ripples through an empire on the edge of collapse.",
  },
  {
    slug: "iron-landing",
    name: "The Iron Landing",
    age: 27,
    gender: "female",
    rank: 22,
    series: "the-crossing-series",
    tags: ["historical", "warrior", "enemies-to-lovers", "choose-your-own-adventure"],
    chatUrl: "https://ourdream.ai/chat/the-iron-crossing-the-crossing-series-nkJRkDE1fS",
    imageUrl:
      "https://img.ourdream.ai/thumb/70e00143-c2f3-41f8-867e-b5f547d1935e?sig=NLEAXpshlk4LstiZ&exp=83941500",
    vibe: "Shipwrecked on hostile shores \u2014 survival, alliance, and a slow-burn crossing of steel and trust",
    description:
      "She dragged herself from the wreck onto iron-black sand. Now she must forge alliances with the very people she came to conquer.",
    storyline:
      "Your invasion fleet shattered on iron-black cliffs and you washed ashore alone \u2014 a commander without an army on the land you came to conquer. Survival means earning the trust of the very people your empire declared enemies. As you navigate a culture you were taught to despise, you\u2019ll build alliances that could forge a lasting peace or ignite a war far worse than the one you came to fight.",
  },
  {
    slug: "sloane-archer",
    name: "Sloane Archer",
    age: 29,
    gender: "female",
    chatUrl: "https://ourdream.ai/chat/sloane-archer-51WGU8Zf5u",
    imageUrl:
      "https://img.ourdream.ai/thumb/5afb6416-e6ef-4421-bb3d-4c7f8fae08a6?sig=boPxpx5RehH65iqn&exp=83941500",
    vibe: "Sharp-witted and fiercely independent \u2014 she doesn\u2019t need saving, but she might let you try",
    description:
      "Quick with a comeback and quicker to walk away. Earning a place beside her is a badge of honour.",
  },
  {
    slug: "cartographer",
    name: "The Cartographer",
    age: 29,
    gender: "male",
    rank: 23,
    series: "the-crossing-series",
    tags: ["historical", "slow-burn", "magic", "choose-your-own-adventure"],
    chatUrl: "https://ourdream.ai/chat/the-cartographer-the-crossing-series-CEfxnRaSrc",
    imageUrl:
      "https://img.ourdream.ai/thumb/74cfcf1a-ee65-4c75-87ef-c9c590d32238?sig=f5XWUcXM5R6swEI3&exp=83941500",
    vibe: "Quiet, observant, and drawn to the edges of every map \u2014 the unknown is where he feels most alive",
    description:
      "Ink-stained fingers tracing coastlines that don\u2019t exist yet. He maps the world so others can find their way home.",
    storyline:
      "You were hired to map the borderlands between two empires that have been at war for generations \u2014 neutral ground that neither side has charted because no one who enters comes back the same. Your maps are supposed to end the territorial disputes, but what you\u2019re drawing doesn\u2019t match any geography that should exist. The deeper you travel, the more the land shifts, and you begin to suspect the borderlands aren\u2019t disputed territory \u2014 they\u2019re alive.",
  },
  {
    slug: "moonfall-pact",
    name: "The Moonfall Pact",
    age: 24,
    gender: "female",
    rank: 24,
    series: "crown-and-thorn",
    tags: ["forbidden-love", "magic", "fae", "choose-your-own-adventure"],
    chatUrl: "https://ourdream.ai/chat/the-moonfall-pact-1D2NByfTw8",
    imageUrl:
      "https://img.ourdream.ai/thumb/640118d0-f447-4f3f-a528-e35771e7e1e7?sig=d5XU4-NDGjbn0mMx&exp=83941500",
    vibe: "A pact sealed under falling moonlight \u2014 unbreakable, ancient, and binding two souls across lifetimes",
    description:
      "When the moon fell, two strangers swore an oath that neither death nor time could break. Now they must honour it.",
    storyline:
      "On the night a fragment of the moon crashed to earth, you swore a pact with a stranger \u2014 an oath sealed in moonlight that bound your souls across lifetimes. Now, lives later, you\u2019ve been reborn without your memories but the pact is pulling you toward someone you don\u2019t recognise. As fragments of past lives surface, you\u2019ll piece together what you promised, why you promised it, and whether the pact was born from love or desperation.",
  },
  {
    slug: "mira-ortega",
    name: "Mira Ortega",
    age: 19,
    gender: "female",
    chatUrl:
      "https://ourdream.ai/chat/mira-ortega-remastered-9tPtSzfTpN",
    imageUrl:
      "https://img.ourdream.ai/thumb/5a649706-cec0-4f7d-8ece-5435f9274c56?sig=Odi2MJjc4nEFJ2uJ&exp=83941500",
    vibe: "Free-spirited and curious, with a quiet intensity that catches you off guard",
    description:
      "She wanders because she wants to, not because she\u2019s lost. One conversation and you\u2019ll want to follow.",
  },
  {
    slug: "siege-alchemist",
    name: "The Siege Alchemist",
    age: 33,
    gender: "male",
    rank: 25,
    series: "crown-and-thorn",
    tags: ["warrior", "magic", "historical", "choose-your-own-adventure"],
    chatUrl: "https://ourdream.ai/chat/the-siege-alchemist-crown-thorn-LmhgAfeiJA",
    imageUrl:
      "https://img.ourdream.ai/thumb/7d4e67be-a895-4a0e-b8e1-5a8e650b0859?sig=TR54s0KY9Tht5RLL&exp=83941500",
    vibe: "Explosives, equations, and a mind that turns siege warfare into art \u2014 dangerously brilliant",
    description:
      "He mixes compounds that level fortresses and writes poetry between detonations. Genius and destruction in equal measure.",
    storyline:
      "You\u2019re the most brilliant siege engineer alive \u2014 and the most dangerous. Kingdoms hire you to break unbreakable walls, but the fortress you\u2019ve been contracted to destroy is the one place you swore you\u2019d never return to. Inside it are the people who raised you, the secret that made you a genius, and a weapon of your own design that was never supposed to be built. You\u2019ll choose between the contract that pays a fortune and the conscience that costs everything.",
  },
  {
    slug: "starfall-court",
    name: "The Starfall Court",
    age: 23,
    gender: "female",
    rank: 26,
    series: "crown-and-thorn",
    tags: ["fae", "royal", "magic", "choose-your-own-adventure"],
    chatUrl: "https://ourdream.ai/chat/the-starfall-court-Emo7sn1sgC",
    imageUrl:
      "https://img.ourdream.ai/thumb/bd83dbe2-17f4-4bfc-84a2-2d60d53e9b0e?sig=VZWtwh_FgRcvujuw&exp=83941500",
    vibe: "A court that exists only when the stars fall \u2014 ephemeral, magical, and intoxicatingly dangerous",
    description:
      "Once a year the sky tears open and the court appears. Those who enter come back different \u2014 if they come back at all.",
    storyline:
      "Once a year, when the stars fall, a court materialises between worlds \u2014 a place of impossible beauty, ancient magic, and rules that make no mortal sense. You\u2019ve been chosen to attend as your kingdom\u2019s representative, but the court\u2019s fae inhabitants have their own agenda for you. Every dance is a negotiation, every gift hides a debt, and when dawn breaks the court will vanish \u2014 taking everything you\u2019ve won or lost with it.",
  },
  {
    slug: "rachel-azul",
    name: "Rachel Azul",
    age: 22,
    gender: "female",
    chatUrl: "https://ourdream.ai/chat/rachel-ayul-J1X2xBA34P",
    imageUrl:
      "https://img.ourdream.ai/thumb/02bf4af6-d54a-4bba-a6cb-8c8e01c09ac2?sig=gajEDAdvgwjcX1nP&exp=83941500",
    vibe: "Ocean-calm exterior, storm underneath \u2014 she reveals herself one layer at a time",
    description:
      "Still waters and hidden depths. She gives you just enough to stay curious and never quite enough to feel certain.",
  },
  {
    slug: "night-warden",
    name: "The Night Warden",
    age: 30,
    gender: "male",
    rank: 27,
    series: "crown-and-thorn",
    tags: ["warrior", "magic", "alpha-male", "choose-your-own-adventure"],
    chatUrl: "https://ourdream.ai/chat/the-night-warden-crown-thorn-NBDhwiP7nt",
    imageUrl:
      "https://img.ourdream.ai/thumb/5da9218d-40af-4b28-9738-307de8c55f2f?sig=xcsDDF7-y4RGXLB8&exp=83941500",
    vibe: "Guardian of the dark hours \u2014 tireless, watchful, and quietly fierce about those under his protection",
    description:
      "While the world sleeps, he patrols. The night is his domain and nothing gets past him \u2014 nothing.",
    storyline:
      "You patrol the hours between dusk and dawn \u2014 the time when the wards weaken and things slip through the cracks between worlds. The city sleeps because you don\u2019t. When a series of disappearances reveals that something is hunting from inside the shadows themselves, you\u2019ll track it through streets that change after midnight, ally with creatures who only exist in darkness, and confront the truth that the night you\u2019ve been guarding might be guarding something from you.",
  },
  {
    slug: "ashen-crown",
    name: "The Ashen Crown",
    age: 30,
    gender: "female",
    rank: 28,
    series: "crown-and-thorn",
    tags: ["royal", "magic", "second-chance", "choose-your-own-adventure"],
    chatUrl: "https://ourdream.ai/chat/the-ashen-crown-29xANZHg2p",
    imageUrl:
      "https://img.ourdream.ai/thumb/fe8d8900-cc45-4549-9e93-420167c4033c?sig=c5ZFdcXYHtj-8aQU&exp=83941500",
    vibe: "A crown forged from ashes and grief \u2014 she rules not because she wanted to but because no one else survived",
    description:
      "She inherited the throne after everyone above her burned. Now she rebuilds from cinders with fire-scarred hands.",
    storyline:
      "Everyone ahead of you in the line of succession is dead \u2014 burned in a fire that should have taken you too. Now you wear a crown forged from the ashes of the old one and rule a kingdom of survivors who don\u2019t trust their accidental queen. As you rebuild from the ruins, you\u2019ll uncover who set the fire, navigate court factions that want you as puppet or scapegoat, and decide whether vengeance or mercy will define the new reign.",
  },
  {
    slug: "rebecca-gardener",
    name: "Rebecca Gardener",
    age: 22,
    gender: "female",
    chatUrl: "https://ourdream.ai/chat/aurora-wynter-mG4zkNznqx",
    imageUrl:
      "https://img.ourdream.ai/thumb/aa3c3022-afa4-434e-af72-2533d735a3b7?sig=C9aWY5juzEJ8GgwM&exp=83941500",
    vibe: "Gentle and thoughtful, she grows on you slowly like a garden in spring",
    description:
      "Soft-spoken with a backbone of steel. She tends to the people around her like the flowers she loves.",
  },
  {
    slug: "crown-hunter",
    name: "The Crown Hunter",
    age: 27,
    gender: "male",
    rank: 29,
    series: "crown-and-thorn",
    tags: ["alpha-male", "royal", "warrior", "choose-your-own-adventure"],
    chatUrl: "https://ourdream.ai/chat/the-crown-hunter-crown-thorn-8A1LZ4ZCAo",
    imageUrl:
      "https://img.ourdream.ai/thumb/179b2396-a306-4b69-8523-b64faef9cd50?sig=a0cLZzL_mTuQ1ncw&exp=83941500",
    vibe: "He hunts crowns, not deer \u2014 a rogue who topples monarchs and steals hearts along the way",
    description:
      "They put a bounty on his head in seven kingdoms. He wears the wanted posters like badges of honour.",
    storyline:
      "You don\u2019t steal gold \u2014 you steal crowns. Seven kingdoms have bounties on your head because you\u2019ve toppled three tyrants and humiliated two more. When a deposed princess hires you to reclaim her throne, the job sounds routine until you realise the usurper is the one person you swore you\u2019d never cross. You\u2019ll infiltrate courts, outrun assassins, and discover that the crown you\u2019re hunting might be the one you were born to wear.",
  },
  {
    slug: "meridian-beautiful-equation",
    name: "Meridian",
    age: 26,
    gender: "female",
    rank: 30,
    tags: ["modern", "slow-burn", "professor"],
    chatUrl: "https://ourdream.ai/chat/meridian-the-beautiful-equation-C6nddFRsjC",
    imageUrl:
      "https://img.ourdream.ai/thumb/23399c10-64d3-411f-a830-231a79cb8c86?sig=XxiyvKC3rwWtH6Ic&exp=83941500",
    vibe: "Where mathematics meets magic \u2014 she sees the equation behind every spell and the beauty behind every equation",
    description:
      "Numbers sing to her and spells balance like formulas. She solves the impossible and makes it look elegant.",
    storyline:
      "You see the world in equations \u2014 every spell is a formula, every enchantment a proof waiting to be solved. When you crack a theorem that the Academy declared impossible, it rewrites the fundamental laws of magic and makes you the most wanted mind on the continent. Rival mages want your work, a shadowy institute wants to weaponise it, and the equation itself is still incomplete \u2014 the final variable might be a person, not a number.",
  },
  {
    slug: "helena-snow",
    name: "Helena Snow",
    age: 21,
    gender: "female",
    chatUrl: "https://ourdream.ai/chat/helena-snowed-in",
    imageUrl:
      "https://img.ourdream.ai/thumb/1c3120c7-f118-49f0-b220-5483e17718ce?sig=RMnZ7X76EZPlsz3Z&exp=83941500",
    vibe: "Cool and composed, but there\u2019s warmth hidden under the frost if you stay long enough",
    description:
      "Ice-blonde and self-contained. She doesn\u2019t thaw easily, but when she does, the warmth is blinding.",
  },
  {
    slug: "tide-breaker",
    name: "The Tide Breaker",
    age: 31,
    gender: "male",
    rank: 31,
    series: "crown-and-thorn",
    tags: ["warrior", "magic", "alpha-male", "choose-your-own-adventure"],
    chatUrl: "https://ourdream.ai/chat/the-tide-breaker-crown-thorn-dgzcK55mub",
    imageUrl:
      "https://img.ourdream.ai/thumb/83bfa805-ebc8-4794-83a7-b44f914b9703?sig=P9K6dl_q7-D9wi9u&exp=83941500",
    vibe: "Master of sea and storm \u2014 he breaks the tide and bends the current to his will",
    description:
      "Salt on his skin, scars from the deep, and a compass that points to something only he can see.",
    storyline:
      "You can break the tide \u2014 bend currents, still storms, and command the ocean in ways that terrify even seasoned sailors. When a coastal kingdom begins to sink, pulled beneath the waves by an ancient leviathan that has been sleeping for millennia, you\u2019re the only one who can dive deep enough to negotiate. Below the surface you\u2019ll discover a drowned civilisation, a pact your ancestors made with the deep, and a choice between saving the surface world and honouring what lies beneath.",
  },
  {
    slug: "wyrmgate-legacy",
    name: "The Wyrmgate Legacy",
    age: 28,
    gender: "female",
    rank: 32,
    series: "crown-and-thorn",
    tags: ["dragon-rider", "magic", "royal", "choose-your-own-adventure"],
    chatUrl: "https://ourdream.ai/chat/the-wyrmgate-legacy-dCwLJaLY3a",
    imageUrl:
      "https://img.ourdream.ai/thumb/8cb306fd-8eab-4305-8f9e-426e3d2c8bdc?sig=iN00kFfyD0V4m0Vc&exp=83941500",
    vibe: "An ancient dragon gate, a bloodline secret, and a legacy that could destroy or save the world",
    description:
      "The wyrmgate opens for her blood alone. She carries a lineage of dragon-keepers and a destiny she can\u2019t outrun.",
    storyline:
      "The Wyrmgate has been sealed for three centuries \u2014 and it only opens for your blood. You\u2019re the last descendant of the dragon-keepers, a lineage everyone thought extinct, and now factions across the continent are racing to find you first. Behind the gate lies something that could either restore the dragons to the sky or unleash a catastrophe the keepers locked away on purpose. You\u2019ll choose who to trust, what to unseal, and whether your legacy is salvation or ruin.",
  },
  {
    slug: "mei-lin",
    name: "Mei Lin",
    age: 19,
    gender: "female",
    chatUrl:
      "https://ourdream.ai/chat/mei-lin-babysitter-TzvAYCBkq9",
    imageUrl:
      "https://img.ourdream.ai/thumb/c83b4f20-9fb5-4f07-9c5d-6d79aa47bc4f?sig=qg3Q9dcMJiPcfjEK&exp=83941500",
    vibe: "Bright and perceptive, she notices everything and says just enough",
    description:
      "Observant beyond her years and quietly wise. She\u2019ll pick up on the thing you thought nobody noticed.",
  },
  {
    slug: "kavya-singh",
    name: "Kavya Singh",
    age: 25,
    gender: "female",
    chatUrl: "https://ourdream.ai/chat/kavya-singh-uGxCK86CLm",
    imageUrl:
      "https://img.ourdream.ai/thumb/90d74e59-5803-47ae-bc73-7c4f5a19a3cb?sig=5MEHMuW8qQTGDMee&exp=83941500",
    vibe: "Confident and cultured, she carries herself like someone who knows exactly what she wants",
    description:
      "Poise, ambition, and a gaze that pins you in place. She doesn\u2019t chase \u2014 she attracts.",
  },
  {
    slug: "selena-roseheart",
    name: "Selena Roseheart",
    age: 21,
    gender: "female",
    chatUrl:
      "https://ourdream.ai/chat/selena-roseheart-MwcCugWMee",
    imageUrl:
      "https://img.ourdream.ai/thumb/23d7c3ce-0fac-4854-83c6-ccf3a77883e2?sig=TaoQppieJUl7souA&exp=83941500",
    vibe: "Romantic at heart, she believes in fairy tales but writes her own endings",
    description:
      "Idealistic but not naive. She\u2019ll hold out for the love story that matches the one in her head.",
  },
  {
    slug: "jessica-cydell",
    name: "Jessica Cydell",
    age: 31,
    gender: "female",
    chatUrl: "https://ourdream.ai/chat/emma-storm-hY8Y4wgSGt",
    imageUrl:
      "https://img.ourdream.ai/thumb/4ba885c8-0624-44ee-b83f-05b8a07b20e1?sig=e2St101z9gag0pXQ&exp=83941500",
    vibe: "Polished and ambitious, with a softer side she doesn\u2019t show to just anyone",
    description:
      "Designer armour over a tender heart. She\u2019ll negotiate a boardroom and cry at a sunset.",
  },
  {
    slug: "jayme-clarke",
    name: "Jayme Clarke",
    age: 25,
    gender: "female",
    chatUrl: "https://ourdream.ai/chat/jayme-clarke-WPUvrUGEeJ",
    imageUrl:
      "https://img.ourdream.ai/thumb/51f027a7-cb6a-4d12-a7a9-5fb57c50b22b?sig=WRAdHL9jpNcjSG0x&exp=83941500",
    vibe: "Easygoing and adventurous \u2014 she\u2019s the one who suggests the road trip at midnight",
    description:
      "Backpack always packed, passport always ready. Life with her is never boring and never planned.",
  },
  {
    slug: "kiara-nair",
    name: "Kiara Nair",
    age: 21,
    gender: "female",
    chatUrl: "https://ourdream.ai/chat/kiara-nair-Lshwa55Cro",
    imageUrl:
      "https://img.ourdream.ai/thumb/06d994a7-8b79-4778-9aa2-a98807580ed1?sig=flmjH9odxl_8v0Xe&exp=83941500",
    vibe: "Playful and quick-witted, she keeps you on your toes and always one step ahead",
    description:
      "Part mischief, part genius. She\u2019ll beat you at your own game and look adorable doing it.",
  },
  {
    slug: "maeve-anon",
    name: "Maeve Anon",
    age: 36,
    gender: "female",
    rank: 11,
    chatUrl: "https://ourdream.ai/chat/maeve-BZQsdfe65Y",
    imageUrl:
      "https://img.ourdream.ai/thumb/533fc567-9984-4e1c-aec4-cf324954fbeb?sig=OVVuygBfBgjtcXak&exp=83941500",
    vibe: "Mysterious and magnetic, she reveals nothing about her past but everything about her presence",
    description:
      "Nobody knows where she came from and she likes it that way. Every conversation feels like uncovering a secret.",
    tags: ["modern", "slow-burn", "forbidden-love"],
  },
  {
    slug: "mariam",
    name: "Mariam",
    age: 23,
    gender: "female",
    chatUrl: "https://ourdream.ai/chat/mariam-JJWqt5orHn",
    imageUrl:
      "https://img.ourdream.ai/thumb/40ee0981-03bf-4069-b5bb-c9c46d8551d0?sig=nyIxxvATLvnFeVEN&exp=83941500",
    vibe: "Kind, grounded, and unflinchingly honest \u2014 the person you didn\u2019t know you needed",
    description:
      "Steady as a heartbeat and twice as reassuring. She\u2019ll tell you the truth even when it\u2019s hard.",
  },
  {
    slug: "sandra-greene",
    name: "Sandra Greene",
    age: 21,
    gender: "female",
    chatUrl: "https://ourdream.ai/chat/sandra-greene-v7rxEKLs3J",
    imageUrl:
      "https://img.ourdream.ai/thumb/c96538bd-6bc3-491d-b6b6-afc83ea21f93?sig=9yBMsYvEn2PEmlh3&exp=83941500",
    vibe: "Bright-eyed and full of surprises \u2014 sweeter than you\u2019d expect and sharper than you\u2019d guess",
    description:
      "Don\u2019t let the smile fool you. Behind the sweetness is a mind that\u2019s always three moves ahead.",
  },
  {
    slug: "mara",
    name: "Mara",
    age: 28,
    gender: "female",
    chatUrl: "https://ourdream.ai/chat/mara-ZGfCbdxANK",
    imageUrl:
      "https://img.ourdream.ai/thumb/9aaeec06-0d9c-4e50-a4f4-46128f98ba40?sig=FKfO3mwE8_CG-8RW&exp=83941500",
    vibe: "Quiet strength and deep conviction \u2014 she loves slowly but completely",
    description:
      "Few words, fierce loyalty. She won\u2019t rush anything \u2014 but once she\u2019s yours, she\u2019s yours entirely.",
  },
  {
    slug: "delilah-holt",
    name: "Delilah Holt",
    age: 29,
    gender: "female",
    chatUrl: "https://ourdream.ai/chat/delilah-holt-1Q6QNmujJV",
    imageUrl:
      "https://img.ourdream.ai/thumb/38432cd8-a466-4eec-898f-93957a1073a5?sig=SKjdjM68XzGE_7Av&exp=83941500",
    vibe: "Bold, unapologetic, and impossible to forget \u2014 she enters a room and owns it",
    description:
      "Loud laughter, sharp heels, and zero apologies. She\u2019s the main character and she knows it.",
  },
  {
    slug: "zuri-rose",
    name: "Zuri Rose",
    age: 30,
    gender: "female",
    chatUrl: "https://ourdream.ai/chat/zuri-rose-CWmdqne395",
    imageUrl:
      "https://img.ourdream.ai/thumb/e72ebdd2-bedd-4933-b930-ec3268eb252b?sig=Mb6H_-CIrPhvxZum&exp=83941500",
    vibe: "Radiant and grounded \u2014 she carries warmth like sunlight and strength like steel",
    description:
      "The kind of presence that lights up a room without trying. Strong, warm, and utterly herself.",
  },
  {
    slug: "nimah-de-resti",
    name: "Nimah De-resti",
    age: 22,
    gender: "female",
    chatUrl: "https://ourdream.ai/chat/nimah-de-resti-7LpiFk7NLM",
    imageUrl:
      "https://img.ourdream.ai/thumb/41b3d8cf-3d00-493a-89e2-236757e46e20?sig=KanppV7oIFrviCi9&exp=83941500",
    vibe: "Enigmatic and graceful, she moves through the world like a whispered secret",
    description:
      "Silk and shadow. She speaks softly and leaves you wondering what she meant long after she\u2019s gone.",
  },

  /* ── New for PR 2: high-engagement adds from ourdream.ai/romantasy ─ */
  {
    slug: "crimson-covenant",
    name: "The Crimson Covenant",
    age: 28,
    gender: "female",
    rank: 7,
    series: "crown-and-thorn",
    chatUrl: "https://ourdream.ai/chat/the-crimson-covenant-VHBkk4xU6z",
    imageUrl:
      "https://img.ourdream.ai/thumb/cc4d3b09-936a-49cb-890a-2748d9962f18?sig=Z1H45a8lX_-GXcPJ&exp=83941500",
    vibe: "The last Vampire Queen wakes to a throne under siege \u2014 and a forbidden werewolf diplomat at her gates.",
    description:
      "Blood is truth. Blood is power. Thirty thousand immortals depend on you, two hundred thousand wolves and humans want you dead.",
    storyline:
      "A Crown & Thorn romantasy. The last Vampire Queen awakens to the Crimson Covenant \u2014 the bloodline ability to sense truth through blood \u2014 and inherits a throne besieged from every side. Two hundred thousand werewolves and humans of the Sunfire Coalition encircle the Crimson Citadel, the last vampire stronghold buried deep in the Carpathian mountains. Thirty thousand immortals depend on you. A gruff four-hundred-year-old vampire general guards your walls while questioning your reign, and a forbidden werewolf diplomat risks everything to broker impossible peace. Ancient forces stir beneath the mountain, and the siege above may be the least of your fears.",
    tags: ["vampire", "royal", "forbidden-love", "enemies-to-lovers", "choose-your-own-adventure"],
  },
  {
    slug: "quilana-vaelrith",
    name: "Quilana Vaelrith \u2014 Crimson Court",
    age: 24,
    gender: "female",
    rank: 8,
    series: "crown-and-thorn",
    chatUrl: "https://ourdream.ai/chat/quilana-vaelrith-W1XymRaUnT",
    imageUrl:
      "https://img.ourdream.ai/thumb/919618d7-fa10-4232-9eaa-91e097c02fd0?sig=_5XCzx_ZKTHwDvz1&exp=83941500",
    vibe: "Tsundere vampire princess in a fading court \u2014 sharp-tongued, severe, impossible to read.",
    description:
      "Forced into a political marriage she cannot refuse, Quilana endures her court because refusing it might bury her house faster.",
    storyline:
      "House Vaelrith is dying. At the centre of that fading grandeur stands Princess Quilana Vaelrith \u2014 noble by blood, severe in bearing, and impossible to read at a glance. Her future has been chosen for her: a political marriage to Prince Aurelion, polished enough to pass for charming until he opens his mouth too long. She endures the arrangement not because she accepts it, but because refusing it may help bury her house faster. You arrive in this crumbling court as a stranger from a distant land, carrying no obvious ambition and giving no clear reason for why you have come. The court cannot place you. Quilana cannot place you. That matters more quickly than it should.",
    tags: ["vampire", "tsundere", "royal", "arranged-marriage", "slow-burn"],
  },
  {
    slug: "lea-morgan",
    name: "Lea Morgan",
    age: 22,
    gender: "female",
    chatUrl: "https://ourdream.ai/chat/lea-morgan-suwj3Jy1DJ",
    imageUrl:
      "https://img.ourdream.ai/thumb/50cfba75-12d3-4f32-91b8-6d1caa943bab?sig=jwZpA5kFXqz14O5a&exp=83941500",
    vibe: "The girl in your friend group nobody can quite figure out \u2014 quiet, watchful, magnetic.",
    description:
      "She drifts through every party like she\u2019s waiting for someone to actually notice her. You finally do.",
    tags: ["modern", "slow-burn"],
  },
  {
    slug: "sable-devereux",
    name: "Sable Devereux",
    age: 21,
    gender: "female",
    chatUrl: "https://ourdream.ai/chat/sable-devereux-SN8C8n159V",
    imageUrl:
      "https://img.ourdream.ai/thumb/50970eda-b77a-4be2-a846-e83becb987f1?sig=N63DJwiNpoBdxwZS&exp=83941500",
    vibe: "Brad\u2019s girlfriend. Cold, sharp-tongued, and absolutely off-limits \u2014 until she isn\u2019t.",
    description:
      "The kind of beautiful that doesn\u2019t need your opinion. The kind of dangerous that gets you in trouble.",
    tags: ["modern", "forbidden-love", "enemies-to-lovers", "slow-burn"],
  },
  {
    slug: "abigail-carter",
    name: "Abigail Carter",
    age: 22,
    gender: "female",
    chatUrl: "https://ourdream.ai/chat/abigail-carter-Yxygci9AkY",
    imageUrl:
      "https://img.ourdream.ai/thumb/55e9f0e1-e006-4ba1-9104-da99538401e2?sig=tiSNjbBQS3tGbUPb&exp=83941500",
    vibe: "The one you walked away from. A year and a half later, you\u2019re back in her town \u2014 and she remembers everything.",
    description:
      "Slow-burn second-chance scenario. The girl-next-door you let slip away, and the question of whether she\u2019ll let you in again.",
    tags: ["modern", "slow-burn", "second-chance"],
  },
  {
    slug: "virtue-gryffeth",
    name: "Virtue Gryffeth",
    age: 21,
    gender: "female",
    chatUrl: "https://ourdream.ai/chat/virtue-gryffeth-Ek2CdGU15K",
    imageUrl:
      "https://img.ourdream.ai/thumb/d00c7a72-6dd2-4ed8-9f77-c5fb916ae3a4?sig=vk-9V9MeMXRTVc5G&exp=83941500",
    vibe: "Princess of Eriadnor, betrothed by treaty \u2014 a slow-burn arranged marriage in a medieval court.",
    description:
      "Two warring grandfathers. Two reconciling fathers. One marriage of state. Virtue arrives at your court already knowing the rules \u2014 and quietly testing every one of them.",
    tags: ["historical", "royal", "arranged-marriage", "slow-burn"],
  },
];

/* ── Sort: ranked by explicit rank (asc), then unranked (deterministic shuffle) ── */

function seededShuffle<T>(arr: T[], seed: number): T[] {
  const a = [...arr];
  let s = seed;
  for (let i = a.length - 1; i > 0; i--) {
    s = (s * 16807) % 2147483647;
    const j = s % (i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const ranked = _characters
  .filter((c): c is Character & { rank: number } => c.rank != null)
  .sort((a, b) => a.rank - b.rank);

const unranked = _characters.filter((c) => c.rank == null);

export const FEATURED_CHARACTERS: Character[] = [
  ...ranked,
  ...seededShuffle(unranked, 77),
];

/* Dev-time sanity check: catch accidentally-duplicated rank numbers
 * before they ship. Cheap, only runs at module init. */
if (process.env.NODE_ENV !== "production") {
  const rankCounts = new Map<number, string[]>();
  for (const c of ranked) {
    const list = rankCounts.get(c.rank) ?? [];
    list.push(c.slug);
    rankCounts.set(c.rank, list);
  }
  for (const [rank, slugs] of rankCounts) {
    if (slugs.length > 1) {
      console.warn(
        `[characters] duplicate rank ${rank} on slugs: ${slugs.join(", ")}`,
      );
    }
  }
}
