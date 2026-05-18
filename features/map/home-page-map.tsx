"use client";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { cumulativeLossColumn } from "@/config/years";
import { PalmwatchMap, SATELLITE_MAP_STYLE } from "./palmwatch-map";
import { useHomeViewportStore } from "./stores/home-viewport-store";

export const HomePageMap = () => {
  const router = useRouter();
  const { viewport, setViewport } = useHomeViewportStore();
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
          choroplethColumn={cumulativeLossColumn}
          choroplethScheme="cumulativeLoss"
          dataIdColumn="UML ID"
          dataTable={data!}
          geoDataUrl="/data/mill-catchment.geojson"
          geoIdColumn="UML ID"
          initialView={viewport ?? undefined}
          mapStyle={SATELLITE_MAP_STYLE}
          onFeatureClick={(id) =>
            router.push(`/mill/${encodeURIComponent(id)}`)
          }
          onMapMove={(e) =>
            setViewport({
              longitude: e.viewState.longitude,
              latitude: e.viewState.latitude,
              zoom: e.viewState.zoom,
            })
          }
          showClusters={true}
        />
      )}
    </div>
  );
};
