function trimTrailingSlash(s: string): string {
  return s.replace(/\/$/, "");
}

/**
 * When `NEXT_PUBLIC_SITE_URL` or `CF_PAGES_URL` is set, static data should be loaded
 * from that origin. Otherwise callers may fall back to `public/data` on disk.
 */
export function getHostedDataOriginPrefix(): string | null {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (explicit) return trimTrailingSlash(explicit);

  const pages = process.env.CF_PAGES_URL?.trim();
  if (pages) return trimTrailingSlash(pages);

  return null;
}

/**
 * Canonical public origin (metadata, OG tags, same-origin fetch fallbacks).
 *
 * - Prefer `NEXT_PUBLIC_SITE_URL` in production (no trailing slash).
 * - On Cloudflare Pages, `CF_PAGES_URL` is available when unset.
 * - Last resort: OpenNext / Wrangler local preview on port 8787.
 */
export function getCanonicalSiteOrigin(): string {
  return getHostedDataOriginPrefix() ?? "http://localhost:8787";
}

/** Both must be set for the Umami snippet to render. */
export function getUmamiConfig():
  | { scriptSrc: string; websiteId: string }
  | null {
  const scriptSrc = process.env.NEXT_PUBLIC_UMAMI_SCRIPT_URL?.trim();
  const websiteId = process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID?.trim();
  if (!scriptSrc || !websiteId) return null;
  return { scriptSrc, websiteId };
}
