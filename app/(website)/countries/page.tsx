import pageStyles from "@/components/page-layout.module.css";
import {
  buildCountryDirectoryModel,
  CountriesClient,
} from "@/features/countries-directory";
import {
  loadCountriesSummary,
  loadMillSummaryStats,
} from "@/server/aggregates-data";

export const revalidate = 60;

export default async function Page() {
  const [countriesSummary, millStats] = await Promise.all([
    loadCountriesSummary(),
    loadMillSummaryStats(),
  ]);

  if (!countriesSummary) {
    return (
      <main className={pageStyles.pageShell}>
        <div className={pageStyles.pageInner}>
          <p>Could not load countries summary. Please try again later.</p>
        </div>
      </main>
    );
  }

  const { rows, stats } = buildCountryDirectoryModel(
    countriesSummary.countryStats,
    millStats?.totalForestLoss
  );

  return (
    <main className={pageStyles.pageShell}>
      <div className={pageStyles.pageInner}>
        <CountriesClient rows={rows} stats={stats} />
      </div>
    </main>
  );
}
