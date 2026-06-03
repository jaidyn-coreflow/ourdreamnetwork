import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "OurDream Network — privacy policy.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <div className="page-section mx-auto max-w-3xl space-y-6">
      <h1 className="heading-1">Privacy Policy</h1>

      <section className="space-y-3 text-parchment-300/80">
        <h2 className="heading-2">What We Collect</h2>
        <p>
          RomantasyAI does not run any first-party analytics, ad pixels, or
          server-side logging beyond standard hosting access logs.
        </p>
      </section>

      <section className="space-y-3 text-parchment-300/80">
        <h2 className="heading-2">Outbound Tracking to ourdream.ai</h2>
        <p>
          When you click a link from RomantasyAI to ourdream.ai we forward
          tracking parameters that were already on your inbound URL. We
          never add Google Analytics UTM parameters that weren&rsquo;t
          present.
        </p>
        <p>
          We add a fixed attribution parameter (<code>ref=romantasyai</code>)
          only when no affiliate identifier (<code>affid</code> or{" "}
          <code>aff_id</code>) is present on the outbound URL. When an
          affiliate sent you here, the affiliate&rsquo;s identifier is
          the canonical attribution and we don&rsquo;t layer a duplicate
          claim on top.
        </p>
        <p>The parameters we forward when present fall into five categories:</p>
        <ul className="list-inside list-disc space-y-1.5 pl-2 text-sm">
          <li>
            <strong className="text-parchment-200">Affiliate / click IDs</strong>{" "}
            &mdash; <code>click_id</code>, <code>clickid</code>, <code>cid</code>,{" "}
            <code>exotracker</code>, <code>aclid</code>, <code>adniumconv</code>,{" "}
            <code>TRid</code>, <code>TSid</code>, <code>tracker</code>,{" "}
            <code>affid</code>, <code>aff_id</code>, <code>dpo</code>,{" "}
            <code>source</code>, <code>reward</code>, <code>rdt_cid</code>.
          </li>
          <li>
            <strong className="text-parchment-200">Everflow sub-parameters</strong>{" "}
            &mdash; <code>sub1</code>, <code>sub2</code>, <code>sub3</code>,{" "}
            <code>sub4</code>, <code>sub5</code>.
          </li>
          <li>
            <strong className="text-parchment-200">UTMs &amp; ad-platform click IDs</strong>{" "}
            &mdash; <code>utm_source</code>, <code>utm_medium</code>,{" "}
            <code>utm_campaign</code>, <code>utm_term</code>, <code>utm_content</code>,{" "}
            <code>fbclid</code>, <code>gclid</code>, <code>msclkid</code>,{" "}
            <code>ttclid</code>.
          </li>
          <li>
            <strong className="text-parchment-200">Google Ads macros</strong>{" "}
            &mdash; <code>adgroup</code>, <code>keyword</code>,{" "}
            <code>matchtype</code>, <code>network</code>, <code>device</code>,{" "}
            <code>placement</code>, <code>adposition</code>,{" "}
            <code>loc_physical</code>, <code>loc_interest</code>,{" "}
            <code>campaignid</code>, <code>adgroupid</code>,{" "}
            <code>feeditemid</code>, <code>targetid</code>.
          </li>
          <li>
            <strong className="text-parchment-200">Funnel preselects</strong>{" "}
            &mdash; <code>gender</code>, <code>style</code>, <code>promo</code>,{" "}
            <code>closed</code>, <code>signup</code>, <code>login</code>,{" "}
            <code>upgrade</code>.
          </li>
        </ul>
        <p className="text-sm text-parchment-300/60">
          These parameters are read from your URL and forwarded to ourdream.ai
          unchanged so that the original referring affiliate or ad platform can
          attribute the click. We do not log them on our servers.
        </p>
        <p className="text-sm text-parchment-300/60">
          Values that look like unsubstituted template macros (e.g.{" "}
          <code>{"{transaction_id}"}</code>) are dropped rather than
          forwarded, so a misconfigured upstream link cannot poison
          ourdream.ai&rsquo;s attribution storage.
        </p>
      </section>

      <section className="space-y-3 text-parchment-300/80">
        <h2 className="heading-2">Local Tracking Storage</h2>
        <p>
          To preserve attribution across pages on this site, your browser
          stores a small map of the attribution-class parameters above
          (affiliate IDs, click IDs, sub-params, UTMs, ad-platform IDs,
          Google Ads macros) in <strong>localStorage</strong> under the key{" "}
          <code>romantasyai.tracking</code>. This is the standard
          first-touch attribution model and exists so that clicking out
          to ourdream.ai after browsing internally still credits the
          campaign that originally sent you here.
        </p>
        <ul className="list-inside list-disc space-y-1.5 pl-2 text-sm">
          <li>First-write-wins: the FIRST value seen for each key is the
            one that&rsquo;s stored; subsequent visits with new tracker
            values do not overwrite the original.</li>
          <li>Funnel preselects (gender, style, promo, etc.) are{" "}
            <strong>not</strong> stored in localStorage \u2014 they only flow
            through the live URL or the wizard.</li>
          <li>You can clear this at any time via your browser&rsquo;s
            site-data tools.</li>
          <li>We do not write or read this storage from our servers; it
            never leaves your browser except as part of the tracker
            parameters appended to outbound links to ourdream.ai.</li>
        </ul>
      </section>

      <section className="space-y-3 text-parchment-300/80">
        <h2 className="heading-2">What We Do Not Store</h2>
        <p>
          We do not store any text you paste or type on this site. Pasted
          content is processed in your browser only and is not retained on our
          systems.
        </p>
      </section>

      <section className="space-y-3 text-parchment-300/80">
        <h2 className="heading-2">Cookies &amp; Analytics</h2>
        <p>
          We do not use cookies or third-party analytics on romantasyai.com.
          The localStorage tracking entry described above is the only
          persistent data we set in your browser, and its sole purpose is
          to keep affiliate / campaign attribution intact across internal
          navigation. Anything that happens after you click through to
          ourdream.ai is governed by{" "}
          <a
            href="https://ourdream.ai/privacy"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gold-400 underline hover:text-gold-300"
          >
            ourdream.ai&rsquo;s privacy policy
          </a>
          .
        </p>
      </section>
    </div>
  );
}
