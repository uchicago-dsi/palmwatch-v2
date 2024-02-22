import { IqrOverTime } from "@/components/IqrOverTimeLineChart";
import { SearchableListLayout } from "@/components/SearchableListLayout";
import queryClient from "@/utils/getMillData";
import React from "react";
import { basicStatsConfig, forestStatsConfig, rspoStatsConfig } from "./pageConfig";
import { StatsBlock } from "@/components/StatsBlock";
import cmsClient from "@/sanity/lib/client";
import { PortableText } from "@/sanity/lib/components";
import path from "path";

export const revalidate = 60;

export default async function Page() {
  const dataDir = path.join(process.cwd(), "public", "data");
  const [_, landingPageContent] = await Promise.all([
    queryClient.init(dataDir),
    cmsClient.getLandingPageContent("mills"),
  ]);

  const options = queryClient.getSearchList().Mills;
  const {
    timeseries,
    totalForestArea,
    totalForestLoss,
    totalArea,
    brandCount,
    companyCount,
    countryCount,
    groupCount,
    millCount,
    rspoCertified,
    notRspoCertified,
  } = queryClient.getMillSummaryStats();

  const basicStats = basicStatsConfig(
    millCount,
    brandCount,
    countryCount,
    companyCount,
  )
  const forestStats = forestStatsConfig(
    totalForestArea,
    totalForestLoss,
    totalArea,
  )
  const rspoStats = rspoStatsConfig(
    rspoCertified,
    notRspoCertified,
  )

  return (
    <main className="mx-auto">
      <section className="prose flex flex-col py-4 max-w-none">
        <h1 className="p-0 m-0">Mills</h1>
        {!!landingPageContent?.content && <p className="prose"><PortableText value={landingPageContent.content} /></p>}
        <StatsBlock stats={basicStats} />
        <hr className="py-0 my-0" />
        <StatsBlock stats={rspoStats} />
        <hr className="py-0 my-0" />
        <StatsBlock stats={forestStats} />
        <hr className="py-0 my-0" />
        <div className="h-96">
          <IqrOverTime data={timeseries} type="brand" />
        </div>
      </section>
      <div>
        <SearchableListLayout
          // @ts-ignore
          options={options}
          label="Mills"
          columns={2}
          rows={20}
        />
      </div>
      <p className="prose my-4">
        {!!landingPageContent?.disclaimer && (
          <PortableText value={landingPageContent.disclaimer} />
        )}
      </p>
    </main>
  );
}
