import { BarShareChartForests } from "@/components/BarShareChartForests";
import { type BrandData, BrandInfo } from "@/components/BrandInfo";
import { IqrOverTime } from "@/components/IqrOverTimeLineChart";
import { PalmwatchMap } from "@/components/Map";
import { MillInfo } from "@/components/MillInfo";
import { QueryProvider } from "@/components/QueryProvider";
import { StatsBlock } from "@/components/StatsBlock";
import {
  fullYearRange,
  latestTreelossKmColumn,
  maxYear,
  minYear,
} from "@/config/years";
import cmsClient from "@/sanity/lib/client";
import { PortableText } from "@/sanity/lib/components";
import type { UmlData } from "@/utils/dataTypes";
import { loadPrecomputedJson } from "@/utils/loadPrecomputed";
import { precomputedSlug } from "@/utils/precomputedSlug";
import { sumForestLoss } from "@/utils/sumForestloss";
import { getStats } from "./pageConfig";

export const revalidate = 60;

export default async function Page({
  params,
}: {
  params: Promise<{ uml: string }>;
}) {
  const { uml: _uml } = await params;
  const uml = decodeURIComponent(_uml);

  const slug = precomputedSlug(uml);
  const [millPayload, medianMill, millContent] = await Promise.all([
    loadPrecomputedJson<{ info: UmlData[]; brands: BrandData }>(
      `mill/${slug}.json`
    ),
    loadPrecomputedJson<Record<string, number>[]>(
      "aggregates/median-mill.json"
    ),
    cmsClient.getUmlInfo(uml),
  ]);
  const data = millPayload.info;
  const medianMillData = medianMill?.[0];
  const entry = data?.[0] as UmlData | undefined;

  if (!entry) {
    return <div>Mill Not Found</div>;
  }

  // reshape stats
  // @ts-expect-error
  const umlId = entry?.["UML ID"];
  const millName = entry?.["Mill Name"];
  const brandData = millPayload.brands;
  const lineChartData = fullYearRange.map((year) => ({
    year,
    // @ts-expect-error
    "Mill Tree Loss (km2)": entry?.[`treeloss_km_${year}`],
    // @ts-expect-error
    "Overall Median Mill Tree Loss (km2)": medianMillData?.[`median${year}`],
  }));

  // format
  const stats = getStats(
    entry[latestTreelossKmColumn as keyof UmlData] as number,
    entry.risk_score_current,
    entry.risk_score_past,
    entry.risk_score_future
  );
  const totalForestLoss = sumForestLoss(entry);
  return (
    <main className="relative mx-auto flex w-[90%] max-w-full flex-col items-center justify-center">
      <div className="my-0 flex w-full flex-row p-4 shadow-xl">
        <div className="flex w-full flex-col">
          <div className="flex-1">
            <h2 className="text-xl">Palm Oil Impact</h2>
            <h1 className="font-bold text-4xl">{millName}</h1>
            <div className="stats mt-4 w-full flex-1">
              <div className="stat">
                <div className="stat-title">Total Forest Loss</div>
                <div className="stat-value">
                  {totalForestLoss.toLocaleString()} km2
                </div>
                <div className="stat-desc">
                  Cumulative forest loss from {minYear} to {maxYear}
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
      <div className="my-4 w-full rounded-lg bg-surface/30 p-4 shadow-xl ring-1 ring-gray-900/5">
        <h3 className="my-4 font-bold text-xl">
          Palm Oil Mill Deforestation Map: Forest Loss in KM2
        </h3>
        <div className="relative h-[60vh] w-full">
          <QueryProvider>
            <PalmwatchMap
              choroplethColumn={latestTreelossKmColumn}
              choroplethScheme="forestLoss"
              dataIdColumn="UML ID"
              dataTable={data}
              geoDataUrl="/data/mill-catchment.geojson"
              geoIdColumn="UML ID"
            />
          </QueryProvider>
        </div>
      </div>
      <div className="flex w-full flex-row space-x-4">
        <div className="mx-auto w-full rounded-lg bg-surface/30 p-4 shadow-xl ring-1 ring-gray-900/5 backdrop-blur-lg">
          <BrandInfo data={brandData} />
        </div>
        <div className="prose mx-auto w-full rounded-lg bg-surface/30 shadow-xl ring-1 ring-gray-900/5 backdrop-blur-lg">
          <div className="relative h-[40vh] w-full">
            <h3 className="my-4 ml-4">Forest Loss Over Time (km2)</h3>
            <IqrOverTime data={lineChartData} showMedian={true} type="mill" />
          </div>
        </div>
      </div>
      <div className="mx-auto my-4 w-full rounded-lg bg-surface/30 p-4 shadow-xl ring-1 ring-gray-900/5 backdrop-blur-lg">
        <QueryProvider>
          <MillInfo dataOverride={[entry]} millOverride={uml} />
        </QueryProvider>
      </div>
      {!!millContent?.content && (
        <div className="prose my-4 w-full max-w-none bg-base-100 p-4 shadow-xl">
          <PortableText value={millContent.content} />
        </div>
      )}
    </main>
  );
}
