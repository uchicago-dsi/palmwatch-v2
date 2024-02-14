import React from "react";
import queryClient from "@/utils/getMillData";
import { BrandData, BrandInfo } from "@/components/BrandInfo";
import { IqrOverTime } from "@/components/IqrOverTimeLineChart";
import { PalmwatchMap } from "@/components/Map";
import { QueryProvider } from "@/components/QueryProvider";
import path from "path";
import { getStats } from "./pageConfig";
import { StatsBlock } from "@/components/StatsBlock";
import { InfoTable } from "@/components/InfoTable";

export const revalidate = 60;

export default async function Page({
  params,
}: {
  params: { owner: string };
}) {
  const owner = decodeURIComponent(params.owner);

  // data
  const dataDir = path.join(process.cwd(), "public", "data");
  await queryClient.init(dataDir);

  const {
    mills,
    uniqueCountries,
    uniqueMills,
    brandUsage,
    averageCurrentRisk,
    timeseries,
    totalForestLoss,
  } = queryClient.getOwnerData(owner);

  const stats = getStats(
    uniqueMills,
    uniqueCountries,
    averageCurrentRisk,
    totalForestLoss
  );

  return (
    <main className="relative flex flex-col items-center justify-center w-[90%] max-w-full mx-auto">
      <div className="p-4 flex flex-row my-0 w-full shadow-xl">
        <div className="flex flex-col w-full">
          <div className="flex-1">
            <h2 className="text-xl">Palm Oil Impact</h2>
            <h1 className="text-4xl font-bold">{owner}</h1>
          </div>
          <hr className="mt-4 block" />

          <StatsBlock stats={stats} />
          {/* <BarShareChartForests
            entry={entry}
            totalForestLoss={totlaForestLoss}
          /> */}
        </div>
      </div>
      <div className="my-4 p-4 bg-base/30 shadow-xl ring-1 ring-gray-900/5 rounded-lg w-full">
        <h3 className="text-xl my-4 font-bold">
          Palm Oil Mill Deforestation Map: Forest Loss in KM2 (2022)
        </h3>
        <div className="relative h-[60vh] w-full">
          <QueryProvider>
            <PalmwatchMap
              geoDataUrl="/data/mill-catchment.geojson"
              dataTable={mills}
              geoIdColumn="UML ID"
              dataIdColumn="UML ID"
              choroplethColumn="treeloss_km_2022"
              choroplethScheme="forestLoss"
            />
          </QueryProvider>
        </div>
      </div>
      <div className="flex flex-row space-x-4 w-full">
        <div className="p-4 bg-base-100 shadow-xl ring-1 ring-gray-900/5 rounded-lg backdrop-blur-lg mx-auto  w-full">
          <BrandInfo data={brandUsage as BrandData} />
        </div>
        <div className="bg-base-100 shadow-xl ring-1 ring-gray-900/5 rounded-lg backdrop-blur-lg mx-auto w-full prose">
          <div className="h-[40vh] relative w-full">
            <h3 className="ml-4 my-4">Forest Loss Over Time (km2)</h3>
            <IqrOverTime type="brand" data={timeseries} />
          </div>
        </div>
      </div>
      <div className="my-4 p-4 bg-base-100 shadow-xl ring-1 ring-gray-900/5 rounded-lg backdrop-blur-lg mx-auto w-full">
        <InfoTable
          data={mills}
          columnMapping={{
            "Mill Name": "Name",
            risk_score_current: "Recent Deforestation Score",
            Country: "Country",
            Province: "Province",
            District: "District",
            "Parent Company": "Parent Company",
          }}
        />
      </div>
    </main>
  );
}
