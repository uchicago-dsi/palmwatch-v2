import { InfoTable } from "@/components/InfoTable";
import { SearchableListLayout } from "@/components/SearchableListLayout";
import cmsClient from "@/sanity/lib/client";
import { PortableText } from "@/sanity/lib/components";
import type { SearchListPayload } from "@/types/searchList";
import { loadPrecomputedJson } from "@/utils/loadPrecomputed";
export const revalidate = 60;

export default async function Page() {
  const [searchList, countriesSummary, landingPageContent] = await Promise.all([
    loadPrecomputedJson<SearchListPayload>("search-list.json"),
    loadPrecomputedJson<{
      countryStats: Record<string, unknown>[];
    }>("aggregates/countries-summary.json"),
    cmsClient.getLandingPageContent("countries"),
  ]);
  const options = searchList.Countries;
  const { countryStats } = countriesSummary;

  return (
    <main className="mx-auto">
      <section className="prose flex max-w-none flex-col py-4">
        <h1 className="m-0 p-0">Countries</h1>
        {!!landingPageContent?.content && (
          <div className="prose max-w-none">
            <PortableText value={landingPageContent.content} />
          </div>
        )}
        <InfoTable
          columnMapping={{
            Country: "Country",
            count: "Number of Palm Oil Mills",
            pctForestLossString: "Percent of Tree Cover Area Lost",
            pastRisk: "Average Past Deforestation Score",
            currentRisk: "Average Recent Deforestation Score",
            futureRisk: "Average Future Deforestation Risk Score",
          }}
          data={countryStats}
          fullHeight
        />
        <hr />
        <SearchableListLayout
          columns={2}
          label="Countries"
          // @ts-expect-error
          options={options}
          rows={20}
        />
      </section>
      <div className="prose my-4 max-w-none">
        {!!landingPageContent?.disclaimer && (
          <PortableText value={landingPageContent.disclaimer} />
        )}
      </div>
    </main>
  );
}
