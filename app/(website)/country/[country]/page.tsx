import { type BrandData, BrandInfo } from "@/components/BrandInfo";
import { CmsContent } from "@/components/CmsContent";
import { CmsDescription } from "@/components/CmsDescription";
import { InfoTable } from "@/components/InfoTable";
import { IqrOverTime } from "@/components/IqrOverTimeLineChart";
import { PalmwatchMap } from "@/components/Map";
import { QueryProvider } from "@/components/QueryProvider";
import { StatsBlock } from "@/components/StatsBlock";
import { latestTreelossKmColumn } from "@/config/years";
import cmsClient from "@/sanity/lib/client";
import type { UmlData } from "@/utils/dataTypes";
import { loadPrecomputedJson } from "@/utils/loadPrecomputed";
import { precomputedSlug } from "@/utils/precomputedSlug";
import { getStats } from "./pageConfig";

export const revalidate = 60;

export default async function Page({
  params,
}: {
  params: Promise<{ country: string }>;
}) {
  const { country: _country } = await params;
  const country = decodeURIComponent(_country);

  const countryInfo = await cmsClient.getCountryInfo(country);

  const { description, externalLink, content } = countryInfo || {};

  const {
    mills,
    uniqueMills,
    brandUsage,
    averageCurrentRisk,
    timeseries,
    totalForestLoss,
  } = await loadPrecomputedJson<{
    mills: UmlData[];
    uniqueMills: number;
    brandUsage: BrandData;
    averageCurrentRisk: number;
    timeseries: Record<string, unknown>[];
    totalForestLoss: number;
  }>(`country/${precomputedSlug(country)}.json`);

  const stats = getStats(uniqueMills, averageCurrentRisk, totalForestLoss);

  return (
    <main className="relative mx-auto flex w-[90%] max-w-full flex-col items-center justify-center">
      <div className="my-0 flex w-full flex-row p-4 shadow-xl">
        <div className="flex w-full flex-col">
          <div className="flex-1">
            <h2 className="text-xl">Palm Oil Impact</h2>
            <h1 className="font-bold text-4xl">{country}</h1>
          </div>
          <hr className="mt-4 block" />

          <StatsBlock stats={stats} />
          {/* <BarShareChartForests
            entry={entry}
            totalForestLoss={totlaForestLoss}
          /> */}
        </div>
      </div>
      <CmsDescription
        description={description}
        externalLink={externalLink}
        linkText={`Click here for more info about ${country}`}
      />
      <div className="my-4 w-full rounded-lg bg-base-100 p-4 shadow-xl ring-1 ring-gray-900/5">
        <h3 className="my-4 font-bold text-xl">
          Palm Oil Mill Deforestation Map: Forest Loss in KM2
        </h3>
        <div className="relative h-[60vh] w-full">
          <QueryProvider>
            <PalmwatchMap
              choroplethColumn={latestTreelossKmColumn}
              choroplethScheme="forestLoss"
              dataIdColumn="UML ID"
              dataTable={mills}
              geoDataUrl="/data/mill-catchment.geojson"
              geoIdColumn="UML ID"
            />
          </QueryProvider>
        </div>
      </div>
      <div className="flex w-full flex-row space-x-4">
        <div className="mx-auto w-full rounded-lg bg-base-100 p-4 shadow-xl ring-1 ring-gray-900/5 backdrop-blur-lg">
          <BrandInfo data={brandUsage as BrandData} />
        </div>
        <div className="prose mx-auto w-full rounded-lg bg-base-100 shadow-xl ring-1 ring-gray-900/5 backdrop-blur-lg">
          <div className="relative h-[40vh] w-full">
            <h3 className="my-4 ml-4">Forest Loss Over Time (km2)</h3>
            <IqrOverTime data={timeseries} type="brand" />
          </div>
        </div>
      </div>
      <div className="mx-auto my-4 w-full rounded-lg bg-base-100 p-4 shadow-xl ring-1 ring-gray-900/5 backdrop-blur-lg">
        <InfoTable
          columnMapping={{
            "Mill Name": "Name",
            risk_score_current: "Recent Deforestation Score",
            Country: "Country",
            Province: "Province",
            District: "District",
            "Parent Company": "Parent Company",
          }}
          data={mills}
        />
      </div>
      <CmsContent content={content} />
    </main>
  );
}
