"use client";
import { useQuery } from "@tanstack/react-query";
import { latestTreelossKmColumn } from "@/config/years";
import { PalmwatchMap, SATELLITE_MAP_STYLE } from "./palmwatch-map";

export const HomePageMap = () => {
  const { data, isLoading } = useQuery(["full-data"], async () => {
    const res = await fetch("/api/full");
    return res.json();
  });
  return (
    <div className="relative h-[80vh] w-full">
      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <PalmwatchMap
          choroplethColumn={latestTreelossKmColumn}
          choroplethScheme="forestLoss"
          dataIdColumn="UML ID"
          dataTable={data!}
          geoDataUrl="/data/mill-catchment.geojson"
          geoIdColumn="UML ID"
          mapStyle={SATELLITE_MAP_STYLE}
          showClusters={true}
        />
      )}
    </div>
  );
};
