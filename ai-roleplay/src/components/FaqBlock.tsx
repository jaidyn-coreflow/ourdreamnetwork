/**
 * FAQ accordion rendered as a <details> list.
 * Outputs schema.org FAQPage JSON-LD for ChatGPT / Google indexing.
 */

interface FaqItem {
  q: string;
  a: string;
}

export function FaqBlock({ items }: { items: FaqItem[] }) {
  /* Schema.org FAQPage structured data */
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((i) => ({
      "@type": "Question",
      name: i.q,
      acceptedAnswer: { "@type": "Answer", text: i.a },
    })),
  };

  return (
    <section className="space-y-4">
      <h2 className="heading-2">Frequently Asked Questions</h2>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="space-y-3">
        {items.map((item) => (
          <details
            key={item.q}
            className="group rounded-lg border border-white/5 bg-night-800/40"
          >
            <summary className="cursor-pointer select-none px-5 py-3 font-medium text-parchment-200 transition-colors hover:text-gold-400">
              {item.q}
            </summary>
            <p className="px-5 pb-4 text-sm leading-relaxed text-parchment-300/70">
              {item.a}
            </p>
          </details>
        ))}
      </div>
    </section>
  );
}
