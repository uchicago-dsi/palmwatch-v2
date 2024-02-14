import { InfoTable } from "@/components/InfoTable";
import { SearchableListLayout } from "@/components/SearchableListLayout";
import { StatsBlock } from "@/components/StatsBlock";
import queryClient from "@/utils/getMillData";

import React from "react";
import { getStatConfig } from "./pageConfig";

export const revalidate = 60;

export default async function Page() {
  await queryClient.init();
  const options = queryClient.getSearchList().Brands;
  const { brandCount, companyCount, countryCount, millCount, groupCount } =
    queryClient.getUniqueCounts();
  const statConfig = getStatConfig(
    brandCount,
    countryCount,
    millCount,
    companyCount
  );
  const rankedTable = queryClient.getRankingOfBrandsByCurrentImpactScore();

  return (
    <main className="mx-auto">
      <section className="prose flex flex-col py-4 max-w-none space-y-4">
        <h1 className="p-0 m-0">Consumer Brands</h1>
        <StatsBlock stats={statConfig} />
        <InfoTable
          data={rankedTable}
          columnMapping={{
            consumer_brand: "Brand",
            averageCurrentRisk: "Average Recent Deforestation Score",
            averageFutureRisk: "Average Future Deforestation Risk Score",
            averagePastRisk: "Average Past Deforestation Score",
            totalForestLoss: "Total Forest Loss (km2)",
          }}
          fullHeight
        />
        <h3>Brand Search</h3>
        <p>
          Search below for consumer brands, and learn more about the palm oil
          mill utilization of each.
        </p>
      </section>
      <div>
        <SearchableListLayout
          options={options}
          label="Brands"
          columns={2}
          rows={20}
        />
      </div>
    </main>
  );
}
