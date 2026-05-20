import { z } from "zod";

export const forestLossYearPointSchema = z.object({
  year: z.number(),
  annualKm2: z.number(),
  cumulativeKm2: z.number(),
});

export type ForestLossYearPoint = z.infer<typeof forestLossYearPointSchema>;

/** `aggregates/mill-summary-stats.json` (brands + mills list pages). */
export const millSummaryStatsPayloadSchema = z
  .object({
    timeseries: z.array(z.record(z.unknown())),
    forestLossByYear: z.array(forestLossYearPointSchema).optional(),
    totalForestArea: z.number().nullable(),
    totalForestLoss: z.number().nullable(),
    totalArea: z.number().nullable(),
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

const countryStatRowSchema = z
  .object({
    Country: z.string(),
    count: z.number(),
    pctForestLoss: z.number().nullable(),
    pastRisk: z.number(),
    currentRisk: z.number(),
    futureRisk: z.number(),
  })
  .passthrough();

export type CountryStatRow = z.infer<typeof countryStatRowSchema>;

/** `aggregates/countries-summary.json`. */
export const countriesSummaryPayloadSchema = z.object({
  countryStats: z.array(countryStatRowSchema),
});

export type CountriesSummaryPayload = z.infer<
  typeof countriesSummaryPayloadSchema
>;

const rankingBrandRowSchema = z.object({
  consumer_brand: z.string(),
  averageCurrentRisk: z.number(),
  averageFutureRisk: z.number(),
  averagePastRisk: z.number(),
  totalForestLoss: z.number().nullable(),
  millCount: z.number(),
});

export type RankingBrandRow = z.infer<typeof rankingBrandRowSchema>;

/** `aggregates/ranking-brands.json`. */
export const rankingBrandsPayloadSchema = z.array(rankingBrandRowSchema);

/** `aggregates/median-mill.json` — array of one row of medians per year keys. */
export const medianMillPayloadSchema = z.array(
  z.record(z.string(), z.number())
);
