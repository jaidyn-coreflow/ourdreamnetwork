# `/ai-roleplay` Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship `ourdreamnetwork.com/ai-roleplay` — the full romantasy `/characters` experience (catalogue grid + detail pages + 60-sec CYOA previews + tag pages), reskinned to match `index.html`'s dark-pink style, with CTAs that open an email-capture modal before redirecting to each character's `ourdream.ai/chat/<slug>` URL.

**Architecture:** A standalone Next.js 14 app in `ai-roleplay/`, deployed as its **own Vercel project** with `basePath: '/ai-roleplay'`, proxied in via two rewrites in the main static project's `vercel.json` (Vercel Multi-Zones). The existing static pages, the `/` quiz funnel, and `/api/save-email.js` are untouched. Reskin is done by remapping Tailwind color/font **tokens** (the components reference `gold`/`parchment`/`plum`/`night`/`font-display`), not by editing component `className`s. The new email-gate modal reuses `index.html`'s exact RedTrack funnel pipeline.

**Tech Stack:** Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS 3, Vitest. Source components come from the clone at `romantasy/romantasyai.com`.

**Spec:** `docs/superpowers/specs/2026-06-03-ai-roleplay-page-design.md`

---

## File Structure

New app lives at `ai-roleplay/` (repo-tracked, no nested `.git`). Built by copying from the clone and trimming.

| Path | Responsibility |
|---|---|
| `ai-roleplay/next.config.js` | basePath/assetPrefix, image host allowlist, security headers |
| `ai-roleplay/src/app/layout.tsx` | HTML shell, GTM + RedTrack scripts, ambient glow, header/footer |
| `ai-roleplay/src/app/page.tsx` | Catalogue grid (`/ai-roleplay`) — was `characters/page.tsx` |
| `ai-roleplay/src/app/[slug]/page.tsx` | Character detail + CYOA preview (`/ai-roleplay/<slug>`) |
| `ai-roleplay/src/app/tag/[tag]/page.tsx` | Trope tag page (`/ai-roleplay/tag/<tag>`) |
| `ai-roleplay/src/components/SiteHeader.tsx` | ourdreamnetwork logo + trimmed nav (replaces romantasy `Header`) |
| `ai-roleplay/src/components/SiteFooter.tsx` | ourdreamnetwork footer + trust badges (replaces romantasy `Footer`) |
| `ai-roleplay/src/components/EmailGate.tsx` | Email-capture modal + React context provider/trigger |
| `ai-roleplay/src/lib/redirect.ts` | **Pure** URL builder for the chat redirect (unit-tested) |
| `ai-roleplay/src/lib/redirect.test.ts` | Vitest tests for `buildRedirectUrl` |
| `ai-roleplay/src/lib/funnel-client.ts` | DOM glue: cookie read, `getGlValue`, `getDecoratedUrl`, `saveEmail`, `fireRedirect` |
| `ai-roleplay/tailwind.config.ts` | Token remap (gold→pink, parchment→white/gray, plum→magenta, sans font) |
| `ai-roleplay/src/app/globals.css` | btn-primary etc. inherit remapped tokens; index-style selection |
| `vercel.json` (main repo) | Two proxy rewrites for `/ai-roleplay` and `/ai-roleplay/:path*` |
| `CLAUDE.md` (main repo) | Add `/ai-roleplay` row (note: separate Next.js zone) |

**Reused unchanged from the clone:** `CharacterCard`, `FaqBlock`, `Disclaimer`, `ChatPreview`, `ChatPreviewSeoSurface`, `PromptCard` (only if referenced), `TrackingCapture`, `src/data/characters.ts`, `src/data/chat-previews/*`, `src/lib/tags.ts`, `src/lib/outbound.ts`, `src/lib/tracking-storage.ts`, `src/lib/match.ts`.

**Removed (out of scope):** routes `create/`, `books/`, `prompt-studio/`, `prompt-library/`, `character-builder-academy/`, `about/`; components `CreateWizard`, `PromptLibrary`, `PromptBuilder`, `PromptComposer`; their data files; cross-links to them.

---

## Task 0: Scaffold the zone app

**Files:**
- Create: `ai-roleplay/` (copied subset of `romantasy/romantasyai.com`)

- [ ] **Step 1: Copy the clone into the new app dir, excluding git + build + out-of-scope code**

```bash
cd "/Users/jaidynl/GitHub Coding Projects/ourdreamnetwork"
rsync -a --exclude='.git' --exclude='node_modules' --exclude='.next' \
  romantasy/romantasyai.com/ ai-roleplay/
```

- [ ] **Step 2: Delete out-of-scope routes, components, and data**

```bash
cd "/Users/jaidynl/GitHub Coding Projects/ourdreamnetwork/ai-roleplay"
rm -rf src/app/create src/app/books src/app/prompt-studio \
       src/app/prompt-library src/app/character-builder-academy src/app/about
rm -f src/components/CreateWizard.tsx src/components/PromptLibrary.tsx \
      src/components/PromptBuilder.tsx src/components/PromptComposer.tsx \
      src/components/PromptCard.tsx
rm -f src/data/promptLibrary.ts src/data/promptParts.ts
```

- [ ] **Step 3: Install dependencies**

```bash
cd "/Users/jaidynl/GitHub Coding Projects/ourdreamnetwork/ai-roleplay"
npm install
```
Expected: installs `next@14.2.21`, `react`, `tailwindcss`, `vitest`, etc. with no fatal errors.

- [ ] **Step 4: Confirm what still references deleted modules**

Run: `cd ai-roleplay && npx tsc --noEmit 2>&1 | head -40`
Expected: TypeScript errors ONLY from `src/app/page.tsx` (old characters page is still at `characters/`), `Header.tsx`, `Footer.tsx`, `sitemap.xml/route.ts`, `robots.txt/route.ts` referencing removed routes. Note them — later tasks fix these. (If `home`/`page.tsx` at app root imports a deleted component, that's expected; it's replaced in Task 2.)

- [ ] **Step 5: Commit**

```bash
cd "/Users/jaidynl/GitHub Coding Projects/ourdreamnetwork"
git add ai-roleplay
git commit -m "Scaffold ai-roleplay zone app from romantasy clone (trimmed)"
```

---

## Task 1: Configure basePath, assetPrefix, and next.config

**Files:**
- Modify: `ai-roleplay/next.config.js`

- [ ] **Step 1: Replace next.config.js**

Replace the whole file with (drops the romantasyai.com host redirect; adds basePath + assetPrefix; keeps image host + security headers):

```js
/** Security headers — unsafe-url referrer preserves ourdream attribution. */
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Referrer-Policy", value: "unsafe-url" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
  },
  { key: "X-DNS-Prefetch-Control", value: "on" },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Served behind ourdreamnetwork.com/ai-roleplay via a Vercel Multi-Zones
  // rewrite. basePath prefixes routes; assetPrefix makes _next/* assets
  // resolve under the proxied path.
  basePath: "/ai-roleplay",
  assetPrefix: "/ai-roleplay",
  images: {
    remotePatterns: [{ protocol: "https", hostname: "img.ourdream.ai" }],
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

module.exports = nextConfig;
```

- [ ] **Step 2: Verify dev server boots under the basePath**

```bash
cd ai-roleplay && npm run dev
```
Expected: server starts; the app is reachable at `http://localhost:3000/ai-roleplay` (root `/` now 404s — that's correct under basePath). Stop the server (Ctrl-C) before continuing.

- [ ] **Step 3: Commit**

```bash
git add ai-roleplay/next.config.js
git commit -m "Configure ai-roleplay basePath + assetPrefix, drop host redirect"
```

---

## Task 2: Re-root routes so the catalogue lives at `/ai-roleplay`

**Files:**
- Move: `ai-roleplay/src/app/characters/page.tsx` → `ai-roleplay/src/app/page.tsx`
- Move: `ai-roleplay/src/app/characters/[slug]/page.tsx` → `ai-roleplay/src/app/[slug]/page.tsx`
- Move: `ai-roleplay/src/app/characters/tag/[tag]/page.tsx` → `ai-roleplay/src/app/tag/[tag]/page.tsx`
- Delete: stale `ai-roleplay/src/app/page.tsx` (romantasy home) and `ai-roleplay/src/app/characters/`

- [ ] **Step 1: Replace the home route with the catalogue, move detail + tag routes**

```bash
cd "/Users/jaidynl/GitHub Coding Projects/ourdreamnetwork/ai-roleplay/src/app"
rm -f page.tsx                                  # old romantasy home
git mv characters/page.tsx page.tsx 2>/dev/null || mv characters/page.tsx page.tsx
mkdir -p "[slug]" tag
mv "characters/[slug]/page.tsx" "[slug]/page.tsx"
mv "characters/tag/[tag]" "tag/[tag]"
rm -rf characters
```

- [ ] **Step 2: Rewrite internal route hrefs in the three moved pages**

In `page.tsx`, `[slug]/page.tsx`, and `tag/[tag]/page.tsx`, update every internal `<Link href>` / `generateMetadata` canonical that pointed at the old characters tree:
- `/characters` → `/`
- `/characters?...` (the `buildQuery` helper in `page.tsx`) → `/?...` (change the two `return` strings: `` `/characters?${qs}` `` → `` `/?${qs}` `` and `"/characters"` → `"/"`)
- `/characters/${c.slug}` → `/${c.slug}`  (note: `CharacterCard` is reused unchanged and builds `/characters/${slug}` internally — fix it in Task 7's edit list instead; here only fix hrefs written directly in the page files)
- `/characters/tag/${slug}` → `/tag/${slug}`
- `alternates.canonical: "/characters"` → `"/"`

Leave links to `/privacy` and `/terms` as-is (those pages exist on the main domain; see Step 4).

- [ ] **Step 3: Fix the sitemap/robots routes (or remove them)**

`src/app/sitemap.xml/route.ts` and `src/app/robots.txt/route.ts` reference removed routes and the old `/characters` paths. Simplest correct action for this zone: delete both — the zone is `noindex` (set in Task 3) and the main domain owns sitemap/robots.

```bash
rm -rf src/app/sitemap.xml src/app/robots.txt
```

- [ ] **Step 4: Repoint `/privacy` and `/terms` links to the main domain**

The zone does not serve `/privacy` or `/terms`. In any reused component/page that links to them (footer built in Task 4, `Disclaimer.tsx`, gate legal text), use absolute paths `https://ourdreamnetwork.com/privacy` and `https://ourdreamnetwork.com/terms`. Grep to find them:

Run: `cd ai-roleplay && grep -rn '"/privacy"\|"/terms"\|/privacy\|/terms' src`
Then replace each with the absolute ourdreamnetwork URL.

- [ ] **Step 5: Typecheck**

Run: `cd ai-roleplay && npx tsc --noEmit 2>&1 | head -40`
Expected: remaining errors only from `Header.tsx`/`Footer.tsx` (replaced in Task 4) and the catalogue page's "other pillars" section linking to removed routes (trimmed in Task 8). No errors about missing `characters/` routes.

- [ ] **Step 6: Commit**

```bash
git add -A ai-roleplay
git commit -m "Re-root ai-roleplay routes: catalogue at /, detail at /[slug], tags at /tag/[tag]"
```

---

## Task 3: Reskin Tailwind tokens to match index.html

**Files:**
- Modify: `ai-roleplay/tailwind.config.ts`
- Modify: `ai-roleplay/src/app/globals.css`
- Modify: `ai-roleplay/src/lib/metadata.ts` (theme-color)

- [ ] **Step 1: Remap the color palette + display font**

In `tailwind.config.ts`, replace the `colors.gold`, `colors.plum`, `colors.parchment` blocks and the `fontFamily.display` so components that reference these tokens render in index's dark-pink palette. Set:

```ts
colors: {
  night: { 950: "#060606", 900: "#0a0a0a", 800: "#141414", 700: "#1a1a1a" },
  // index pink accent maps onto the components' "gold" token
  gold: { 400: "#F17BB6", 500: "#e85aa0", 600: "#db2777" },
  rose: { 700: "#8b2252", 600: "#a62d65", 500: "#c2185b" },
  // plum surfaces → deep magenta-tinted darks
  plum: { 900: "#1a0e15", 800: "#2a121f", 700: "#3a1830", 600: "#db2777" },
  // parchment text → white / neutral grays
  parchment: { 100: "#ffffff", 200: "#f5f5f5", 300: "#d4d4d4" },
},
fontFamily: {
  display: ["system-ui", "-apple-system", "BlinkMacSystemFont", '"Segoe UI"', "Roboto", "sans-serif"],
  body: ["system-ui", "-apple-system", "BlinkMacSystemFont", '"Segoe UI"', "Roboto", "sans-serif"],
},
```

Also update `backgroundImage.hero-gradient` / `card-gradient` to pink tones:

```ts
backgroundImage: {
  "hero-gradient":
    "radial-gradient(ellipse at 30% 20%, rgba(219,39,119,0.18) 0%, transparent 50%), " +
    "radial-gradient(ellipse at 70% 80%, rgba(241,123,182,0.12) 0%, transparent 50%), " +
    "linear-gradient(180deg, #060606 0%, #141414 100%)",
  "card-gradient":
    "linear-gradient(135deg, rgba(42,18,31,0.6) 0%, rgba(20,20,20,0.85) 100%)",
},
```

- [ ] **Step 2: Update globals.css selection color**

In `ai-roleplay/src/app/globals.css`, the `::selection` and component classes already use the remapped tokens, so no change is required to `btn-primary` etc. (they become a pink gradient automatically). Confirm by reading the file; only change needed: none unless a literal hex is hardcoded. Leave as-is.

- [ ] **Step 3: Update theme-color to index's background**

In `ai-roleplay/src/lib/metadata.ts`, set `siteViewport.themeColor` to `"#0a0a0a"`. Set `siteMetadata.robots` to `{ index: false, follow: false }` (the zone is noindex; canonical surface is the main domain). Update `SITE_URL` fallback to `https://ourdreamnetwork.com/ai-roleplay` and `title.default`/`description` to ourdreamnetwork-appropriate copy (e.g. default `"AI Roleplay Characters | OurDream Network"`).

- [ ] **Step 4: Visual check**

```bash
cd ai-roleplay && npm run dev
```
Open `http://localhost:3000/ai-roleplay`. Expected: dark `#0a0a0a` background, pink CTA buttons and accents, sans-serif headings. Stop the server.

- [ ] **Step 5: Commit**

```bash
git add ai-roleplay/tailwind.config.ts ai-roleplay/src/app/globals.css ai-roleplay/src/lib/metadata.ts
git commit -m "Reskin ai-roleplay tokens to index dark-pink theme"
```

---

## Task 4: ourdreamnetwork chrome (header, footer, ambient glow, tracking scripts)

**Files:**
- Create: `ai-roleplay/src/components/SiteHeader.tsx`
- Create: `ai-roleplay/src/components/SiteFooter.tsx`
- Modify: `ai-roleplay/src/app/layout.tsx`
- Delete: `ai-roleplay/src/components/Header.tsx`, `ai-roleplay/src/components/Footer.tsx`
- Copy asset: `public/ourdreamnetworklogov2.svg` and `public/favicon.svg` from main repo into `ai-roleplay/public/`

- [ ] **Step 1: Copy logo + favicon assets into the zone's public/**

```bash
cd "/Users/jaidynl/GitHub Coding Projects/ourdreamnetwork"
cp public/ourdreamnetworklogov2.svg public/favicon.svg ai-roleplay/public/ 2>/dev/null \
  || echo "CHECK: confirm logo/favicon filenames in public/ and copy the right ones"
```
(If `ourdreamnetworklogov2.svg` is not in `public/`, find the logo referenced by `index.html` line ~672 / the header, and copy that file.)

- [ ] **Step 2: Create `SiteHeader.tsx`** (ourdreamnetwork logo, no out-of-scope nav)

```tsx
import Link from "next/link";

/** Minimal header: logo links to the catalogue root. No pillar nav —
 *  the other romantasy pillars are out of scope for this zone. */
export function SiteHeader() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/5 bg-night-900/80 backdrop-blur-md">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <Link href="/" className="inline-block w-[180px] opacity-95 hover:opacity-100">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/ai-roleplay/ourdreamnetworklogov2.svg" alt="OurDream Network" className="block h-auto w-full" />
        </Link>
        <span className="flex items-center gap-2 text-[13px] text-white/55">
          <span className="h-2 w-2 rounded-full bg-[#F17BB6] shadow-[0_0_6px_rgba(241,123,182,0.7)]" />
          <span className="font-semibold text-white">2,300+</span> chatting now
        </span>
      </nav>
    </header>
  );
}
```
(Logo `src` is absolute with the `/ai-roleplay` prefix because `<img>` is not basePath-aware, unlike `next/image`.)

- [ ] **Step 3: Create `SiteFooter.tsx`** (trust badges + legal, absolute privacy/terms links)

```tsx
import { Disclaimer } from "@/components/Disclaimer";

export function SiteFooter() {
  return (
    <footer className="border-t border-white/5 bg-night-900/80">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-4 py-8 text-sm sm:flex-row sm:justify-between sm:px-6">
        <Disclaimer variant="footer" />
        <ul className="flex gap-4">
          <li><a href="https://ourdreamnetwork.com/privacy" className="text-white/50 hover:text-[#F17BB6]">Privacy</a></li>
          <li><a href="https://ourdreamnetwork.com/terms" className="text-white/50 hover:text-[#F17BB6]">Terms</a></li>
        </ul>
      </div>
      <div className="border-t border-white/5 py-4 text-center text-xs text-white/40">
        &copy; OurDream Network. All rights reserved. 18+ only.
      </div>
    </footer>
  );
}
```

- [ ] **Step 4: Rewrite `layout.tsx`** — ambient glow, GTM + RedTrack scripts, new chrome, EmailGate provider (added in Task 6; leave a placeholder import commented until then)

```tsx
import type { ReactNode } from "react";
import Script from "next/script";
import { siteMetadata, siteViewport } from "@/lib/metadata";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { TrackingCapture } from "@/components/TrackingCapture";
import { EmailGateProvider } from "@/components/EmailGate";
import "./globals.css";

export const metadata = siteMetadata;
export const viewport = siteViewport;

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="icon" type="image/svg+xml" href="/ai-roleplay/favicon.svg" />
        <link rel="preconnect" href="https://img.ourdream.ai" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://clk.ourdreamnetwork.com" />
        {/* RedTrack universal tag — writes the rtkclickid-store cookie ASAP. */}
        <Script
          src="https://clk.ourdreamnetwork.com/uniclick.js?attribution=lastpaid&cookiedomain=ourdreamnetwork.com&cookieduration=30&defaultcampaignid=6a06af2165debd9009452848&regviewonce=false"
          strategy="afterInteractive"
        />
        {/* Google Tag Manager — provides the cross-domain _gl linker used by getGlValue. */}
        <Script id="gtm" strategy="afterInteractive">{`
          (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});
          var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';
          j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;
          f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','GTM-5VRS8QPJ');
        `}</Script>
      </head>
      <body className="flex min-h-screen flex-col bg-night-900 text-white">
        {/* Pink ambient drift glow (matches index.html) */}
        <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
          <div className="absolute -left-[10%] -top-[20%] h-[60%] w-[60%] rounded-full"
               style={{ background: "radial-gradient(ellipse, rgba(219,39,119,0.08) 0%, transparent 70%)" }} />
          <div className="absolute -bottom-[20%] -right-[10%] h-[50%] w-[50%] rounded-full"
               style={{ background: "radial-gradient(ellipse, rgba(241,123,182,0.06) 0%, transparent 70%)" }} />
        </div>
        <TrackingCapture />
        <EmailGateProvider>
          <div className="relative z-10 flex min-h-screen flex-col">
            <SiteHeader />
            <main className="flex-1 pt-16">{children}</main>
            <SiteFooter />
          </div>
        </EmailGateProvider>
      </body>
    </html>
  );
}
```

- [ ] **Step 5: Delete the old Header/Footer**

```bash
rm -f ai-roleplay/src/components/Header.tsx ai-roleplay/src/components/Footer.tsx
```

- [ ] **Step 6: Typecheck (EmailGate will error until Task 6)**

Run: `cd ai-roleplay && npx tsc --noEmit 2>&1 | head -20`
Expected: only `Cannot find module '@/components/EmailGate'` (created next) and any out-of-scope "other pillars" link errors (Task 8). Nothing about Header/Footer.

- [ ] **Step 7: Commit**

```bash
git add -A ai-roleplay
git commit -m "Add ourdreamnetwork chrome, ambient glow, GTM + RedTrack scripts to ai-roleplay"
```

---

## Task 5: Pure chat-redirect URL builder (TDD)

**Files:**
- Create: `ai-roleplay/src/lib/redirect.ts`
- Test: `ai-roleplay/src/lib/redirect.test.ts`

The pipeline mirrors `index.html`'s `redirectToRedtrack`, but the destination is a per-character `ourdream.ai/chat/<slug>` URL. `buildRedirectUrl` is **pure** (all inputs passed as args) so it unit-tests without a DOM. The DOM glue lives in Task 6's `funnel-client.ts`.

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, it } from "vitest";
import { buildRedirectUrl, REDTRACK_BASE } from "./redirect";

describe("buildRedirectUrl", () => {
  it("paid path: routes through RedTrack with sub11=ai-roleplay, clickid, _gl, and the chat slug", () => {
    const url = buildRedirectUrl({
      chatSlug: "draven-thorne-C6YywpVFVj",
      clickid: "abc123",
      gl: "1*glpayload",
      inbound: new URLSearchParams("gclid=G1&utm_source=google"),
    });
    expect(url.startsWith(REDTRACK_BASE + "?")).toBe(true);
    const qs = new URL(url).searchParams;
    expect(qs.get("sub11")).toBe("ai-roleplay");
    expect(qs.get("sub12")).toBe("draven-thorne-C6YywpVFVj"); // chat slug carried to RedTrack
    expect(qs.get("sub19")).toBe("1*glpayload");
    expect(qs.get("clickid")).toBe("abc123");
    expect(qs.get("gclid")).toBe("G1");
    expect(qs.get("utm_source")).toBe("google");
  });

  it("organic path (no clickid): goes direct to the chat URL with ref + inbound params", () => {
    const url = buildRedirectUrl({
      chatSlug: "draven-thorne-C6YywpVFVj",
      clickid: "",
      gl: "",
      inbound: new URLSearchParams("utm_source=bing"),
    });
    expect(url).toBe(
      "https://ourdream.ai/chat/draven-thorne-C6YywpVFVj?utm_source=bing&ref=googlecpc&tracker=rt",
    );
  });

  it("omits sub19 when no _gl is available on the paid path", () => {
    const url = buildRedirectUrl({ chatSlug: "x", clickid: "c", gl: "", inbound: new URLSearchParams() });
    expect(new URL(url).searchParams.has("sub19")).toBe(false);
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `cd ai-roleplay && npx vitest run src/lib/redirect.test.ts`
Expected: FAIL — `Cannot find module './redirect'`.

- [ ] **Step 3: Implement `redirect.ts`**

```ts
/**
 * Build the outbound URL that the email gate redirects to after capture.
 *
 * Mirrors public/index.html's redirectToRedtrack(), but the destination is
 * a per-character ourdream.ai/chat/<slug> URL instead of /create.
 *
 *   PAID   (clickid present): clk.ourdreamnetwork.com/click/<N> with
 *           sub11=ai-roleplay (source label), sub12=<chatSlug> (the chat
 *           path the RedTrack slot forwards to), sub19=<_gl> (GA4 linker),
 *           clickid=<cookie>. The RedTrack slot's destination must be
 *           configured as https://ourdream.ai/chat/{sub12}?...&clickid={clickid}
 *           &tracker=rt&_gl={sub19}. See spec "Open external dependency".
 *   ORGANIC (no clickid): RedTrack rejects empty clickid, so go direct to
 *           https://ourdream.ai/chat/<slug> with ref=googlecpc&tracker=rt.
 *           Caller GTM-decorates this URL for _gl (getDecoratedUrl).
 */

// clk.ourdreamnetwork.com/click/2 — DEDICATED chat-redirect slot. Configure
// this slot in the RedTrack dashboard before the paid path attributes.
// (index.html uses /click/1 for the /create quiz; do not reuse it.)
export const REDTRACK_BASE = "https://clk.ourdreamnetwork.com/click/2";

const OURDREAM_CHAT_BASE = "https://ourdream.ai/chat/";

export interface RedirectInputs {
  chatSlug: string;
  clickid: string;
  gl: string;
  inbound: URLSearchParams;
}

export function buildRedirectUrl({ chatSlug, clickid, gl, inbound }: RedirectInputs): string {
  const params = new URLSearchParams();
  inbound.forEach((v, k) => {
    if (!params.has(k)) params.set(k, v);
  });

  if (clickid) {
    params.set("sub11", "ai-roleplay");
    params.set("sub12", chatSlug);
    if (gl) params.set("sub19", gl);
    params.set("clickid", clickid);
    return REDTRACK_BASE + "?" + params.toString();
  }

  params.set("ref", "googlecpc");
  params.set("tracker", "rt");
  return OURDREAM_CHAT_BASE + chatSlug + "?" + params.toString();
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `cd ai-roleplay && npx vitest run src/lib/redirect.test.ts`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add ai-roleplay/src/lib/redirect.ts ai-roleplay/src/lib/redirect.test.ts
git commit -m "Add tested pure chat-redirect URL builder for ai-roleplay email gate"
```

---

## Task 6: Email-gate modal + funnel client glue

**Files:**
- Create: `ai-roleplay/src/lib/funnel-client.ts`
- Create: `ai-roleplay/src/components/EmailGate.tsx`

- [ ] **Step 1: Create `funnel-client.ts`** (DOM glue ported from index.html)

```ts
"use client";

import { buildRedirectUrl } from "@/lib/redirect";

function readClickid(): string {
  const m = document.cookie.match(/(?:^|;\s*)rtkclickid-store=([^;]+)/);
  return m ? decodeURIComponent(m[1]) : "";
}

/** Decorate a dummy ourdream.ai link, extract the _gl payload (paid sub19). */
function getGlValue(): Promise<string> {
  return new Promise((resolve) => {
    const a = document.createElement("a");
    a.href = "https://ourdream.ai/";
    a.style.cssText = "position:fixed;left:-9999px;";
    document.body.appendChild(a);
    a.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
    setTimeout(() => {
      const match = a.href.match(/[?&]_gl=([^&]+)/);
      document.body.removeChild(a);
      resolve(match ? decodeURIComponent(match[1]) : "");
    }, 100);
  });
}

/** GTM-decorate a full URL (organic path needs _gl on the final chat URL). */
function getDecoratedUrl(baseUrl: string): Promise<string> {
  return new Promise((resolve) => {
    const a = document.createElement("a");
    a.href = baseUrl;
    a.style.cssText = "position:fixed;left:-9999px;";
    document.body.appendChild(a);
    a.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
    setTimeout(() => {
      const decorated = a.href;
      document.body.removeChild(a);
      resolve(decorated);
    }, 100);
  });
}

function track(event: string, params: Record<string, unknown>) {
  (window as unknown as { dataLayer?: unknown[] }).dataLayer ??= [];
  (window as unknown as { dataLayer: unknown[] }).dataLayer.push({ event, ...params });
}

/** Fire-and-forget save; never blocks the redirect. */
function saveEmail(email: string): Promise<unknown> {
  return fetch("/api/save-email", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, mode: "ai-roleplay", marketingConsent: false }),
  });
}

/**
 * Capture the email, then redirect to the character's chat URL through the
 * RedTrack funnel. The redirect NEVER awaits saveEmail (capture loss is
 * acceptable; redirect drop-off is not — see CLAUDE.md).
 */
export async function captureAndRedirect(email: string, chatSlug: string): Promise<void> {
  track("quiz_email_captured", { source: "ai-roleplay", email_provided: true });
  saveEmail(email).catch((e) => console.warn("[save-email] failed:", e));

  const clickid = readClickid();
  const inbound = new URLSearchParams(window.location.search);
  const gl = clickid ? await getGlValue() : "";
  const url = buildRedirectUrl({ chatSlug, clickid, gl, inbound });

  track("quiz_redirect", { source: "ai-roleplay", redirect_url: url, has_clickid: !!clickid });

  // Paid path already carries _gl via sub19; only organic needs decoration.
  const finalUrl = clickid ? url : await getDecoratedUrl(url);
  window.location.href = finalUrl;
}
```

- [ ] **Step 2: Create `EmailGate.tsx`** (context provider + trigger hook + modal, styled like index's `.c3s-gate`)

```tsx
"use client";

import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import { captureAndRedirect } from "@/lib/funnel-client";

interface GateCtx {
  /** Open the modal for a given character chat slug. */
  openGate: (chatSlug: string) => void;
}
const Ctx = createContext<GateCtx | null>(null);

export function useEmailGate(): GateCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useEmailGate must be used within EmailGateProvider");
  return ctx;
}

const isValidEmail = (s: string) => /.+@.+\..+/.test(s);

export function EmailGateProvider({ children }: { children: ReactNode }) {
  const [slug, setSlug] = useState<string | null>(null);
  const [error, setError] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const openGate = useCallback((chatSlug: string) => {
    setError(false);
    setSlug(chatSlug);
  }, []);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (submitting || !slug) return;
    const email = (new FormData(e.currentTarget).get("email") as string ?? "").trim();
    if (!isValidEmail(email)) {
      setError(true);
      return;
    }
    setError(false);
    setSubmitting(true);
    await captureAndRedirect(email, slug); // navigates away
  };

  return (
    <Ctx.Provider value={{ openGate }}>
      {children}
      {slug && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="gate-title"
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-5 backdrop-blur-md"
          onClick={(e) => { if (e.target === e.currentTarget) setSlug(null); }}
        >
          <div className="relative w-full max-w-[420px] rounded-2xl border border-[#F17BB6]/25 bg-[#141414]/95 px-6 pb-14 pt-7 shadow-2xl">
            <h1 id="gate-title" className="mb-1.5 text-center text-[22px] font-bold">
              Free Trial Offer
            </h1>
            <p className="mb-5 text-center text-sm text-white/60">
              Enter your email to get <span className="text-[#F17BB6]">5 messages free</span>
            </p>
            <form onSubmit={onSubmit} noValidate>
              <input
                type="email" name="email" autoFocus required
                placeholder="name@example.com"
                className="w-full rounded-[10px] border-[1.5px] border-white/10 bg-white/5 px-4 py-3.5 text-base text-white outline-none focus:border-[#F17BB6]"
              />
              {error && (
                <div className="mt-2 text-[13px] text-red-500">
                  Enter a valid email like name@example.com
                </div>
              )}
              <button
                type="submit" disabled={submitting}
                className="btn-primary mt-3.5 w-full justify-center text-sm disabled:opacity-70"
              >
                {submitting ? "Submitting…" : "Get my 5 free messages →"}
              </button>
            </form>
            <button type="button" onClick={() => setSlug(null)}
              className="mt-3.5 block w-full text-center text-[13px] text-white/50 hover:text-white/80">
              ← back
            </button>
            <p className="mt-4 text-center text-[11px] text-white/40">
              18+. By continuing you agree to our{" "}
              <a href="https://ourdreamnetwork.com/terms" className="text-white/60 underline">Terms</a> &{" "}
              <a href="https://ourdreamnetwork.com/privacy" className="text-white/60 underline">Privacy</a>.
            </p>
          </div>
        </div>
      )}
    </Ctx.Provider>
  );
}
```

- [ ] **Step 3: Typecheck**

Run: `cd ai-roleplay && npx tsc --noEmit 2>&1 | head -20`
Expected: EmailGate/funnel errors gone. Remaining: only the catalogue "other pillars" out-of-scope link errors (Task 8) and `CharacterCard` still using `OutboundLink` to `/characters/<slug>` paths (Task 7).

- [ ] **Step 4: Commit**

```bash
git add ai-roleplay/src/lib/funnel-client.ts ai-roleplay/src/components/EmailGate.tsx
git commit -m "Add email-gate modal + funnel client glue for ai-roleplay"
```

---

## Task 7: Wire CTAs to open the gate (CharacterCard, detail page, ChatPreview)

**Files:**
- Modify: `ai-roleplay/src/components/CharacterCard.tsx`
- Modify: `ai-roleplay/src/app/[slug]/page.tsx`
- Modify: `ai-roleplay/src/components/ChatPreview.tsx`

The "Chat now" CTAs must open the modal (passing the character's chat slug) instead of deep-linking via `OutboundLink`. The chat slug = the last path segment of `character.chatUrl` (e.g. `draven-thorne-C6YywpVFVj`).

- [ ] **Step 1: Add a client gate-button component**

Create `ai-roleplay/src/components/ChatNowButton.tsx`:

```tsx
"use client";

import { useEmailGate } from "@/components/EmailGate";

/** Derives the chat slug from an ourdream.ai chat URL and opens the gate. */
export function ChatNowButton({
  chatUrl,
  className,
  children,
}: {
  chatUrl: string;
  className?: string;
  children: React.ReactNode;
}) {
  const { openGate } = useEmailGate();
  const slug = new URL(chatUrl).pathname.replace(/^\/chat\//, "");
  return (
    <button type="button" className={className} onClick={() => openGate(slug)}>
      {children}
    </button>
  );
}
```

- [ ] **Step 2: Swap the CTA in `CharacterCard.tsx`**

In `CharacterCard.tsx`: remove the `OutboundLink` import and its `ourdreamPath` line; import `ChatNowButton`; replace the primary `<OutboundLink …>Chat now →</OutboundLink>` block with:

```tsx
<ChatNowButton chatUrl={c.chatUrl} className="btn-primary w-full justify-center text-sm">
  Chat now&nbsp;&rarr;
</ChatNowButton>
```
Also update the internal detail links in this file: `/characters/${c.slug}` → `/${c.slug}` and `/characters/${c.slug}#chat-preview` → `/${c.slug}#chat-preview` (3 occurrences).

- [ ] **Step 3: Swap the CTA(s) in `[slug]/page.tsx`**

In the detail page, replace every primary "Chat now"/"Continue on ourdream" `OutboundLink` to the character's chat URL with `<ChatNowButton chatUrl={character.chatUrl} …>`. Keep non-CTA `OutboundLink`s (if any point elsewhere) as-is. Fix internal `/characters/...` links to the re-rooted paths.

- [ ] **Step 4: Swap the "continue" CTA in `ChatPreview.tsx`**

`ChatPreview` is the interactive CYOA. At the preview's end it has a continue-to-chat CTA. Replace that CTA's `OutboundLink`/anchor with `ChatNowButton` using the character's `chatUrl` (the component already receives the character or its chatUrl as a prop — pass it through; if it only has the slug, reconstruct `https://ourdream.ai/chat/<chatSlug>` from the prop it has). Verify by reading the file which prop carries the chat target.

- [ ] **Step 5: Typecheck + unit tests**

Run: `cd ai-roleplay && npx tsc --noEmit 2>&1 | head -20 && npx vitest run`
Expected: tsc clean except any remaining Task 8 out-of-scope links; vitest green.

- [ ] **Step 6: Commit**

```bash
git add -A ai-roleplay
git commit -m "Wire ai-roleplay Chat now CTAs to the email gate modal"
```

---

## Task 8: Remove out-of-scope cross-links and copy

**Files:**
- Modify: `ai-roleplay/src/app/page.tsx`
- Modify: any reused file still linking to removed routes

- [ ] **Step 1: Remove the "Or take a different path" section + academy/wizard links in `page.tsx`**

Delete the entire `<section>` that cross-promotes `/character-builder-academy` and `/prompt-studio` (the "Or take a different path" block), and the intro paragraph linking to `/character-builder-academy` and `/create` (the "Want to author your own world instead?" paragraph). Keep the disclaimer, headings, filters, banner, grid, and FAQ.

- [ ] **Step 2: Find any remaining links to removed routes**

Run: `cd ai-roleplay && grep -rn '/create\|/books\|/prompt-studio\|/prompt-library\|/character-builder-academy\|/about' src`
Expected after edits: no matches (or only inside comments). Remove/repoint any stragglers.

- [ ] **Step 3: Full typecheck, lint, build**

Run: `cd ai-roleplay && npx tsc --noEmit && npm run build`
Expected: `tsc` clean; `next build` succeeds and lists routes `/`, `/[slug]`, `/tag/[tag]` (shown with the `/ai-roleplay` basePath). No references to removed routes.

- [ ] **Step 4: Commit**

```bash
git add -A ai-roleplay
git commit -m "Trim out-of-scope cross-links from ai-roleplay catalogue"
```

---

## Task 9: Proxy rewrites + docs in the main repo

**Files:**
- Modify: `vercel.json` (main repo)
- Modify: `CLAUDE.md` (main repo)

- [ ] **Step 1: Add the Multi-Zones rewrites**

In `vercel.json`, add these two entries to the `rewrites` array (placeholder host replaced with the real zone deployment URL in Task 10):

```json
{ "source": "/ai-roleplay", "destination": "https://AI_ROLEPLAY_ZONE_URL/ai-roleplay" },
{ "source": "/ai-roleplay/:path*", "destination": "https://AI_ROLEPLAY_ZONE_URL/ai-roleplay/:path*" }
```

- [ ] **Step 2: Add the CLAUDE.md page row**

In the "Pages and their roles" table, add:

```
| `/ai-roleplay` | (separate Next.js zone — `ai-roleplay/`) | AI roleplay character catalogue + chat funnel | Yes |
```
Add a short note under the table: "`/ai-roleplay` is NOT a `public/*.html` page — it is a standalone Next.js app deployed as its own Vercel project and proxied in via the two rewrites above (Vercel Multi-Zones). Its email-gate modal reuses the same RedTrack/`getGlValue` funnel; CTAs redirect to `ourdream.ai/chat/<slug>` via RedTrack slot `/click/2`."

- [ ] **Step 3: Commit**

```bash
cd "/Users/jaidynl/GitHub Coding Projects/ourdreamnetwork"
git add vercel.json CLAUDE.md
git commit -m "Proxy /ai-roleplay zone via vercel rewrites; document in CLAUDE.md"
```

---

## Task 10: Deploy the zone, wire the real URL, and smoke-test

**Files:**
- Modify: `vercel.json` (real zone URL)
- External: RedTrack dashboard, Vercel projects

- [ ] **Step 1: Create + deploy the zone Vercel project**

From `ai-roleplay/`, create a NEW Vercel project (root directory = `ai-roleplay`) and deploy a preview:
```bash
cd "/Users/jaidynl/GitHub Coding Projects/ourdreamnetwork/ai-roleplay"
npx vercel deploy
```
Note the resulting deployment/production URL (e.g. `ai-roleplay-xxxx.vercel.app`). Confirm `https://<that-url>/ai-roleplay` renders the catalogue directly.

- [ ] **Step 2: Put the real zone URL into the main `vercel.json`**

Replace `AI_ROLEPLAY_ZONE_URL` (both rewrites) with the zone's stable production domain. Commit:
```bash
git add vercel.json && git commit -m "Point /ai-roleplay rewrites at the deployed zone URL"
```

- [ ] **Step 3: Deploy the main project to a preview and smoke-test the proxy**

Deploy the main project to a preview; verify `<preview>/ai-roleplay` serves the catalogue, `<preview>/ai-roleplay/<slug>` serves a detail page, and `_next` assets load (no 404s in the network tab). Verify existing pages still work: `<preview>/`, `<preview>/login`, `<preview>/top-sites`.

- [ ] **Step 4: Verify the email-gate funnel end-to-end**

In incognito with a simulated paid click (URL containing `?cmpid=...` so RedTrack sets `rtkclickid-store`):
1. Click "Chat now" → modal "Free Trial Offer — Enter Your Email To Get 5 messages free" appears.
2. Submit a test email → network shows POST `/api/save-email` (200) AND navigation to `clk.ourdreamnetwork.com/click/2?...sub11=ai-roleplay&sub12=<slug>...&_gl=1*...` — confirm `_gl` is a real value, NOT `undefined`.
3. Without a cookie (plain incognito, no `cmpid`): submit → navigation goes direct to `https://ourdream.ai/chat/<slug>?...&_gl=1*...` (decorated).

- [ ] **Step 5: Configure the RedTrack `/click/2` slot (external dependency)**

In the RedTrack dashboard, configure click slot `2`'s destination to forward to the per-character chat URL using the sub macros:
```
https://ourdream.ai/chat/{sub12}?clickid={clickid}&tracker=rt&_gl={sub19}
```
Confirm a live paid click lands on the correct `ourdream.ai/chat/<slug>` page with `clickid` + `_gl` present. (Until this is set, the organic path still works; the paid path won't attribute correctly.)

- [ ] **Step 6: Verify image freshness**

Spot-check 5–10 character card images on the deployed page. If any 404 (expired `img.ourdream.ai` signatures), refresh those `imageUrl`s in `ai-roleplay/src/data/characters.ts` from a current ourdream.ai source and redeploy.

- [ ] **Step 7: Final commit (if data/url edits were needed)**

```bash
git add -A && git commit -m "Refresh ai-roleplay character image URLs"  # only if needed
```

---

## Notes for the implementer

- **CLAUDE.md compliance:** `_gl` is always read via `getGlValue()` (never the URL); the organic branch is always implemented; the redirect never awaits `saveEmail`; `quiz_email_captured` + `quiz_redirect` fire with `source: 'ai-roleplay'`.
- **basePath gotchas:** `next/link` and `next/image` are basePath-aware (don't hardcode `/ai-roleplay`); raw `<img src>`, `fetch()`, and `window.location.href` are NOT (use absolute paths — `fetch('/api/save-email')` correctly hits the main domain's function through the proxy).
- **Do not touch** the main repo's `public/*.html`, `/` quiz funnel, or `/api/save-email.js` beyond confirming the save accepts `mode: 'ai-roleplay'` (read `api/save-email.js`; if it allowlists modes, add `ai-roleplay`).
