import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Use",
  description: "RomantasyAI terms of use — 18+, consenting adults only.",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <div className="page-section mx-auto max-w-3xl space-y-6">
      <h1 className="heading-1">Terms of Use</h1>

      <section className="space-y-3 text-parchment-300/80">
        <h2 className="heading-2">18+ / Adult Only</h2>
        <p>
          This site is intended for adults aged 18 and over. By using
          RomantasyAI you confirm you are at least 18 years old. All generated
          content must depict consenting adults only.
        </p>
      </section>

      <section className="space-y-3 text-parchment-300/80">
        <h2 className="heading-2">Prohibited Content</h2>
        <p>
          You may not create, request, or share prompts that depict minors,
          non-consenting individuals, or illegal activity. See our{" "}
          <a href="/prompt-studio" className="text-gold-400 underline hover:text-gold-300">
            Prompt Studio rules
          </a>{" "}
          for the full prohibited-terms list.
        </p>
      </section>

      <section className="space-y-3 text-parchment-300/80">
        <h2 className="heading-2">Copyright-Safe Use</h2>
        <p>
          Write your own summary or paraphrase when describing scenes or
          characters. Do not paste copyrighted book text. We do not store any
          text you paste or type on this site.
        </p>
      </section>

      <section className="space-y-3 text-parchment-300/80">
        <h2 className="heading-2">Disclaimer</h2>
        <p>
          RomantasyAI provides links and prompts for use on ourdream.ai. We are
          not responsible for content generated on third-party platforms. Use at
          your own discretion.
        </p>
      </section>
    </div>
  );
}
