import { InfoTable } from "@/components/InfoTable";
import { SearchableListLayout } from "@/components/SearchableListLayout";
import queryClient from "@/utils/getMillData";
import React from "react";
import cmsClient from "@/sanity/lib/client";
import { PortableText } from "@/sanity/lib/components";;
import path from "path";
export const revalidate = 60;

export default async function Page() {
  const dataDir = path.join(process.cwd(), "public", "data");
  const [_, landingPageContent] = await Promise.all([
    queryClient.init(dataDir),
    cmsClient.getLandingPageContent("countries"),
  ]);
  const options = queryClient.getSearchList().Countries;
  const {
    countryStats
  } = queryClient.getCountriesSummary();

  return (
    <main className="mx-auto">
      <section className="prose flex flex-col py-4 max-w-none">
        <h1 className="p-0 m-0">Countries</h1>
        {!!landingPageContent?.content && <p className="prose"><PortableText value={landingPageContent.content} /></p>}
        <InfoTable
          data={countryStats}
          columnMapping={{
            Country: "Country",
            count: "Number of Palm Oil Mills",
            pctForestLossString: "Percent of Tree Cover Area Lost",
            pastRisk: "Average Past Deforestation Score",
            currentRisk: "Average Recent Deforestation Score",
            futureRisk: "Average Future Deforestation Risk Score",
          }}
          fullHeight
        />
        <hr />
        <SearchableListLayout
          // @ts-ignore
          options={options}
          label="Countries"
          columns={2}
          rows={20}
        />
      </section>
      <p className="prose my-4">
        {!!landingPageContent?.disclaimer && (
          <PortableText value={landingPageContent.disclaimer} />
        )}
      </p>
    </main>
  );
}
