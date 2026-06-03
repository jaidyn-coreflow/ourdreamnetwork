/**
 * Dynamic robots.txt — honours NOINDEX env var for non-prod.
 * No new dependencies required (Next.js route handler).
 */
export async function GET() {
  const noindex = process.env.NOINDEX === "true";
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.romantasyai.com";

  const body = noindex
    ? "User-agent: *\nDisallow: /\n"
    : [
        "User-agent: *",
        "Allow: /",
        "",
        `Sitemap: ${siteUrl}/sitemap.xml`,
        "",
      ].join("\n");

  return new Response(body, {
    status: 200,
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
