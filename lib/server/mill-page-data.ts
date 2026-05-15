import type { BrandSchema } from "@/config/brands/types";
import { precomputedSlug } from "@/lib/precomputed-slug";
import { loadMedianMill } from "@/lib/server/median-mill-data";
import type { MillPrecomputedPayload } from "@/lib/server/mill-precomputed-data";
import { loadMillPrecomputedPayload } from "@/lib/server/mill-precomputed-data";
import cmsClient from "@/sanity/lib/client";

export type MillPageModel = {
  uml: string;
  millPayload: MillPrecomputedPayload;
  medianMill: Record<string, number>[] | null;
  millContent: Partial<BrandSchema> | undefined;
};

/**
 * Loads validated mill JSON, aggregate medians, and optional Sanity UML profile.
 */
export async function loadMillPageModel(
  uml: string
): Promise<MillPageModel | null> {
  const slug = precomputedSlug(uml);
  const [millPayload, medianMill, millContent] = await Promise.all([
    loadMillPrecomputedPayload(`mill/${slug}.json`),
    loadMedianMill(),
    cmsClient.getUmlInfo(uml),
  ]);
  if (!millPayload) {
    return null;
  }
  return { uml, millPayload, medianMill, millContent };
}
