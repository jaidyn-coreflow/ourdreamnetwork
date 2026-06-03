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
