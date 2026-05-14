import { InfoTable } from "@/components/InfoTable";
import { SearchableListLayout } from "@/components/SearchableListLayout";
import { StatsBlock } from "@/components/StatsBlock";
import cmsClient from "@/sanity/lib/client";
import { PortableText } from "@/sanity/lib/components";
import type { SearchListPayload } from "@/types/searchList";
import { loadPrecomputedJson } from "@/utils/loadPrecomputed";
import { getStatConfig } from "./pageConfig";

export const revalidate = 60;

export default async function Page() {
  const [searchList, millStats, rankingBrands, landingPageContent] =
    await Promise.all([
      loadPrecomputedJson<SearchListPayload>("search-list.json"),
      loadPrecomputedJson<{
        brandCount: number | null;
        companyCount: number | null;
        countryCount: number | null;
        millCount: number | null;
        groupCount: number | null;
      }>("aggregates/mill-summary-stats.json"),
      loadPrecomputedJson<Record<string, unknown>[]>(
        "aggregates/ranking-brands.json"
      ),
      cmsClient.getLandingPageContent("brands"),
    ]);

  const options = searchList.Brands;
  const { brandCount, companyCount, countryCount, millCount, groupCount } =
    millStats;
  const statConfig = getStatConfig(
    brandCount,
    countryCount,
    millCount,
    companyCount
  );
  const rankedTable = rankingBrands;

  return (
    <main className="mx-auto">
      <section className="prose flex max-w-none flex-col space-y-4 py-4">
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
    </main>
  );
}
