import pageStyles from "@/components/page-layout.module.css";
import { loadRankingBrands } from "@/lib/server/aggregates-data";
import cmsClient from "@/sanity/lib/client";
import { PortableText } from "@/sanity/lib/components";
import styles from "./brands.module.css";
import { BrandsClient } from "./brands-client";

export const revalidate = 60;

function scoreCategory(score: number): "red" | "amber" | "teal" {
  if (score > 3.05) {
    return "red";
  }
  if (score >= 2.85) {
    return "amber";
  }
  return "teal";
}

export default async function Page() {
  const [rankingBrands, landingPageContent] = await Promise.all([
    loadRankingBrands(),
    cmsClient.getLandingPageContent("brands"),
  ]);

  const brands = rankingBrands ?? [];
  const avgScore =
    brands.length > 0
      ? brands.reduce(
          (sum, b) =>
            sum +
            (Number(
              (b as { averageCurrentRisk?: unknown }).averageCurrentRisk
            ) || 0),
          0
        ) / brands.length
      : 0;

  const stats = [
    { label: "Brands tracked", value: String(brands.length) },
    {
      label: "Avg deforestation score",
      value: avgScore.toFixed(2),
      dotCategory: scoreCategory(avgScore),
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
