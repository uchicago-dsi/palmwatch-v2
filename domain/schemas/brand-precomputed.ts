import { z } from "zod";

/** `brand/<slug>.json` — stats required; other keys used by `/api/brand/*`. */
export const brandPrecomputedPayloadSchema = z
  .object({
    brandStats: z.object({
      averageCurrentRisk: z.number(),
      uniqueMills: z.number(),
      uniqueCountries: z.number(),
      uniqueOwners: z.number(),
      uniqueGroups: z.number(),
    }),
    umlInfo: z.array(z.record(z.unknown())).optional(),
    timeseries: z.array(z.record(z.unknown())).optional(),
    owners: z.array(z.record(z.unknown())).optional(),
  })
  .passthrough();

export type BrandPrecomputedPayload = z.infer<
  typeof brandPrecomputedPayloadSchema
>;
