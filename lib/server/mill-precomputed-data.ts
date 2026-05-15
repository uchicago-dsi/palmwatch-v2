import type { BrandData, UmlData } from "@/domain";
import { millPrecomputedEnvelopeSchema } from "@/domain/schemas/mill-precomputed";
import { loadPrecomputedParsed } from "@/lib/server/load-precomputed-parsed";

export type MillPrecomputedPayload = {
  info: UmlData[];
  brands: BrandData;
};

/** Loads and validates mill precomputed JSON envelope. Returns `null` when invalid or missing. */
export async function loadMillPrecomputedPayload(
  relativePath: string,
  req?: Request
): Promise<MillPrecomputedPayload | null> {
  const r = await loadPrecomputedParsed(
    relativePath,
    millPrecomputedEnvelopeSchema,
    req
  );
  if (!r.ok) {
    return null;
  }
  return {
    info: r.data.info as UmlData[],
    brands: r.data.brands as BrandData,
  };
}
