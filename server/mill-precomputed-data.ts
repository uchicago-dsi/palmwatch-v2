import type { BrandData, UmlData } from "@/domain";
import { millPrecomputedEnvelopeSchema } from "@/domain/schemas/mill-precomputed";
import { loadPrecomputedParsed } from "@/server/load-precomputed-parsed";

export interface MillPrecomputedPayload {
  brands: BrandData;
  info: UmlData[];
}

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
