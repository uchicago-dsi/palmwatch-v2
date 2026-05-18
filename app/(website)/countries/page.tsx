import pageStyles from "@/components/page-layout.module.css";
import { loadCountriesSummary } from "@/lib/server/aggregates-data";
import { CountriesClient, type CountryRow } from "./countries-client";

export const revalidate = 60;

// ISO 3166-1 numeric codes (as stored in world-atlas 110m topology)
const NAME_TO_ISO: Record<string, string> = {
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
  "Sao Tome and Principe": "", // too small for 110m topology
};

export default async function Page() {
  const countriesSummary = await loadCountriesSummary();

  if (!countriesSummary) {
    return (
      <main className={pageStyles.pageShell}>
        <div className={pageStyles.pageInner}>
          <p>Could not load countries summary. Please try again later.</p>
        </div>
      </main>
    );
  }

  const { countryStats } = countriesSummary;

  // Normalize and deduplicate rows (data has some entries with leading/trailing spaces)
  const seen = new Set<string>();
  const rows: CountryRow[] = [];
  let totalMills = 0;

  for (const raw of countryStats as Array<Record<string, unknown>>) {
    const name = (raw.Country as string)?.trim() ?? "";
    if (!name || seen.has(name)) {
      continue;
    }
    seen.add(name);

    const count = (raw.count as number) ?? 0;
    const pctForestLoss = (raw.pctForestLoss as number) ?? 0;
    const score = (raw.currentRisk as number) ?? 0;

    totalMills += count;

    rows.push({
      name,
      href: `/country/${name}`,
      isoCode: NAME_TO_ISO[name] ?? "",
      count,
      pctForestLoss,
      score,
    });
  }

  const topCountry = [...rows].sort((a, b) => b.count - a.count)[0];
  const avgForestLoss =
    rows.reduce((s, r) => s + r.pctForestLoss, 0) / rows.length;

  const stats = [
    { label: "Countries", value: rows.length.toLocaleString() },
    { label: "Total mills", value: totalMills.toLocaleString() },
    { label: "Top country", value: topCountry?.name ?? "—", text: true },
    {
      label: "Avg forest loss (2017–2025)",
      value: `${Math.round(avgForestLoss)}%`,
    },
  ];

  return (
    <main className={pageStyles.pageShell}>
      <div className={pageStyles.pageInner}>
        <CountriesClient rows={rows} stats={stats} />
      </div>
    </main>
  );
}
