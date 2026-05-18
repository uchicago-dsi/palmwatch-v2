import pageStyles from "@/components/page-layout.module.css";
import {
  loadMillSummaryStats,
  loadRankingBrands,
} from "@/lib/server/aggregates-data";
import cmsClient from "@/sanity/lib/client";
import { PortableText } from "@/sanity/lib/components";
import styles from "./brands.module.css";
import { BrandsClient } from "./brands-client";

export const revalidate = 60;

export default async function Page() {
  const [rankingBrands, millSummaryStats, landingPageContent] =
    await Promise.all([
      loadRankingBrands(),
      loadMillSummaryStats(),
      cmsClient.getLandingPageContent("brands"),
    ]);

  const brands = rankingBrands ?? [];

  const stats = [
    { label: "Brands tracked", value: String(brands.length) },
    {
      label: "Mills",
      value: millSummaryStats?.millCount != null
        ? millSummaryStats.millCount.toLocaleString()
        : "—",
    },
    {
      label: "Countries",
      value: millSummaryStats?.countryCount != null
        ? String(millSummaryStats.countryCount)
        : "—",
    },
    {
      label: "Mill owners",
      value: millSummaryStats?.companyCount != null
        ? millSummaryStats.companyCount.toLocaleString()
        : "—",
    },
  ] as {
    label: string;
    value: string;
    dotCategory?: "red" | "amber" | "teal";
  }[];

  return (
    <main className={pageStyles.pageShell}>
      <div className={pageStyles.pageInner}>
        <BrandsClient
          brands={brands as Parameters<typeof BrandsClient>[0]["brands"]}
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
