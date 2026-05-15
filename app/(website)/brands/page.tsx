import { InfoTable } from "@/components/info-table";
import pageStyles from "@/components/page-layout.module.css";
import { StatsBlock } from "@/components/stats-block";
import { emptySearchListPayload } from "@/domain";
import { SearchableListLayout } from "@/features/searchable-list";
import {
  loadMillSummaryStats,
  loadRankingBrands,
} from "@/lib/server/aggregates-data";
import { loadSearchListPayload } from "@/lib/server/search-list-data";
import cmsClient from "@/sanity/lib/client";
import { PortableText } from "@/sanity/lib/components";
import { getStatConfig } from "./pageConfig";

export const revalidate = 60;

export default async function Page() {
  const [searchListRaw, millStats, rankingBrands, landingPageContent] =
    await Promise.all([
      loadSearchListPayload(),
      loadMillSummaryStats(),
      loadRankingBrands(),
      cmsClient.getLandingPageContent("brands"),
    ]);

  const searchList = searchListRaw ?? emptySearchListPayload;
  const options = searchList.Brands;
  if (!millStats) {
    return (
      <main className={pageStyles.pageShell}>
        <div className={pageStyles.pageInner}>
          <p>Could not load aggregate statistics. Please try again later.</p>
        </div>
      </main>
    );
  }
  const { brandCount, companyCount, countryCount, millCount, groupCount } =
    millStats;
  const statConfig = getStatConfig(
    brandCount,
    countryCount,
    millCount,
    companyCount
  );
  const rankedTable = rankingBrands ?? [];

  return (
    <main className={pageStyles.pageShell}>
      <div className={pageStyles.pageInner}>
        <section className="prose flex max-w-none flex-col space-y-4 pb-4">
          <h1 className="m-0 p-0">Consumer Brands</h1>
          {!!landingPageContent?.content && (
            <div className="prose max-w-none">
              <PortableText value={landingPageContent.content} />
            </div>
          )}
          <StatsBlock stats={statConfig} />
          <br />
          <h3 className="mt-4 mb-0 py-0">
            Average Deforestation Scores by Brand (1 best, 5 worst)
          </h3>
          <InfoTable
            columnMapping={{
              consumer_brand: "Brand",
              averageFutureRisk: "Future Deforestation Risk",
              averageCurrentRisk: "Recent Deforestation Score",
              averagePastRisk: "Past Deforestation Score",
              totalForestLoss: "Total Forest Loss (km2)",
            }}
            data={rankedTable}
            fullHeight
          />
          <h3>Consumer Brands</h3>
          <p>
            Search below for consumer brands, and learn more about the palm oil
            mill utilization of each.
          </p>
        </section>
        <div>
          <SearchableListLayout
            columns={2}
            label="Brands"
            options={options}
            rows={20}
          />
        </div>
        <br />
        <div className="prose my-4 max-w-none">
          {!!landingPageContent?.disclaimer && (
            <PortableText value={landingPageContent.disclaimer} />
          )}
        </div>
      </div>
    </main>
  );
}
