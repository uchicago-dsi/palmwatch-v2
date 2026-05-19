import type { BrandPrecomputedPayload } from "@/domain/schemas/brand-precomputed";
import { brandPrecomputedPayloadSchema } from "@/domain/schemas/brand-precomputed";
import { loadPrecomputedParsed } from "@/server/load-precomputed-parsed";

export async function loadBrandPrecomputedPayload(
  slug: string,
  req?: Request
): Promise<BrandPrecomputedPayload | null> {
  const r = await loadPrecomputedParsed(
    `brand/${slug}.json`,
    brandPrecomputedPayloadSchema,
    req
  );
  return r.ok ? r.data : null;
}
