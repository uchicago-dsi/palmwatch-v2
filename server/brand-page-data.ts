import brands from "@/config/brands";
import type { BrandSchema } from "@/config/brands/types";
import type { BrandPrecomputedPayload } from "@/domain/schemas/brand-precomputed";
import { precomputedSlug } from "@/lib/precomputed-slug";
import cmsClient from "@/sanity/lib/client";
import { loadBrandPrecomputedPayload } from "@/server/brand-precomputed-data";

export interface BrandPageModel {
  brand: string;
  brandInfo: BrandSchema;
  brandPre: BrandPrecomputedPayload;
}

/**
 * Loads Sanity brand profile and validated precomputed stats for the brand route.
 */
export async function loadBrandPageModel(
  brand: string
): Promise<
  | { ok: true; model: BrandPageModel }
  | { ok: false; reason: "precomputed" | "brandInfo" }
> {
  const slug = precomputedSlug(brand);
  const [brandPre, cmsBrand] = await Promise.all([
    loadBrandPrecomputedPayload(slug),
    cmsClient.getBrandInfo(brand),
  ]);
  if (!brandPre) {
    return { ok: false, reason: "precomputed" };
  }
  const brandInfo = (cmsBrand || brands[brand]) as BrandSchema | undefined;
  if (!brandInfo) {
    return { ok: false, reason: "brandInfo" };
  }
  return { ok: true, model: { brand, brandPre, brandInfo } };
}
