import { InfoTable } from "@/components/info-table";
import { emptySearchListPayload } from "@/domain";
import { SearchableListLayout } from "@/features/searchable-list";
import { loadCountriesSummary } from "@/lib/server/aggregates-data";
import { loadSearchListPayload } from "@/lib/server/search-list-data";
import cmsClient from "@/sanity/lib/client";
import { PortableText } from "@/sanity/lib/components";
export const revalidate = 60;

export default async function Page() {
  const [searchListRaw, countriesSummary, landingPageContent] =
    await Promise.all([
      loadSearchListPayload(),
      loadCountriesSummary(),
      cmsClient.getLandingPageContent("countries"),
    ]);
  const searchList = searchListRaw ?? emptySearchListPayload;
  const options = searchList.Countries;
  if (!countriesSummary) {
    return (
      <main className="mx-auto p-4">
        <p>Could not load countries summary. Please try again later.</p>
      </main>
    );
  }
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
