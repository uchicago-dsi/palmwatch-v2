import path from "node:path";
import { headers } from "next/headers";
import { getHostedDataOriginPrefix } from "@/lib/public-site";

/**
 * Where Arquero should load `.arrow` files from.
 * Cloudflare Workers have no repo filesystem; use same-origin `/data/...` URLs.
 * During `next build` SSG there is often no request — fall back to `public/data` on disk.
 */
export async function resolveMillDataBase(req?: Request): Promise<string> {
  if (req?.url) {
    try {
      return `${new URL(req.url).origin}/data`;
    } catch {
      /* ignore */
    }
  }

  // Avoid `headers()` during `next build` static generation (keeps SSG routes static).
  if (process.env.NEXT_PHASE === "phase-production-build") {
    return path.join(process.cwd(), "public", "data");
  }

  try {
    const h = await headers();
    const host = h.get("x-forwarded-host") ?? h.get("host");
    if (host) {
      const proto = h.get("x-forwarded-proto") ?? "http";
      return `${proto}://${host}/data`;
    }
  } catch {
    /* non-request context */
  }

  const hosted = getHostedDataOriginPrefix();
  if (hosted) return `${hosted}/data`;

  return path.join(process.cwd(), "public", "data");
}
