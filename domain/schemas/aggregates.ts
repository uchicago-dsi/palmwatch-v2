import { z } from "zod";

/** `aggregates/mill-summary-stats.json` (brands + mills list pages). */
export const millSummaryStatsPayloadSchema = z
  .object({
    timeseries: z.array(z.record(z.unknown())),
    totalForestArea: z.number(),
    totalForestLoss: z.number(),
    totalArea: z.number(),
    brandCount: z.number().nullable(),
    companyCount: z.number().nullable(),
    countryCount: z.number().nullable(),
    groupCount: z.number().nullable(),
    millCount: z.number().nullable(),
    rspoCertified: z.number(),
    notRspoCertified: z.number(),
  })
  .passthrough();

export type MillSummaryStatsPayload = z.infer<
  typeof millSummaryStatsPayloadSchema
>;

/** `aggregates/countries-summary.json`. */
export const countriesSummaryPayloadSchema = z.object({
  countryStats: z.array(z.record(z.unknown())),
});

export type CountriesSummaryPayload = z.infer<
  typeof countriesSummaryPayloadSchema
>;

/** `aggregates/ranking-brands.json`. */
export const rankingBrandsPayloadSchema = z.array(z.record(z.unknown()));

/** `aggregates/median-mill.json` — array of one row of medians per year keys. */
export const medianMillPayloadSchema = z.array(
  z.record(z.string(), z.number())
);
