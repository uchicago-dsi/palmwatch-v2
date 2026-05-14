import { IqrOverTime } from "@/components/IqrOverTimeLineChart";
import { SearchableListLayout } from "@/components/SearchableListLayout";
import { StatsBlock } from "@/components/StatsBlock";
import cmsClient from "@/sanity/lib/client";
import { PortableText } from "@/sanity/lib/components";
import type { SearchListPayload } from "@/types/searchList";
import { loadPrecomputedJson } from "@/utils/loadPrecomputed";
import {
  basicStatsConfig,
  forestStatsConfig,
  rspoStatsConfig,
} from "./pageConfig";

export const revalidate = 60;

export default async function Page() {
  const [searchList, millStats, landingPageContent] = await Promise.all([
    loadPrecomputedJson<SearchListPayload>("search-list.json"),
    loadPrecomputedJson<Record<string, unknown>>(
      "aggregates/mill-summary-stats.json"
    ),
    cmsClient.getLandingPageContent("mills"),
  ]);

  const options = searchList.Mills;
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
  } = millStats as {
    timeseries: Record<string, unknown>[];
    totalForestArea: number;
    totalForestLoss: number;
    totalArea: number;
    brandCount: number | null;
    companyCount: number | null;
    countryCount: number | null;
    groupCount: number | null;
    millCount: number | null;
    rspoCertified: number;
    notRspoCertified: number;
  };

  const basicStats = basicStatsConfig(
    millCount,
    brandCount,
    countryCount,
    companyCount
  );
  const forestStats = forestStatsConfig(
    totalForestArea,
    totalForestLoss,
    totalArea
  );
  const rspoStats = rspoStatsConfig(rspoCertified, notRspoCertified);

  return (
    <main className="mx-auto">
      <section className="prose flex max-w-none flex-col py-4">
        <h1 className="m-0 p-0">Mills</h1>
        {!!landingPageContent?.content && (
          <div className="prose max-w-none">
            <PortableText value={landingPageContent.content} />
          </div>
        )}
        <StatsBlock stats={basicStats} />
        <hr className="my-0 py-0" />
        <StatsBlock stats={rspoStats} />
        <hr className="my-0 py-0" />
        <StatsBlock stats={forestStats} />
        <hr className="my-0 py-0" />
        <div className="h-96">
          <IqrOverTime data={timeseries} type="brand" />
        </div>
      </section>
      <div>
        <SearchableListLayout
          columns={2}
          label="Mills"
          // @ts-expect-error
          options={options}
          rows={20}
        />
      </div>
      <div className="prose my-4 max-w-none">
        {!!landingPageContent?.disclaimer && (
          <PortableText value={landingPageContent.disclaimer} />
        )}
      </div>
    </main>
  );
}
