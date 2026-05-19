"use client";
import { DataProvider } from "@/components/data-provider";
import { useTheme } from "@/components/theme-provider";
import { latestTreelossKmColumn } from "@/config/years";
import { type MapProps, PalmwatchMap } from "@/features/map/palmwatch-map";

const LIGHT_STYLE = "mapbox://styles/mapbox/light-v11";
const DARK_STYLE =
  process.env.NEXT_PUBLIC_MAPBOX_STYLE ||
  "mapbox://styles/dhalpern/cln0e32pu06ba01qxcgrp4gv9";

export default function BrandMap({ brand }: { brand: string }) {
  const { theme } = useTheme();
  const mapStyle = theme === "light" ? LIGHT_STYLE : DARK_STYLE;
  return (
    <DataProvider<{ umlInfo: MapProps["dataTable"] }>
      dataUrl={`/api/brand/${brand}`}
    >
      {(data) => (
        <PalmwatchMap
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
  );
}
