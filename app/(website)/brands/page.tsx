import { InfoTable } from "@/components/InfoTable";
import { SearchableListLayout } from "@/components/SearchableListLayout";
import { StatsBlock } from "@/components/StatsBlock";
import queryClient from "@/utils/getMillData";

import React from "react";
import { getStatConfig } from "./pageConfig";
import cmsClient from "@/sanity/lib/client";
import { PortableText } from "@/sanity/lib/components";
export const revalidate = 60;

export default async function Page() {
  const [
    _,
    landingPageContent
  ] = await Promise.all([
    queryClient.init(),
    cmsClient.getLandingPageContent('brands')
  ])

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
        {!!landingPageContent?.content && <PortableText value={landingPageContent.content} />}
        <StatsBlock stats={statConfig} />
        <br/>
        <h3 className="mt-4 mb-0 py-0">Average Deforestation Scores by Brand (1 best, 5 worst)</h3>
        <InfoTable
          data={rankedTable}
          columnMapping={{
            consumer_brand: "Brand",
            averageFutureRisk: "Future Deforestation Risk",
            averageCurrentRisk: "Recent Deforestation Score",
            averagePastRisk: "Past Deforestation Score",
            totalForestLoss: "Total Forest Loss (km2)",
          }}
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
          options={options}
          label="Brands"
          columns={2}
          rows={20}
        />
      </div>
      <br/>
      <p className="prose my-4">
        {!!landingPageContent?.disclaimer && <PortableText value={landingPageContent.disclaimer} />}
      </p>
    </main>
  );
}
