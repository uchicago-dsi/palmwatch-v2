import { notFound } from "next/navigation";
import { QueryProvider } from "@/components/query-provider";
import { latestTreelossKmColumn } from "@/config/years";
import { PalmwatchMap } from "@/features/map";
import { MillPageView } from "@/features/mill-detail";
import { loadMillPageModel } from "@/lib/server/mill-page-data";

export const revalidate = 60;

export default async function Page({
  params,
}: {
  params: Promise<{ uml: string }>;
}) {
  const { uml: _uml } = await params;
  const uml = decodeURIComponent(_uml);
  const model = await loadMillPageModel(uml);
  if (!model) {
    notFound();
  }
  const deforestationMap = (
    <QueryProvider>
      <PalmwatchMap
        choroplethColumn={latestTreelossKmColumn}
        choroplethScheme="forestLoss"
        dataIdColumn="UML ID"
        dataTable={model.millPayload.info}
        geoDataUrl="/data/mill-catchment.geojson"
        geoIdColumn="UML ID"
      />
    </QueryProvider>
  );
  return <MillPageView deforestationMap={deforestationMap} model={model} />;
}
