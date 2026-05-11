"use client";
import { PalmwatchMap } from "./Map";
import { useQuery } from "@tanstack/react-query";
import { latestTreelossKmColumn } from "@/config/years";

export const HomePageMap = () => {
  const { data, isLoading, isError } = useQuery(["full-data"], async () => {
    const res = await fetch("/api/full");
    return res.json();
  });
  return (
    <div className="h-[80vh] relative w-full">
      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <PalmwatchMap
          geoDataUrl="/data/mill-catchment.geojson"
          dataTable={data!}
          geoIdColumn="UML ID"
          dataIdColumn="UML ID"
          choroplethColumn={latestTreelossKmColumn}
          choroplethScheme="forestLoss"
        />
      )}
    </div>
  );
};
