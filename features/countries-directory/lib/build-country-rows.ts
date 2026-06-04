import { maxYear } from "@/config/years";
import type { CountryStatRow } from "@/domain/schemas/aggregates";
import type { CountryRow } from "../countries-directory-view";

/** ISO 3166-1 numeric codes (as stored in world-atlas 110m topology). */
export const NAME_TO_ISO: Record<string, string> = {
  Indonesia: "360",
  Malaysia: "458",
  Colombia: "170",
  Thailand: "764",
  Ecuador: "218",
  Guatemala: "320",
  "Papua New Guinea": "598",
  "Côte d'Ivoire": "384",
  Mexico: "484",
  Brazil: "076",
  Honduras: "340",
  Peru: "604",
  Cameroon: "120",
  Ghana: "288",
  India: "356",
  "Costa Rica": "188",
  Nigeria: "566",
  Philippines: "608",
  "Democratic Republic of the Congo": "180",
  Panama: "591",
  Nicaragua: "558",
  Liberia: "430",
  Gabon: "266",
  Venezuela: "862",
  Cambodia: "116",
  "Dominican Republic": "214",
  "Sri Lanka": "144",
  "Sierra Leone": "694",
  Uganda: "800",
  Myanmar: "104",
  "Solomon Islands": "090",
  Madagascar: "450",
  "Sao Tome and Principe": "",
};

export function fmtKm2(v: number): string {
  if (v >= 1_000_000) {
    return `${(v / 1_000_000).toFixed(1)}M km²`;
  }
  if (v >= 1000) {
    return `${Math.round(v / 1000).toLocaleString()}K km²`;
  }
  return `${Math.round(v).toLocaleString()} km²`;
}

export interface CountryDirectoryStat {
  label: string;
  value: string;
}

export interface CountryDirectoryModel {
  rows: CountryRow[];
  stats: CountryDirectoryStat[];
}

export function buildCountryDirectoryModel(
  countryStats: CountryStatRow[],
  totalForestLoss: number | null | undefined
): CountryDirectoryModel {
  const seen = new Set<string>();
  const rows: CountryRow[] = [];
  let totalMills = 0;

  for (const raw of countryStats) {
    const name = raw.Country.trim();
    if (!name || seen.has(name)) {
      continue;
    }
    seen.add(name);

    const count = raw.count ?? 0;
    const pctForestLoss = raw.pctForestLoss ?? 0;
    const score = raw.currentRisk ?? 0;
    const pastRisk = raw.pastRisk ?? 0;
    const currentRisk = raw.currentRisk ?? 0;
    const futureRisk = raw.futureRisk ?? 0;

    totalMills += count;

    rows.push({
      name,
      href: `/country/${encodeURIComponent(name)}`,
      isoCode: NAME_TO_ISO[name] ?? "",
      count,
      pctForestLoss,
      score,
      pastRisk,
      currentRisk,
      futureRisk,
    });
  }

  const stats: CountryDirectoryStat[] = [
    { label: "Countries", value: rows.length.toLocaleString() },
    { label: "Total mills", value: totalMills.toLocaleString() },
    {
      label: `Global forest loss (2001–${maxYear})`,
      value: totalForestLoss == null ? "—" : fmtKm2(totalForestLoss),
    },
  ];

  return { rows, stats };
}
