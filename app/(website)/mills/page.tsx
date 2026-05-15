import { IqrOverTime } from "@/components/iqr-over-time-line-chart";
import { StatsBlock } from "@/components/stats-block";
import { emptySearchListPayload } from "@/domain";
import { SearchableListLayout } from "@/features/searchable-list";
import { loadMillSummaryStats } from "@/lib/server/aggregates-data";
import { loadSearchListPayload } from "@/lib/server/search-list-data";
import cmsClient from "@/sanity/lib/client";
import { PortableText } from "@/sanity/lib/components";
import {
  basicStatsConfig,
  forestStatsConfig,
  rspoStatsConfig,
} from "./pageConfig";

export const revalidate = 60;

export default async function Page() {
  const [searchListRaw, millStats, landingPageContent] = await Promise.all([
    loadSearchListPayload(),
    loadMillSummaryStats(),
    cmsClient.getLandingPageContent("mills"),
  ]);

  const searchList = searchListRaw ?? emptySearchListPayload;

  const options = searchList.Mills;
  if (!millStats) {
    return (
      <main className="mx-auto p-4">
        <p>Could not load aggregate statistics. Please try again later.</p>
      </main>
    );
  }
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
  } = millStats;

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
