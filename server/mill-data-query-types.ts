import type { UmlData } from "@/domain";
import type { BrandUsageRow } from "@/domain/brand-usage";
import type {
  CountryStatRow,
  ForestLossYearPoint,
} from "@/domain/schemas/aggregates";
import type { LossTimeseriesRow } from "@/lib/rename-output-columns";

export type { CompanyData } from "@/domain";
export type { RankingBrandRow } from "@/domain/schemas/aggregates";
export type { SearchListPayload } from "@/domain/search-list";

export interface MillSummaryStats {
  averageCurrentRisk: number;
  uniqueCountries: number;
  uniqueGroups: number;
  uniqueMills: number;
  uniqueOwners: number;
}

export interface BrandOwnerRollup {
  Country: string;
  count: number;
  "Parent Company": string;
}

export interface OwnerBrandRollup {
  consumer_brand: string;
  count: number;
}

export interface BrandInfoPayload {
  owners: BrandOwnerRollup[];
  timeseries: LossTimeseriesRow[];
  umlInfo: UmlData[];
}

export interface OwnerInfoPayload {
  brands: OwnerBrandRollup[];
  timeseries: LossTimeseriesRow[];
  umlInfo: UmlData[];
}

export interface GroupInfoPayload {
  timeseries: LossTimeseriesRow[];
  umlInfo: UmlData[];
}

export interface RollupEntityPayload extends MillSummaryStats {
  brandUsage: BrandUsageRow[];
  mills: UmlData[];
  timeseries: LossTimeseriesRow[];
  totalForestLoss: number;
}

export interface UniqueCounts {
  brandCount: number | null;
  companyCount: number | null;
  countryCount: number | null;
  groupCount: number | null;
  millCount: number | null;
}

export interface MillRollupTotals {
  count: number;
  totalArea: number;
  totalForestArea: number;
  totalForestLoss: number;
}

/** `aggregates/mill-summary-stats.json` shape from `getMillSummaryStats()`. */
export interface MillSummaryStatsPayload
  extends MillRollupTotals,
    UniqueCounts {
  forestLossByYear: ForestLossYearPoint[];
  notRspoCertified: number;
  rspoCertified: number;
  timeseries: LossTimeseriesRow[];
}

export interface CountriesSummaryPayload {
  countryStats: CountryStatRow[];
}

/** `aggregates/median-mill.json` — one row of per-year median treeloss keys. */
export type MedianMillRow = Record<string, number>;
