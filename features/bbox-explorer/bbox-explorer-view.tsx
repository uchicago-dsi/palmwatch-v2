"use client";

import { WebMercatorViewport } from "@deck.gl/core/typed";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { InfoTable } from "@/components/info-table";
import pageStyles from "@/components/page-layout.module.css";
import { QueryProvider } from "@/components/query-provider";
import { StatsBlock } from "@/components/stats-block";
import { latestTreelossKmColumn } from "@/config/years";
import { buildRollupEntityStatTiles } from "@/domain/stat-tiles";
import { PalmwatchMap } from "@/features/map";

function getBounds(
  latitude: number,
  longitude: number,
  zoom: number,
  width: number,
  height: number
) {
  if (!(latitude && longitude && zoom && width && height)) {
    return {
      minX: 0,
      minY: 0,
      maxX: 0,
      maxY: 0,
    };
  }
  const viewport = new WebMercatorViewport({
    latitude,
    longitude,
    zoom,
    width,
    height,
  });
  const [minX, maxY] = viewport.unproject([width * 0.2, height * 0.2]);
  const [maxX, minY] = viewport.unproject([width * 0.8, height * 0.8]);
  return {
    minX,
    minY,
    maxX,
    maxY,
  };
}

export function BboxExplorerView() {
  return (
    <QueryProvider>
      <BboxExplorerInner />
    </QueryProvider>
  );
}

function BboxExplorerInner() {
  const [viewState, setViewState] = useState<{
    viewState?: { latitude?: number; longitude?: number; zoom?: number };
    target?: { _containerWidth?: number; _containerHeight?: number };
  }>({});
  const latitude = viewState?.viewState?.latitude;
  const longitude = viewState?.viewState?.longitude;
  const zoom = viewState?.viewState?.zoom;
  const width = viewState?.target?._containerWidth;
  const height = viewState?.target?._containerHeight;
  const { minX, minY, maxX, maxY } = getBounds(
    latitude ?? 0,
    longitude ?? 0,
    zoom ?? 0,
    width ?? 0,
    height ?? 0
  );

  const { data } = useQuery({
    queryKey: [`bbox ${minX}${maxX}${minY}${maxY}`],
    queryFn: async () => {
      const res = await fetch(
        `/api/bbox?minX=${minX}&maxX=${maxX}&minY=${minY}&maxY=${maxY}`
      );
      return res.json();
    },
  });

  const stats = buildRollupEntityStatTiles(
    data?.mills?.length,
    data?.uniqueCountries,
    data?.averageCurrentRisk,
    data?.totalForestLoss
  );

  return (
    <main className={pageStyles.pageShell}>
      <div className={pageStyles.pageInner}>
        <div className="relative h-[60vh] w-full">
          <PalmwatchMap
            choroplethColumn={latestTreelossKmColumn}
            choroplethScheme="forestLoss"
            dataIdColumn="UML ID"
            dataTable={data?.mills || []}
            geoDataUrl="/data/mill-catchment.geojson"
            geoIdColumn="UML ID"
            noFlyMap
            onMapMove={(e) => {
              setViewState({
                viewState: {
                  latitude: e.viewState.latitude,
                  longitude: e.viewState.longitude,
                  zoom: e.viewState.zoom,
                },
                target: {
                  _containerWidth: e.target.getContainer()?.clientWidth,
                  _containerHeight: e.target.getContainer()?.clientHeight,
                },
              });
            }}
          />
        </div>
        <StatsBlock stats={stats} />
        <InfoTable
          columnMapping={{
            "Mill Name": "Name",
            risk_score_current: "Recent Deforestation Score",
            Country: "Country",
            Province: "Province",
            District: "District",
            "Parent Company": "Parent Company",
          }}
          data={data?.mills || []}
        />
      </div>
    </main>
  );
}
