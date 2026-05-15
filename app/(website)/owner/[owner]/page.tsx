import { notFound } from "next/navigation";
import { QueryProvider } from "@/components/query-provider";
import { latestTreelossKmColumn } from "@/config/years";
import type { UmlData } from "@/domain";
import { buildRollupEntityStatTiles } from "@/domain/stat-tiles";
import { PalmwatchMap } from "@/features/map";
import { OwnerPageView } from "@/features/owner-detail";
import { precomputedSlug } from "@/lib/precomputed-slug";
import { loadOwnerPagePayload } from "@/lib/server/entity-page-data";

export const revalidate = 60;

export default async function Page({
  params,
}: {
  params: Promise<{ owner: string }>;
}) {
  const { owner: _owner } = await params;
  const owner = decodeURIComponent(_owner);
  const pageData = await loadOwnerPagePayload(precomputedSlug(owner));
  if (!pageData) {
    notFound();
  }
  const {
    mills,
    uniqueCountries,
    uniqueMills,
    averageCurrentRisk,
    totalForestLoss,
  } = pageData;
  const millsTyped = mills as UmlData[];
  const stats = buildRollupEntityStatTiles(
    uniqueMills,
    uniqueCountries,
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
    <OwnerPageView
      deforestationMap={deforestationMap}
      millsTyped={millsTyped}
      owner={owner}
      pageData={pageData}
      stats={stats}
    />
  );
}
