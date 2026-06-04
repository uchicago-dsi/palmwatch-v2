"use client";

import dynamic from "next/dynamic";
import { DataProvider } from "@/components/data-provider";
import { QueryProvider } from "@/components/query-provider";
import { useTheme } from "@/components/theme-provider";
import {
  cumulativeLossPctColumn,
  latestTreelossKmColumn,
} from "@/config/years";
import type { MapProps } from "@/features/map";

function MapPlaceholder() {
  return <div aria-hidden className="min-h-[400px] w-full" />;
}

const PalmwatchMapDynamic = dynamic(
  () => import("@/features/map").then((m) => ({ default: m.PalmwatchMap })),
  {
    ssr: false,
    loading: MapPlaceholder,
  }
);

const LIGHT_STYLE = "mapbox://styles/mapbox/light-v11";
const DARK_STYLE =
  process.env.NEXT_PUBLIC_MAPBOX_STYLE ||
  "mapbox://styles/dhalpern/cln0e32pu06ba01qxcgrp4gv9";

export interface MillsDeforestationMapProps {
  dataTable: MapProps["dataTable"];
  noFlyMap?: boolean;
}

/** Entity pages with preloaded mill rows (country, owner, group, single mill). */
export function MillsDeforestationMap({
  dataTable,
  noFlyMap,
}: MillsDeforestationMapProps) {
  return (
    <QueryProvider>
      <PalmwatchMapDynamic
        choroplethColumn={cumulativeLossPctColumn}
        choroplethScheme="cumulativeLossPct"
        dataIdColumn="UML ID"
        dataTable={dataTable}
        geoDataUrl="/data/mill-catchment.geojson"
        geoIdColumn="UML ID"
        noFlyMap={noFlyMap}
        showLayerStepper={true}
      />
    </QueryProvider>
  );
}

/** Brand page map — loads mill catchment data via the brand API. */
export function BrandDeforestationMap({ brand }: { brand: string }) {
  const { theme } = useTheme();
  const mapStyle = theme === "light" ? LIGHT_STYLE : DARK_STYLE;

  return (
    <QueryProvider>
      <DataProvider<{ umlInfo: MapProps["dataTable"] }>
        dataUrl={`/api/brand/${brand}`}
      >
        {(data) => (
          <PalmwatchMapDynamic
            choroplethColumn={latestTreelossKmColumn}
            choroplethScheme="forestLoss"
            dataIdColumn="UML ID"
            dataTable={data.umlInfo}
            geoDataUrl="/data/mill-catchment.geojson"
            geoIdColumn="UML ID"
            mapStyle={mapStyle}
            showClusters={true}
            showLayerStepper={true}
          />
        )}
      </DataProvider>
    </QueryProvider>
  );
}
