import React from "react";
import queryClient from "@/utils/getMillData";
import { BrandData, BrandInfo } from "@/components/BrandInfo";
import { IqrOverTime } from "@/components/IqrOverTimeLineChart";
import { PalmwatchMap } from "@/components/Map";
import { QueryProvider } from "@/components/QueryProvider";
import path from "path";
import { UmlData } from "@/utils/dataTypes";
import { MillInfo } from "@/components/MillInfo";
import { getStats } from "./pageConfig";
import { StatsBlock } from "@/components/StatsBlock";
import { sumForestLoss } from "@/utils/sumForestloss";
import { fullYearRange } from "@/config/years";
import { BarShareChartForests } from "@/components/BarShareChartForests";
import cmsClient from "@/sanity/lib/client";
import { PortableText } from "@/sanity/lib/components";

export const revalidate = 60;

export default async function Page({ params }: { params: Promise<{ uml: string }> }) {
  const { uml: _uml } = await params;
  const uml = decodeURIComponent(_uml);

  // data
  const dataDir = path.join(process.cwd(), "public", "data");
  const [
    _,
    millContent
  ] = await Promise.all([
    queryClient.init(dataDir),
    cmsClient.getUmlInfo(uml)
  ])
  const data = queryClient.getUml(uml).objects();
  const medianMillData = queryClient.getMedianMill()?.[0];
  const entry = data?.[0] as UmlData | undefined;

  if (!entry) {
    return <div>Mill Not Found</div>;
  }

  // reshape stats
  // @ts-ignore
  const umlId = entry?.["UML ID"];
  const millName = entry?.["Mill Name"];
  const brandData = queryClient.getBrandUsageByUml(umlId) as BrandData;
  const lineChartData = fullYearRange.map((year) => ({
    year,
    // @ts-ignore
    "Mill Tree Loss (km2)": entry?.[`treeloss_km_${year}`],
    // @ts-ignore
    "Overall Median Mill Tree Loss (km2)": medianMillData?.[`median${year}`],
  }));

  // format
  const stats = getStats(
    entry.treeloss_km_2022,
    entry.risk_score_current,
    entry.risk_score_past,
    entry.risk_score_future
  );
  const totalForestLoss = sumForestLoss(entry);
  return (
    <main className="relative flex flex-col items-center justify-center w-[90%] max-w-full mx-auto">
      <div className="p-4 flex flex-row my-0 w-full shadow-xl">
        <div className="flex flex-col w-full">
          <div className="flex-1">
            <h2 className="text-xl">Palm Oil Impact</h2>
            <h1 className="text-4xl font-bold">{millName}</h1>
            <div className="stats flex-1 w-full mt-4">
              <div className="stat">
                <div className="stat-title">Total Forest Loss</div>
                <div className="stat-value">
                  {totalForestLoss.toLocaleString()} km2
                </div>
                <div className="stat-desc">
                  Cumulative forest loss from 2001 to 2022
                </div>
              </div>
              <div className="stat">
                <div className="stat-title">Catchment Area</div>
                <div className="stat-value">
                  {entry["km_area"].toLocaleString()} km2
                </div>
                <div className="stat-desc">
                  Overall area assigned to this mill
                </div>
              </div>
              <div className="stat">
                <div className="stat-title">RSPO Certification</div>
                <div className="stat-value">{entry["RSPO Status"]}</div>
                <div className="stat-desc">
                  Overall area assigned to this mill
                </div>
              </div>
            </div>
          </div>
          <hr className="mt-4 block" />

          <StatsBlock stats={stats} />
          <BarShareChartForests
            entry={entry}
            totalForestLoss={totalForestLoss}
          />
        </div>
      </div>
      <div className="my-4 p-4 bg-surface/30 shadow-xl ring-1 ring-gray-900/5 rounded-lg w-full">
        <h3 className="text-xl my-4 font-bold">
          Palm Oil Mill Deforestation Map: Forest Loss in KM2
        </h3>
        <div className="relative h-[60vh] w-full">
          <QueryProvider>
            <PalmwatchMap
              geoDataUrl="/data/mill-catchment.geojson"
              dataTable={data}
              geoIdColumn="UML ID"
              dataIdColumn="UML ID"
              choroplethColumn="treeloss_km_2022"
              choroplethScheme="forestLoss"
            />
          </QueryProvider>
        </div>
      </div>
      <div className="flex flex-row space-x-4 w-full">
        <div className="p-4 bg-surface/30 shadow-xl ring-1 ring-gray-900/5 rounded-lg backdrop-blur-lg mx-auto  w-full">
          <BrandInfo data={brandData} />
        </div>
        <div className="bg-surface/30 shadow-xl ring-1 ring-gray-900/5 rounded-lg backdrop-blur-lg mx-auto w-full prose">
          <div className="h-[40vh] relative w-full">
            <h3 className="ml-4 my-4">Forest Loss Over Time (km2)</h3>
            <IqrOverTime type="mill" data={lineChartData} showMedian={true} />
          </div>
        </div>
      </div>
      <div className="my-4 p-4 bg-surface/30 shadow-xl ring-1 ring-gray-900/5 rounded-lg backdrop-blur-lg mx-auto w-full">
        <QueryProvider>
          <MillInfo millOverride={uml} dataOverride={[entry]} />
        </QueryProvider>
      </div>
      {!!millContent?.content && (
        <div className="prose bg-base-100 p-4 my-4 w-full shadow-xl max-w-none">
          <PortableText value={millContent.content} />
        </div>
      )}
    </main>
  );
}
