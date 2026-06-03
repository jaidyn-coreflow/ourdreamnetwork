/**
 * Baseline security headers applied to every route.
 *
 * Notes:
 *   - We deliberately omit a strict CSP for now. The site embeds remote
 *     character images from img.ourdream.ai and inlines a small JSON-LD
 *     <script>; tightening CSP needs a coordinated audit. Track in PR-N.
 *   - `unsafe-url` referrer is required so ourdream.ai sees the full
 *     romantasyai URL (preserves last-touch attribution + click metadata).
 *   - `strict-origin-when-cross-origin` is the modern safer default but
 *     would break our affiliate referrer signal. Keep `unsafe-url`.
 */
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Referrer-Policy", value: "unsafe-url" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
  },
  /* Opt out of FLoC / Topics for ad-tech hygiene. */
  { key: "X-DNS-Prefetch-Control", value: "on" },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  images: {
    /* Character + chat-preview imagery is hosted on ourdream.ai's CDN.
     * Whitelisting the host enables next/image's optimizer pipeline
     * (resize, srcset, AVIF/WebP, lazy-load) so phones don't download
     * 512x512 sources sized for desktop. */
    remotePatterns: [
      { protocol: "https", hostname: "img.ourdream.ai" },
    ],
  },

  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "romantasyai.com" }],
        destination: "https://www.romantasyai.com/:path*",
        permanent: true,
      },
    ];
  },

  async headers() {
    return [
      {
        /* Apply to every route, including /_next/* and /og.png. */
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

module.exports = nextConfig;
