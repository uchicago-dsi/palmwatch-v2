import { notFound } from "next/navigation";
import { QueryProvider } from "@/components/query-provider";
import { latestTreelossKmColumn } from "@/config/years";
import type { UmlData } from "@/domain";
import { buildCountryRollupStatTiles } from "@/domain/stat-tiles";
import { CountryPageView } from "@/features/country-detail";
import { PalmwatchMap } from "@/features/map";
import { precomputedSlug } from "@/lib/precomputed-slug";
import { loadCountryPagePayload } from "@/lib/server/entity-page-data";
import cmsClient from "@/sanity/lib/client";

export const revalidate = 60;

export default async function Page({
  params,
}: {
  params: Promise<{ country: string }>;
}) {
  const { country: _country } = await params;
  const country = decodeURIComponent(_country);
  const countryInfo = await cmsClient.getCountryInfo(country);
  const { description, externalLink, content } = countryInfo || {};
  const pageData = await loadCountryPagePayload(precomputedSlug(country));
  if (!pageData) {
    notFound();
  }
  const { mills, uniqueMills, averageCurrentRisk, totalForestLoss } = pageData;
  const millsTyped = mills as UmlData[];
  const stats = buildCountryRollupStatTiles(
    uniqueMills,
    averageCurrentRisk,
    totalForestLoss
  );

  const deforestationMap = (
    <QueryProvider>
      <PalmwatchMap
        choroplethColumn={latestTreelossKmColumn}
        choroplethScheme="forestLoss"
        dataIdColumn="UML ID"
        dataTable={millsTyped}
        geoDataUrl="/data/mill-catchment.geojson"
        geoIdColumn="UML ID"
      />
    </QueryProvider>
  );

  return (
    <CountryPageView
      content={content}
      country={country}
      deforestationMap={deforestationMap}
      description={description}
      externalLink={externalLink}
      millsTyped={millsTyped}
      pageData={pageData}
      stats={stats}
    />
  );
}
