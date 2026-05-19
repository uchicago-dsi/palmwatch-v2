import type {
  CountriesSummaryPayload,
  MillSummaryStatsPayload,
  RankingBrandRow,
} from "@/domain/schemas/aggregates";
import {
  countriesSummaryPayloadSchema,
  millSummaryStatsPayloadSchema,
  rankingBrandsPayloadSchema,
} from "@/domain/schemas/aggregates";
import { loadPrecomputedParsed } from "@/server/load-precomputed-parsed";

export async function loadMillSummaryStats(
  req?: Request
): Promise<MillSummaryStatsPayload | null> {
  const r = await loadPrecomputedParsed(
    "aggregates/mill-summary-stats.json",
    millSummaryStatsPayloadSchema,
    req
  );
  return r.ok ? r.data : null;
}

export async function loadCountriesSummary(
  req?: Request
): Promise<CountriesSummaryPayload | null> {
  const r = await loadPrecomputedParsed(
    "aggregates/countries-summary.json",
    countriesSummaryPayloadSchema,
    req
  );
  return r.ok ? r.data : null;
}

export async function loadRankingBrands(
  req?: Request
): Promise<RankingBrandRow[] | null> {
  const r = await loadPrecomputedParsed(
    "aggregates/ranking-brands.json",
    rankingBrandsPayloadSchema,
    req
  );
  return r.ok ? r.data : null;
}
