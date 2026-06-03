import type { Metadata } from "next";
import Link from "next/link";
import { CharacterCardCompact } from "@/components/CharacterCardCompact";
import { Disclaimer } from "@/components/Disclaimer";
import { FaqBlock } from "@/components/FaqBlock";
import { FEATURED_CHARACTERS } from "@/data/characters";

/**
 * Home page narrative is built around the three customer pathways:
 *
 *   STORIES  \u2014 play someone else's world (chat-led, dominant ah-ha)
 *   BUILD    \u2014 author your own characters and worlds
 *   STUDIO   \u2014 create matching imagery and 60-second video
 *
 * The hero leads with the dominant ah-ha (chat-led) because ~44% of
 * customers arrive for that single job. The three pathway cards
 * immediately below make the other two pathways visible to anyone
 * whose intent is different.
 */

const FAQ = [
  {
    q: "What can I actually do on RomantasyAI?",
    a: "Three things, depending on what you're here for. Play original choose-your-own-adventure romantasy stories on the catalogue. Author your own characters and immersive worlds with our 3-step wizard or our long-form Character Builder Academy. Generate cinematic imagery and 60-second video clips for your scenes via Prompt Studio.",
  },
  {
    q: "Is RomantasyAI free to use?",
    a: "Browsing characters, story previews, prompt-building tools, and the academy on RomantasyAI is completely free. The full chat experience and image generation run on a partner platform that has its own pricing.",
  },
  {
    q: "Can I write fan-fiction expansions of my favourite stories?",
    a: "Yes \u2014 with two craft notes. Use original character and place names (the platform's moderation rejects copyrighted IP), and write the world in your own words. The result is a fan-fiction expansion you author, not a copy of someone else's text. Our book-inspired pages explain the technique for Fourth Wing, ACOTAR, and others.",
  },
  {
    q: "Is this content appropriate for all ages?",
    a: "No. RomantasyAI is an adults-only (18+) community. The on-site content is suggestive slow-burn romance, never explicit. The partner chat platform is fully customisable: you can keep things tasteful or dial up the intimacy to match your taste.",
  },
  {
    q: "What AI model produces the best romantasy imagery?",
    a: "Cinematic realism is the strongest default. The \u201Cvivid\u201D model produces the richest lighting, depth, and detail \u2014 our Prompt Studio and Prompt Library walk you through composing prompts that play to those strengths.",
  },
];

export const metadata: Metadata = {
  title: {
    absolute:
      "RomantasyAI \u2014 Step Into Your Own Romantic Fantasy Story (18+)",
  },
  description:
    "Choose-your-own-adventure romantasy where you're the protagonist. Play original story worlds, author your own immersive characters, and generate cinematic imagery and video for every scene. Adults only, slow-burn first.",
  alternates: { canonical: "/" },
};

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.romantasyai.com";

const HOME_JSON_LD = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${SITE_URL}#org`,
      name: "RomantasyAI",
      url: SITE_URL,
      logo: `${SITE_URL}/og.jpg`,
      sameAs: [],
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}#site`,
      name: "RomantasyAI",
      url: SITE_URL,
      publisher: { "@id": `${SITE_URL}#org` },
      inLanguage: "en-US",
    },
  ],
};

/* Featured grid is capped to the first 9 ranked characters (3x3 on desktop).
 * The full catalogue lives at /characters. */
const HOME_FEATURED = FEATURED_CHARACTERS.slice(0, 9);

const PATHWAYS = [
  {
    href: "/characters",
    label: "Stories",
    headline: "Play stories already built",
    body: "Step into 60+ original romantasy worlds. Choose-your-own-adventure depth on every story \u2014 your choices shape the plot and the romance. Free 60-second interactive previews on the top characters before you commit.",
    cta: "Browse the catalogue",
  },
  {
    href: "/character-builder-academy",
    label: "Build",
    headline: "Author your own world",
    body: "Make your own dragon-bonded heir or fae court intrigue. The Character Builder Academy teaches the craft in eight lessons; the 3-step wizard hands you the basics in under a minute. Either way you finish on the full builder with everything pre-set.",
    cta: "Learn the craft",
  },
  {
    href: "/prompt-studio",
    label: "Studio",
    headline: "Make your own romantasy movie",
    body: "Compose cinematic still imagery and 60-second video clips for every scene of your story. Stitch clips into feature-length sequences, or build standalone fan art. 110+ prompt parts, ready to assemble.",
    cta: "Open the Studio",
  },
] as const;

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(HOME_JSON_LD) }}
      />

      {/* ── Hero ───────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-hero-gradient">
        <div
          aria-hidden
          className="ember-glow pointer-events-none absolute -left-40 -top-40 h-[600px] w-[600px] rounded-full bg-plum-700/30 blur-3xl"
        />
        <div
          aria-hidden
          className="ember-glow pointer-events-none absolute -bottom-32 -right-32 h-[500px] w-[500px] rounded-full bg-gold-500/10 blur-3xl"
        />

        <div className="page-section relative flex flex-col items-center gap-8 pb-24 pt-20 text-center">
          <Disclaimer />

          <h1 className="heading-1 mt-4 max-w-3xl">
            Step Into Your Own{" "}
            <span className="bg-gradient-to-r from-gold-400 to-gold-600 bg-clip-text text-transparent">
              Romantic Fantasy Story
            </span>
          </h1>

          <p className="max-w-2xl text-lg leading-relaxed text-parchment-300/80">
            You loved <em>Fourth Wing</em>. You re-read <em>ACOTAR</em>.
            You wished you could keep going past the last page &mdash; not
            as a reader, but as the protagonist. RomantasyAI is the
            choose-your-own-adventure layer where that&rsquo;s now real.
            Play original story worlds, author your own, and generate
            cinematic imagery for every scene.
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            <Link href="#featured" className="btn-primary">
              Try a 60-sec preview&nbsp;&rarr;
            </Link>
            <Link href="/character-builder-academy" className="btn-secondary">
              Build your own world
            </Link>
          </div>

          <p className="text-xs text-parchment-300/50">
            No sign-up. No email. Adults only (18+).
          </p>
        </div>
      </section>

      {/* ── Three Pathways ─────────────────────────────────── */}
      <section className="page-section">
        <h2 className="heading-2 text-center">Three Ways In</h2>
        <p className="mx-auto mt-3 max-w-xl text-center text-parchment-300/70">
          Different readers want different things. Pick the entry point
          that matches your intent &mdash; the others stay one click away.
        </p>

        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          {PATHWAYS.map((p) => (
            <Link
              key={p.href}
              href={p.href}
              className="group flex flex-col rounded-xl border border-white/5 bg-card-gradient p-6 transition-all hover:border-gold-500/30 hover:shadow-lg hover:shadow-gold-500/10"
            >
              <p className="text-xs uppercase tracking-[0.2em] text-gold-400/80">
                {p.label}
              </p>
              <h3 className="mt-2 font-display text-xl font-semibold text-parchment-100 group-hover:text-gold-400">
                {p.headline}
              </h3>
              <p className="mt-3 flex-grow text-sm leading-relaxed text-parchment-300/70">
                {p.body}
              </p>
              <p className="mt-4 text-sm font-medium text-gold-400">
                {p.cta}&nbsp;&rarr;
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Featured Characters (proof of pathway #1) ──────── */}
      <section id="featured" className="page-section scroll-mt-20">
        <h2 className="heading-2 text-center">Stories Ready to Play</h2>
        <p className="mx-auto mt-3 max-w-xl text-center text-parchment-300/70">
          Free 60-second interactive previews on the marked cards. No
          sign-up, no email &mdash; just press play.
        </p>

        <p className="mx-auto mt-4 flex max-w-md items-center justify-center gap-2 text-center text-xs text-parchment-300/60">
          <span aria-hidden className="inline-block h-2 w-2 rounded-full bg-gold-400" />
          Avatars marked with a gold dot have a free 60-second story preview.
        </p>

        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {HOME_FEATURED.map((c, i) => (
            <CharacterCardCompact
              key={c.slug}
              character={c}
              showAge
              eager={i < 3}
            />
          ))}
        </div>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/characters" className="btn-primary">
            Browse all stories&nbsp;&rarr;
          </Link>
          <Link href="/books" className="btn-secondary">
            Book-inspired worlds
          </Link>
        </div>
      </section>

      {/* ── How the Three Pathways Connect ─────────────────── */}
      <section className="page-section">
        <h2 className="heading-2 text-center">How It All Connects</h2>
        <p className="mx-auto mt-3 max-w-xl text-center text-parchment-300/70">
          The three pathways share one creative engine. Most readers
          start in one, then discover the others naturally.
        </p>

        <div className="mt-12 grid gap-6 sm:grid-cols-3">
          {[
            {
              title: "Read first, then build",
              desc: "Play a few stories on the catalogue. Find the archetype that lands for you. Then jump to the Academy to build your own variation \u2014 same trope, your protagonist.",
            },
            {
              title: "Build first, then read",
              desc: "Spend an hour writing the brief for your dream character or world. While you wait for inspiration to land, browse the catalogue for adjacent stories that already exist.",
            },
            {
              title: "Make scenes for your story",
              desc: "Whether you played someone else's world or built your own, Prompt Studio generates the cinematic imagery and 60-second video clips that bring the scenes to life.",
            },
          ].map((card) => (
            <div
              key={card.title}
              className="rounded-xl border border-white/5 bg-card-gradient p-6"
            >
              <h3 className="font-display text-lg font-semibold text-gold-400">
                {card.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-parchment-300/70">
                {card.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────── */}
      <section className="page-section">
        <FaqBlock items={FAQ} />
      </section>
    </>
  );
}
