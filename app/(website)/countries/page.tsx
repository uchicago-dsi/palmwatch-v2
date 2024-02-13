import { InfoTable } from "@/components/InfoTable";
import { SearchableListLayout } from "@/components/SearchableListLayout";
import queryClient from "@/utils/getMillData";
import React from "react";

export const revalidate = 60;

export default async function Page() {
  await queryClient.init();
  const options = queryClient.getSearchList().Countries;
  const {
    countryStats
  } = queryClient.getCountriesSummary();

  return (
    <main className="mx-auto">
      <section className="prose flex flex-col py-4 max-w-none">
        <h1 className="p-0 m-0">Countries</h1>
        <InfoTable
          data={countryStats}
          columnMapping={{
            Country: "Country",
            count: "Number of Palm Oil Mills",
            pctForestLossString: "Percent of Tree Cover Area Lost",
            pastRisk: "Average Past Risk Score",
            currentRisk: "Average Current Risk Score",
            futureRisk: "Average Future Risk Score"
          }}
          fullHeight
        />
        <hr/>
        <SearchableListLayout
        // @ts-ignore
          options={options}
          label="Countries"
          columns={2}
          rows={20}
        />
      </section>
    </main>
  );
}
