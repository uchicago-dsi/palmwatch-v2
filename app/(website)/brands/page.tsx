import pageStyles from "@/components/page-layout.module.css";
import { BrandsClient } from "@/features/brands-directory";
import cmsClient from "@/sanity/lib/client";
import { PortableText } from "@/sanity/lib/components";
import {
  loadMillSummaryStats,
  loadRankingBrands,
} from "@/server/aggregates-data";

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
      value:
        millSummaryStats?.millCount == null
          ? "—"
          : millSummaryStats.millCount.toLocaleString(),
    },
    {
      label: "Countries",
      value:
        millSummaryStats?.countryCount == null
          ? "—"
          : String(millSummaryStats.countryCount),
    },
    {
      label: "Mill owners",
      value:
        millSummaryStats?.companyCount == null
          ? "—"
          : millSummaryStats.companyCount.toLocaleString(),
    },
  ] as {
    label: string;
    value: string;
    dotCategory?: "red" | "amber" | "teal";
  }[];

  const disclaimer = landingPageContent?.disclaimer ? (
    <PortableText value={landingPageContent.disclaimer} />
  ) : undefined;

  return (
    <main className={pageStyles.pageShell}>
      <div className={pageStyles.pageInner}>
        <BrandsClient
          brands={brands as Parameters<typeof BrandsClient>[0]["brands"]}
          disclaimer={disclaimer}
          stats={stats}
        />
      </div>
    </main>
  );
}
