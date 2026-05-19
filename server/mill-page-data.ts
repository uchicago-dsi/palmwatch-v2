import type { BrandSchema } from "@/config/brands/types";
import { precomputedSlug } from "@/lib/precomputed-slug";
import cmsClient from "@/sanity/lib/client";
import { loadMedianMill } from "@/server/median-mill-data";
import type { MillPrecomputedPayload } from "@/server/mill-precomputed-data";
import { loadMillPrecomputedPayload } from "@/server/mill-precomputed-data";

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
