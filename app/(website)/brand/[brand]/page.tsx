import { BrandDeforestationMap } from "@/app/(website)/_shell/entity-deforestation-map";
import pageStyles from "@/components/page-layout.module.css";
import { getBrandDataDownloadLinks } from "@/config/brand-data-download-links";
import type { RankingEntry } from "@/features/brand-detail";
import {
  BrandPageView,
  computeForestTimeseries,
} from "@/features/brand-detail";
import { PortableText } from "@/sanity/lib/components";
import { loadBrandPageModel } from "@/server/brand-page-data";
import { loadPrecomputedJson } from "@/server/load-precomputed";

export const revalidate = 60;

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

  const forestLossTimeseries = brandPre.umlInfo
    ? computeForestTimeseries(brandPre.umlInfo)
    : [];

  const totalForestLoss = forestLossTimeseries.reduce(
    (sum, p) => sum + p.annualKm2,
    0
  );

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
          deforestationMap={<BrandDeforestationMap brand={brand} />}
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
