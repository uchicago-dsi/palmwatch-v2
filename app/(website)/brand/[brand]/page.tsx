import { ServerIqr } from "@/components/iqr-over-time-line-chart";
import { latestTreelossKmColumn } from "@/config/years";
import { BrandPageView } from "@/features/brand-detail";
import { ServerMap } from "@/features/map";
import { loadBrandPageModel } from "@/lib/server/brand-page-data";

export const revalidate = 60;

export default async function Page({
  params,
}: {
  params: Promise<{ brand: string }>;
}) {
  const { brand: _brand } = await params;
  const brand = decodeURIComponent(_brand);
  const loaded = await loadBrandPageModel(brand);
  if (!loaded.ok) {
    if (loaded.reason === "precomputed") {
      return (
        <div>
          Could not load precomputed data for brand {`"${brand}"`}. Please try
          again later.
        </div>
      );
    }
    return (
      <div>
        Could not find brand {`"${brand}"`}. Please contact administrator.
      </div>
    );
  }
  const { model } = loaded;
  return (
    <BrandPageView
      brandIqrFigure={
        <ServerIqr dataUrl={`/api/brand/${model.brand}`} type="brand" />
      }
      brandMapFigure={
        <ServerMap
          choroplethColumn={latestTreelossKmColumn}
          choroplethScheme="forestLoss"
          dataIdColumn="UML ID"
          dataTable={[]}
          dataUrl={`/api/brand/${model.brand}`}
          geoDataUrl="/data/mill-catchment.geojson"
          geoIdColumn="UML ID"
        />
      }
      model={model}
    />
  );
}
