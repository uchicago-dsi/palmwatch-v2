import type { ReactNode } from "react";
import { BrandInfo } from "@/components/brand-info";
import { CmsContent } from "@/components/cms-content";
import { CmsDescription } from "@/components/cms-description";
import { InfoTable } from "@/components/info-table";
import { IqrOverTime } from "@/components/iqr-over-time-line-chart";
import { StatsBlock } from "@/components/stats-block";
import type { BrandData, UmlData } from "@/domain";
import type { CountryPagePayload } from "@/domain/schemas/entity-pages";
import type { StatTile } from "@/domain/stat-tiles";

export type CountryPageViewProps = {
  country: string;
  description?: string | ReactNode;
  externalLink?: string;
  content?: unknown;
  pageData: CountryPagePayload;
  millsTyped: UmlData[];
  stats: StatTile[];
  deforestationMap: ReactNode;
};

export function CountryPageView({
  country,
  description,
  externalLink,
  content,
  pageData,
  millsTyped,
  stats,
  deforestationMap,
}: CountryPageViewProps) {
  const { brandUsage, timeseries } = pageData;

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
        <div className="relative h-[60vh] w-full">{deforestationMap}</div>
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
          data={millsTyped}
        />
      </div>
      <CmsContent content={content} />
    </main>
  );
}
