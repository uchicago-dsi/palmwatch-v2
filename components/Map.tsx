"use client";
import { ScatterplotLayer, GeoJsonLayer } from "@deck.gl/layers/typed";
import { MapboxOverlay, MapboxOverlayProps } from "@deck.gl/mapbox/typed";
//@ts-ignore
import Map, {
  NavigationControl,
  useControl,
  AttributionControl,
} from "react-map-gl";
import React, { useMemo } from "react";
import {
  useQuery,
  useQueryClient,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import bbox from "@turf/bbox";
import { fitBounds } from "@math.gl/web-mercator";
import GeocoderControl from "./Geocoder";
import { colorFunctions } from "@/utils/colorFunction";
import 'mapbox-gl/dist/mapbox-gl.css';

export type MapProps = {
  geoDataUrl: string;
  dataTable: Array<Record<string, unknown>> | object[];
  geoIdColumn: string;
  dataIdColumn: string;
  choroplethColumn: string;
  choroplethScheme: keyof typeof colorFunctions;
};
const queryClient = new QueryClient();

export const PalmwatchMapOuter: React.FC<MapProps> = (props) => {
  return (
    <QueryClientProvider client={queryClient}>
      <PalmwatchMapInner {...props} />
    </QueryClientProvider>
  );
};

export const PalmwatchMapInner: React.FC<MapProps> = ({
  geoDataUrl,
  dataTable,
  geoIdColumn,
  dataIdColumn,
  choroplethColumn,
  choroplethScheme,
}) => {
  const { colorFunction, scale } = colorFunctions[choroplethScheme];
  console.log(choroplethColumn);
  const getColor = (data: Record<string, any>) => {
    const value = data[choroplethColumn];
    return colorFunction(value);
  };
  const { data, isLoading, isError } = useQuery<GeoJSON.FeatureCollection>(
    ["geoData"],
    async () => {
      return await fetch(geoDataUrl).then((res) => res.json());
    }
  );
  const { initialMapView, dataDict } = useMemo(() => {
    if (isLoading || isError) {
      return {};
    }

    const dataDict: { [key: string]: unknown } = {};
    for (const row of dataTable) {
      // @ts-ignore
      dataDict[row[dataIdColumn] as string] = row;
    }
    const filteredData = {
      type: "FeatureCollection",
      features: data!.features.filter(
        (feature) => feature.properties![geoIdColumn] in dataDict
      ),
    };
    const mapBbox = bbox(filteredData);
    const bounds = [
      [mapBbox[0], mapBbox[1]],
      [mapBbox[2], mapBbox[3]],
    ] as [[number, number], [number, number]];
    const { longitude, latitude, zoom } = fitBounds({
      width: 800,
      height: 600,
      bounds,
    });
    return {
      initialMapView: {
        longitude,
        latitude,
        zoom,
      },
      dataDict,
    };
  }, [data]);

  const layers = [
    new GeoJsonLayer({
      id: "geojson",
      data: data!,
      opacity: 0.8,
      stroked: true,
      filled: true,
      extruded: false,
      wireframe: false,
      beforeId: "bridge-minor-case",
      getFillColor: (d) => {
        const id = d.properties![geoIdColumn] as string;
        const data = dataDict?.[id] as any;
        const color = getColor(data);
        return color as [number,number,number,number]
      },
      updateTriggers: {
        getFillColor: [choroplethColumn, choroplethScheme],
      },
    }),
  ];

  return (
    <Map
      mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
      mapStyle="mapbox://styles/dhalpern/cln0e32pu06ba01qxcgrp4gv9"
      initialViewState={{
        latitude: 0,
        longitude: 0,
        zoom: 1,
        pitch: 0,
        bearing: 0,
        ...initialMapView,
      }}
      reuseMaps={true}
    >
      <GeocoderControl
        mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN!}
        position="top-left"
      />
      <NavigationControl />
      <AttributionControl
        compact={true}
        customAttribution={["© The University of Chicago"]}
      />

      <DeckGLOverlay layers={layers} interleaved={true} />
    </Map>
  );
};
function DeckGLOverlay(
  props: MapboxOverlayProps & {
    interleaved?: boolean;
  }
) {
  const overlay = useControl<MapboxOverlay>(() => new MapboxOverlay(props));
  overlay.setProps(props);
  return null;
}
