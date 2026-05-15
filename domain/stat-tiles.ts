import { maxYear } from "@/config/years";

export type StatTile = {
  title: string;
  stat: string;
  className: string;
  description?: string;
};

const usFormatter = new Intl.NumberFormat("en-US", {});

/** Stat tiles for a single mill (forest loss + risk scores). */
export function buildMillRiskStatTiles(
  latestYearForestLossKm2: number | string | null,
  currentRisk: number | string | null,
  pastRisk: number | string | null,
  futureRisk: number | string | null
): StatTile[] {
  const stats: StatTile[] = [];
  if (latestYearForestLossKm2 !== null) {
    stats.push({
      title: `Forest Loss KM2 (${maxYear})`,
      stat: usFormatter.format(+latestYearForestLossKm2),
      className: "text-error",
    });
  }
  if (currentRisk !== null) {
    stats.push({
      title: "Recent Deforestation Score",
      stat: usFormatter.format(+currentRisk),
      className: "text-error",
    });
  }
  if (pastRisk !== null) {
    stats.push({
      title: "Past Deforestation Score",
      stat: usFormatter.format(+pastRisk),
      className: "text-error",
    });
  }
  if (futureRisk !== null) {
    stats.push({
      title: "Future Deforestation Score",
      stat: usFormatter.format(+futureRisk),
      className: "text-error",
    });
  }
  return stats;
}

/** Stat tiles for group / owner / bbox rollups (shared layout). */
export function buildRollupEntityStatTiles(
  uniqueMills: number | string | null,
  uniqueCountries: number | string | null,
  averageCurrentRisk: number | string | null,
  totalForestLoss: number | string | null
): StatTile[] {
  const stats: StatTile[] = [];
  if (uniqueMills !== null) {
    stats.push({
      title: "Mills",
      stat: usFormatter.format(+uniqueMills),
      className: "text-error",
    });
  }
  if (uniqueCountries !== null) {
    stats.push({
      title: "Countries",
      stat: usFormatter.format(+uniqueCountries),
      className: "text-error",
    });
  }
  if (averageCurrentRisk !== null) {
    stats.push({
      title: "Average Recent Deforestation Score",
      stat: usFormatter.format(+averageCurrentRisk),
      className: "text-error",
    });
  }
  if (totalForestLoss !== null) {
    stats.push({
      title: "Total Forest Loss (km2)",
      stat: usFormatter.format(+totalForestLoss),
      className: "text-error",
    });
  }
  return stats;
}

/** Stat tiles for country profile rollups. */
export function buildCountryRollupStatTiles(
  uniqueMills: number | string | null,
  averageCurrentRisk: number | string | null,
  totalForestLoss: number | string | null
): StatTile[] {
  const stats: StatTile[] = [];
  if (uniqueMills !== null) {
    stats.push({
      title: "Mills",
      stat: usFormatter.format(+uniqueMills),
      className: "text-error",
    });
  }
  if (averageCurrentRisk !== null) {
    stats.push({
      title: "Average Recent Deforestation Score",
      stat: usFormatter.format(+averageCurrentRisk),
      className: "text-error",
    });
  }
  if (totalForestLoss !== null) {
    stats.push({
      title: "Total Forest Loss (km2)",
      stat: usFormatter.format(+totalForestLoss),
      className: "text-error",
    });
  }
  return stats;
}

/** Stat tiles for brand profile rollups. */
export function buildBrandRollupStatTiles(
  averageCurrentRisk: number | null,
  uniqueMills: number | null,
  uniqueCountries: number | null,
  uniqueOwners: number | null,
  uniqueGroups: number | null
): StatTile[] {
  const stats: StatTile[] = [];
  if (averageCurrentRisk !== null) {
    stats.push({
      title: "Average Recent Deforestation Score",
      stat: usFormatter.format(averageCurrentRisk),
      className: "text-error",
      description: `Mean Recent Deforestation Score of mills used by this brand (2020-${maxYear})`,
    });
  }
  if (uniqueMills !== null) {
    stats.push({
      title: "Mills",
      stat: usFormatter.format(uniqueMills),
      className: "text-error",
    });
  }
  if (uniqueCountries !== null) {
    stats.push({
      title: "Countries",
      stat: usFormatter.format(uniqueCountries),
      className: "text-error",
    });
  }
  if (uniqueOwners !== null) {
    stats.push({
      title: "Mill Owners",
      stat: usFormatter.format(uniqueOwners),
      className: "text-error",
    });
  }
  if (uniqueGroups !== null) {
    stats.push({
      title: "Mill Groups",
      stat: usFormatter.format(uniqueGroups),
      className: "text-error",
    });
  }
  return stats;
}
