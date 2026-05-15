import { notFound } from "next/navigation";
import { QueryProvider } from "@/components/query-provider";
import { latestTreelossKmColumn } from "@/config/years";
import type { UmlData } from "@/domain";
import { buildRollupEntityStatTiles } from "@/domain/stat-tiles";
import { GroupPageView } from "@/features/group-detail";
import { PalmwatchMap } from "@/features/map";
import { precomputedSlug } from "@/lib/precomputed-slug";
import { loadGroupPagePayload } from "@/lib/server/entity-page-data";
import cmsClient from "@/sanity/lib/client";

export const revalidate = 60;

export default async function Page({
  params,
}: {
  params: Promise<{ group: string }>;
}) {
  const { group: _group } = await params;
  const group = decodeURIComponent(_group);
  const groupInfo = await cmsClient.getGroupInfo(group);
  const { description, externalLink, content } = groupInfo || {};
  const pageData = await loadGroupPagePayload(precomputedSlug(group));
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
    <GroupPageView
      content={content}
      deforestationMap={deforestationMap}
      description={description}
      externalLink={externalLink}
      group={group}
      millsTyped={millsTyped}
      pageData={pageData}
      stats={stats}
    />
  );
}
