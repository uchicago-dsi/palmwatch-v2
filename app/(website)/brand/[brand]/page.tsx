import pageStyles from "@/components/page-layout.module.css";
import { getBrandDataDownloadLinks } from "@/config/brand-data-download-links";
import type { CumulativePoint, RankingEntry } from "@/features/brand-detail";
import { BrandPageView } from "@/features/brand-detail";
import { loadBrandPageModel } from "@/lib/server/brand-page-data";
import { loadPrecomputedJson } from "@/lib/server/load-precomputed";
import { PortableText } from "@/sanity/lib/components";

export const revalidate = 60;

const YEARS = Array.from({ length: 25 }, (_, i) => 2001 + i);

function computeForestTimeseries(
  umlInfo: Array<Record<string, unknown>>
): CumulativePoint[] {
  let cumulative = 0;
  return YEARS.map((year) => {
    const annual = umlInfo.reduce(
      (sum, mill) => sum + (Number(mill[`treeloss_km_${year}`]) || 0),
      0
    );
    cumulative += annual;
    return { year, cumulativeKm2: Math.round(cumulative) };
  });
}

export default async function Page({
  params,
}: {
  params: Promise<{ brand: string }>;
}) {
  const { brand: _brand } = await params;
  const brand = decodeURIComponent(_brand);

  const [loaded, rankingRaw] = await Promise.all([
    loadBrandPageModel(brand),
    loadPrecomputedJson<RankingEntry[]>("aggregates/ranking-brands.json").catch(
      () => [] as RankingEntry[]
    ),
  ]);

  if (!loaded.ok) {
    return (
      <main className={pageStyles.pageShell}>
        <div className={pageStyles.pageInner}>
          <p>
            {loaded.reason === "precomputed"
              ? `Could not load data for brand "${brand}".`
              : `Brand "${brand}" not found.`}
          </p>
        </div>
      </main>
    );
  }

  const { model } = loaded;
  const { brandPre, brandInfo } = model;

  const ranking = rankingRaw.map((r) => ({
    consumer_brand: r.consumer_brand,
    averageCurrentRisk: r.averageCurrentRisk,
  }));

  const rankingEntry = rankingRaw.find((r) => r.consumer_brand === brand);
  const totalForestLoss =
    (rankingEntry as { totalForestLoss?: number } | undefined)
      ?.totalForestLoss ?? 0;

  const forestLossTimeseries = brandPre.umlInfo
    ? computeForestTimeseries(
        brandPre.umlInfo as Array<Record<string, unknown>>
      )
    : [];

  const aboutContent = (
    <>
      <p>
        {brandInfo.description}
        {brandInfo.descriptionAttribution && (
          <i> (Source: {brandInfo.descriptionAttribution})</i>
        )}
      </p>
      {brandInfo.content && <PortableText value={brandInfo.content} />}
    </>
  );

  return (
    <main className={pageStyles.pageShell}>
      <div className={pageStyles.pageInner}>
        <BrandPageView
          aboutContent={aboutContent}
          altName={brandInfo.altName}
          brand={brand}
          brandStats={brandPre.brandStats}
          disclosures={brandInfo.disclosures ?? []}
          downloads={getBrandDataDownloadLinks(brand)}
          externalLink={brandInfo.externalLink ?? ""}
          forestLossTimeseries={forestLossTimeseries}
          ranking={ranking}
          rspoMemberSince={brandInfo.rspoMemberSince ?? ""}
          totalForestLoss={totalForestLoss}
        />
      </div>
    </main>
  );
}
