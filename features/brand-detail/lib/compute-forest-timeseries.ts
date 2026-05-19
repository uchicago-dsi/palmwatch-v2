import { maxYear } from "@/config/years";
import type { BrandPrecomputedPayload } from "@/domain/schemas/brand-precomputed";
import type { AnnualLossPoint } from "../types";

const CHART_START_YEAR = 2001;

export function computeForestTimeseries(
  umlInfo: NonNullable<BrandPrecomputedPayload["umlInfo"]>
): AnnualLossPoint[] {
  const years: number[] = [];
  for (let y = CHART_START_YEAR; y <= maxYear; y++) {
    years.push(y);
  }
  return years.map((year) => {
    const annual = umlInfo.reduce(
      (sum, mill) => sum + (Number(mill[`treeloss_km_${year}`]) || 0),
      0
    );
    return { year, annualKm2: Math.round(annual) };
  });
}
