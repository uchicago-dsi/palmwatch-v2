"use client";
import { ScatterplotLayer, GeoJsonLayer } from "@deck.gl/layers/typed";
import { MapboxOverlay, MapboxOverlayProps } from "@deck.gl/mapbox/typed";
//@ts-ignore
import Map, {
  NavigationControl,
  useControl,
  AttributionControl,
} from "react-map-gl";
import React, { useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import bbox from "@turf/bbox";
import { fitBounds } from "@math.gl/web-mercator";
import GeocoderControl from "./Geocoder";
import { colorFunctions } from "@/utils/colorFunction";
import "mapbox-gl/dist/mapbox-gl.css";
import { useActiveUmlStore } from "@/stores/activeUml";
import { Legend } from "./Legend";
import { DataProvider } from "./DataProvider";
import { useTooltipStore } from "@/stores/tooltipStore";
import { MapTooltip } from "./MapTooltip";

export type MapProps = {
  geoDataUrl: string;
  dataTable: Array<Record<string, unknown>> | object[];
  geoIdColumn: string;
  dataIdColumn: string;
  choroplethColumn: string;
  choroplethScheme: keyof typeof colorFunctions;
};

export const PalmwatchMap: React.FC<MapProps> = ({
  geoDataUrl,
  dataTable,
  geoIdColumn,
  dataIdColumn,
  choroplethColumn,
  choroplethScheme,
}) => {
  const mapRef = React.useRef<typeof Map>(null);
  const { colorFunction, scale } = colorFunctions[choroplethScheme];
  const setData = useTooltipStore(state => state.setData);
  const umlStore = useActiveUmlStore();
  const setUml = umlStore.setUml;
  const activeUml = umlStore.currentUml;

  const getColor = (data: Record<string, any>) => {
    const value = data?.[choroplethColumn];
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
      padding: 100,
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

  useEffect(() => {
    // @ts-ignore
    mapRef?.current?.flyTo({
      center: [initialMapView?.longitude, initialMapView?.latitude],
      zoom: initialMapView?.zoom,
    });
  }, [
    initialMapView?.latitude,
    initialMapView?.longitude,
    initialMapView?.zoom,
  ]);

  const layers = [
    new GeoJsonLayer({
      id: "geojson",
      data: data!,
      opacity: 0.8,
      stroked: true,
      filled: true,
      extruded: false,
      wireframe: false,
      pickable: true,
      beforeId: "bridge-minor-case",
      getLineWidth: (d) =>
        d?.properties?.[geoIdColumn] === activeUml ? 1000 : 1,
      lineWidthUnits: "meters",
      getLineColor: [0, 0, 0, 255],
      lineWidthMinPixels: 0.5,
      lineWidthMaxPixels: 5,
      onHover: ({x,y,object}) => object ? setData(x,y,object.properties['UML ID']) : setData(null,null,null),
      onClick: (info) => {
        const id = info.object.properties![geoIdColumn] as string;
        const data = dataDict?.[id] as any;
        setUml(id);
      },
      getFillColor: (d) => {
        const id = d.properties![geoIdColumn] as string;
        const data = dataDict?.[id] as any;
        const color = getColor(data);
        return color as [number, number, number, number];
      },
      updateTriggers: {
        getFillColor: [choroplethColumn, choroplethScheme],
        getLineWidth: [activeUml],
      },
    }),
  ];

  return (
    <>
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
        // @ts-ignore
        ref={mapRef}
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
      <MapTooltip />
      <Legend colorStops={scale} />
    </>
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

export const ServerMap: React.FC<{ dataUrl: string } & MapProps> = ({
  dataUrl,
  ...props
}) => {
  return (
    <DataProvider<{ umlInfo: MapProps["dataTable"] }> dataUrl={dataUrl}>
      {(data) => {
        return <PalmwatchMap {...props} dataTable={data.umlInfo} />;
      }}
    </DataProvider>
  );
};
