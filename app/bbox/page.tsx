"use client";

import { PalmwatchMap } from "@/components/Map";
import { QueryProvider } from "@/components/QueryProvider";
import { QueryClient, useQuery } from "@tanstack/react-query";
import { Viewport } from "maplibre-gl";
import { useState } from "react";
import { WebMercatorViewport } from "@deck.gl/core/typed";
import { getStats } from "./pageConfig";
import { StatsBlock } from "@/components/StatsBlock";
import { InfoTable } from "@/components/InfoTable";

function getBounds(
  latitude: number,
  longitude: number,
  zoom: number,
  width: number,
  height: number
) {
  if (!latitude || !longitude || !zoom || !width || !height) {
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
  const [minX, maxY] = viewport.unproject([0, 0]);
  const [maxX, minY] = viewport.unproject([width, height]);
  return {
    minX,
    minY,
    maxX,
    maxY,
  };
}

export default function BboxPage() {
  return (
    <QueryProvider>
      <BboxInner />
    </QueryProvider>
  );
}

function BboxInner() {
  const [viewState, setViewState] = useState<any>({});
  const latitude = viewState?.viewState?.latitude;
  const longitude = viewState?.viewState?.longitude;
  const zoom = viewState?.viewState?.zoom;
  const width = viewState?.target?._containerWidth;
  const height = viewState?.target?._containerHeight;
  const { minX, minY, maxX, maxY } = getBounds(
    latitude,
    longitude,
    zoom,
    width,
    height
  );

  const { data, isLoading, isError } = useQuery(
    [`bbox ${minX}${maxX}${minY}${maxY}`],
    async () => {
      const res = await fetch(
        `/api/bbox?minX=${minX}&maxX=${maxX}&minY=${minY}&maxY=${maxY}`
      );
      return res.json();
    }
  );
  console.log(data)
  const stats = getStats(
    data?.mills?.length,
    data?.uniqueCountries,
    data?.averageCurrentRisk,
    data?.totalForestLoss
  )
  return (
    <div>

    <div className="h-[60vh] relative w-full">
      <PalmwatchMap
        geoDataUrl="/data/mill-catchment.geojson"
        dataTable={data?.mills || []}
        geoIdColumn="UML ID"
        dataIdColumn="UML ID"
        choroplethColumn="treeloss_km_2020"
        choroplethScheme="forestLoss"
        onMapMove={setViewState}
        noFlyMap
        />
    </div>
      <StatsBlock stats={stats} />
      <InfoTable
        data={data?.mills || []}
        columnMapping={{
          "Mill Name": "Name",
          risk_score_current: "Current Risk",
          Country: "Country",
          Province: "Province",
          District: "District",
          "Parent Company": "Parent Company",
        }}
        />
      </div>
  );
}
