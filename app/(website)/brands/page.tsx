import pageStyles from "@/components/page-layout.module.css";
import { emptySearchListPayload } from "@/domain";
import {
  loadMillSummaryStats,
  loadRankingBrands,
} from "@/lib/server/aggregates-data";
import { loadSearchListPayload } from "@/lib/server/search-list-data";
import cmsClient from "@/sanity/lib/client";
import { PortableText } from "@/sanity/lib/components";
import styles from "./brands.module.css";
import { BrandsClient } from "./brands-client";

export const revalidate = 60;

const NUM_FMT = new Intl.NumberFormat("en-US");

export default async function Page() {
  const [searchListRaw, millStats, rankingBrands, landingPageContent] =
    await Promise.all([
      loadSearchListPayload(),
      loadMillSummaryStats(),
      loadRankingBrands(),
      cmsClient.getLandingPageContent("brands"),
    ]);

  const searchList = searchListRaw ?? emptySearchListPayload;

  if (!millStats) {
    return (
      <main className={pageStyles.pageShell}>
        <div className={pageStyles.pageInner}>
          <p>Could not load aggregate statistics. Please try again later.</p>
        </div>
      </main>
    );
  }

  const { brandCount, companyCount, countryCount, millCount } = millStats;
  const stats = [
    brandCount === null
      ? null
      : { label: "Brands", value: NUM_FMT.format(brandCount) },
    millCount === null
      ? null
      : { label: "Mills", value: NUM_FMT.format(millCount) },
    countryCount === null
      ? null
      : { label: "Countries", value: NUM_FMT.format(countryCount) },
    companyCount === null
      ? null
      : { label: "Mill Owners", value: NUM_FMT.format(companyCount) },
  ].filter(Boolean) as { label: string; value: string }[];

  return (
    <main className={pageStyles.pageShell}>
      <div className={pageStyles.pageInner}>
        <BrandsClient
          brands={
            (rankingBrands ?? []) as Parameters<
              typeof BrandsClient
            >[0]["brands"]
          }
          stats={stats}
        />
        {!!landingPageContent?.disclaimer && (
          <div className={styles.disclaimer}>
            <PortableText value={landingPageContent.disclaimer} />
          </div>
        )}
      </div>
    </main>
  );
}
