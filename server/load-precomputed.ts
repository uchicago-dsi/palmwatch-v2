import { readFile } from "node:fs/promises";
import path from "node:path";
import { headers } from "next/headers";
import { getCanonicalSiteOrigin } from "@/server/site";

const PRECOMPUTED_PREFIX = "/data/precomputed";

function precomputedFilePath(clean: string): string {
  return path.join(process.cwd(), "public", "data", "precomputed", clean);
}

/**
 * Cloudflare Workers + `global_fetch_strictly_public` block loopback `fetch()` to the
 * same origin. Precomputed JSON lives under static assets — use the ASSETS binding when present.
 */
async function tryLoadPrecomputedFromAssetsBinding<T>(
  clean: string
): Promise<T | null> {
  try {
    const { getCloudflareContext } = await import("@opennextjs/cloudflare");
    const { env } = await getCloudflareContext({ async: true });
    const assets = (env as { ASSETS?: { fetch: typeof fetch } }).ASSETS;
    if (!assets) {
      return null;
    }
    const url = new URL(
      `${PRECOMPUTED_PREFIX}/${clean}`,
      "https://assets.local"
    );
    const res = await assets.fetch(new Request(url));
    if (!res.ok) {
      await res.body?.cancel?.().catch(() => {});
      return null;
    }
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

async function tryReadPrecomputedFromPublicDir<T>(
  clean: string
): Promise<T | null> {
  try {
    const raw = await readFile(precomputedFilePath(clean), "utf8");
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

/**
 * Load a JSON file from `public/data/precomputed/*` without Arquero.
 * - During `next build` static phase: read from disk.
 * - On Cloudflare Workers: prefer ASSETS binding (avoids blocked loopback fetch).
 * - Else: read from repo `public/` when available, then same-origin HTTP fetch.
 */
export async function loadPrecomputedJson<T>(
  relativePath: string,
  req?: Request
): Promise<T> {
  const clean = relativePath.replace(/^\/+/, "");

  if (process.env.NEXT_PHASE === "phase-production-build") {
    const raw = await readFile(precomputedFilePath(clean), "utf8");
    return JSON.parse(raw) as T;
  }

  const fromAssets = await tryLoadPrecomputedFromAssetsBinding<T>(clean);
  if (fromAssets !== null) {
    return fromAssets;
  }

  const fromDisk = await tryReadPrecomputedFromPublicDir<T>(clean);
  if (fromDisk !== null) {
    return fromDisk;
  }

  let origin: string;
  if (req?.url) {
    origin = new URL(req.url).origin;
  } else {
    try {
      const h = await headers();
      const host = h.get("x-forwarded-host") ?? h.get("host");
      if (host) {
        const proto = h.get("x-forwarded-proto") ?? "http";
        origin = `${proto}://${host}`;
      } else {
        origin = "";
      }
    } catch {
      origin = "";
    }
    if (!origin) {
      origin = getCanonicalSiteOrigin();
    }
  }

  const url = `${origin}${PRECOMPUTED_PREFIX}/${clean}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`precomputed fetch failed ${res.status}: ${url}`);
  }
  return (await res.json()) as T;
}
