"use client";
import { IconLayer, GeoJsonLayer } from "@deck.gl/layers/typed";
import { MapboxOverlay, MapboxOverlayProps } from "@deck.gl/mapbox/typed";
//@ts-ignore
import Map, {
  NavigationControl,
  useControl,
  AttributionControl,
} from "react-map-gl";
import React, { useEffect, useMemo, useState } from "react";
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
import { fullYearRange } from "@/config/years";

export type MapProps = {
  geoDataUrl: string;
  dataTable: Array<Record<string, unknown>> | object[];
  geoIdColumn: string;
  dataIdColumn: string;
  choroplethColumn: string;
  choroplethScheme: keyof typeof colorFunctions;
  showLayerStepper?: boolean;
  onMapMove?: (v: any) => void;
  noFlyMap?: boolean;
};

export const PalmwatchMap: React.FC<MapProps> = ({
  geoDataUrl,
  dataTable,
  geoIdColumn,
  dataIdColumn,
  choroplethColumn,
  choroplethScheme,
  showLayerStepper,
  onMapMove,
  noFlyMap
}) => {
  const mapRef = React.useRef<typeof Map>(null);
  const [zoom, setZoom] = useState(0);
  const [currentChoroplethScheme, setCurrentChoroplethScheme] =
    useState(choroplethScheme);
  const [currentChoroplethColumn, setCurrentChoroplethColumn] =
    useState(choroplethColumn);
  const currentYear = currentChoroplethColumn.includes("score")
    ? -1
    : parseInt(currentChoroplethColumn?.split("_")?.[2]);
  const [showLayerPanel, setShowLayerPanel] = useState(false);
  const { colorFunction, scale } = colorFunctions[currentChoroplethScheme];
  const setData = useTooltipStore((state) => state.setData);
  const umlStore = useActiveUmlStore();
  const setUml = umlStore.setUml;
  const activeUml = umlStore.currentUml;

  const getColor = (data: Record<string, any>) => {
    const value = data?.[currentChoroplethColumn];
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

    const { longitude, latitude, zoom } =
      bounds[0][0] == Infinity
        ? { latitude: 0, longitude: 0, zoom: 0 }
        : fitBounds({
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
  }, [data, dataTable]);
  useEffect(() => {
    // @ts-ignore
    !noFlyMap && mapRef?.current?.flyTo({
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
      id: "main-map-layer",
      data: data!,
      opacity: 0.4,
      stroked: true,
      filled: true,
      extruded: false,
      wireframe: false,
      pickable: true,
      beforeId: "tunnel-minor-case",
      getLineWidth: (d) =>
        d?.properties?.[geoIdColumn] === activeUml ? 1000 : 1,
      lineWidthUnits: "meters",
      getLineColor: [0, 0, 0, 255],
      lineWidthMinPixels: 0.5,
      lineWidthMaxPixels: 5,
      onHover: ({ x, y, object }) =>
        object
          ? setData(x, y, object.properties["UML ID"])
          : setData(null, null, null),
      onClick: (info) => {
        const id = info.object.properties![geoIdColumn] as string;
        setUml(id);
      },
      getFillColor: (d) => {
        const id = d.properties![geoIdColumn] as string;
        const data = dataDict?.[id] as any;
        const color = getColor(data);
        return color as [number, number, number, number];
      },
      updateTriggers: {
        getFillColor: [dataDict, currentChoroplethColumn, currentChoroplethScheme],
        getLineWidth: [activeUml],
      },
    }),
    
    new IconLayer({
      id: "mill-point",
      beforeId: "tunnel-minor-case",
      data: data?.features || [],
      getPosition: (d) => {
        const data = dataDict?.[d.properties![geoIdColumn] as string] as any;
        return [data?.Longitude || 0, data?.Latitude || 0];
      },
      iconAtlas: "/icons/pin.png",
      iconMapping: {
        marker: { x: 0, y: 0, width: 128, height: 128, mask: true },
      },
      getSize: 5000,
      getIcon: (d) => "marker",
      sizeUnits: "meters",
      sizeMinPixels: 20,
      sizeMaxPixels: 50,
      pickable: false,
      visible: zoom > 5,
      opacity: 0.8,
      getColor: [0, 0, 0, 255],
      updateTriggers: {
        visible: zoom,
        getColor: [dataDict],
        getPosition: [dataDict],
        getFillColor: [currentChoroplethColumn, currentChoroplethScheme],
      },
    }),
  ];
  const incrementYear = () => {
    const index = fullYearRange.indexOf(currentYear);
    if (index < fullYearRange.length - 1) {
      setCurrentChoroplethColumn(`treeloss_km_${fullYearRange[index + 1]}`);
    }
  };
  const decrementYear = () => {
    const index = fullYearRange.indexOf(currentYear);
    if (index > 0) {
      setCurrentChoroplethColumn(`treeloss_km_${fullYearRange[index - 1]}`);
    }
  };

  const handleVariable = (variable: string) => {
    variable.includes("score")
      ? setCurrentChoroplethScheme("riskScore")
      : setCurrentChoroplethScheme("forestLoss");
    setCurrentChoroplethColumn(variable);
  };

  return (
    <div className="w-full h-full flex flex-row">
      <div
        className={`${
          showLayerPanel
            ? "w-96 opacity-100 transition-all "
            : "w-0 opacity-0 px-0"
        } prose`}
      >
        <div className="px-2">
          <h3>Map Data Layers</h3>
          <ul className="menu p-0 w-full rounded-box">
            <li>
              <button
                onClick={() => handleVariable("treeloss_km_2022")}
                className={`p-2 m-0 ${currentYear === -1 ? "" : "btn-active"}`}
              >
                Deforestation By Year
              </button>
            </li>
            <li>
              <button
                onClick={() => handleVariable("risk_score_current")}
                className={`p-2 m-0 ${currentYear !== -1 ? "" : "btn-active"}`}
              >
                Risk Scores
              </button>
            </li>
          </ul>
          {currentYear !== -1 ? (
            <>
              <h4>Data Year</h4>
              <div className="join w-full max-w-none">
                <button className="join-item btn" onClick={decrementYear}>
                  «
                </button>
                <button className="join-item btn">{currentYear}</button>
                <button className="join-item btn" onClick={incrementYear}>
                  »
                </button>
              </div>
            </>
          ) : (
            <>
              <h4>Risk Score</h4>
              <div className="join join-vertical">
                {[
                  {
                    value: "risk_score_past",
                    label: "Past Risk Score",
                  },
                  {
                    value: "risk_score_current",
                    label: "Current Risk Score",
                  },
                  {
                    value: "risk_score_future",
                    label: "Future Risk Score",
                  },
                ].map((variable) => (
                  <button
                    key={variable.value}
                    className={`join-item btn ${
                      currentChoroplethColumn === variable.value
                        ? "btn-active"
                        : ""
                    }`}
                    onClick={() => handleVariable(variable.value)}
                  >
                    {variable.label}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
      <div className="w-full h-full relative">
        <button
          onClick={() => setShowLayerPanel((p) => !p)}
          aria-label="Toggle Layer Panel"
          className="btn absolute left-2 py-0 top-[50%] z-10 bg-base-100 translate-y-[-50%] shadow-xl rounded-r-lg"
        >
          <svg
            width="24px"
            height="24px"
            version="1.1"
            viewBox="0 0 100 100"
            xmlns="http://www.w3.org/2000/svg"
            className="dark:fill-white"
          >
            <path d="m3.5 67.75c-0.011719 1.125 0.58594 2.1719 1.5625 2.7344l43.375 24c0.94141 0.52344 2.0898 0.52344 3.0312 0l43.422-24c0.99609-0.55078 1.6133-1.5977 1.6133-2.7344s-0.61719-2.1836-1.6133-2.7344l-12-6.6406 12-6.6406c0.99609-0.55078 1.6133-1.5977 1.6133-2.7344s-0.61719-2.1836-1.6133-2.7344l-12-6.6406 12-6.6406c0.99609-0.55078 1.6133-1.5977 1.6133-2.7344s-0.61719-2.1836-1.6133-2.7344l-43.328-24c-0.94141-0.52344-2.0898-0.52344-3.0312 0l-43.422 24c-0.99609 0.55078-1.6133 1.5977-1.6133 2.7344s0.61719 2.1836 1.6133 2.7344l12.078 6.6406-12.078 6.6406c-0.99609 0.55078-1.6133 1.5977-1.6133 2.7344s0.61719 2.1836 1.6133 2.7344l12.078 6.6406-12.078 6.6406c-0.99219 0.55078-1.6094 1.5977-1.6094 2.7344zm9.5781-37.5 36.922-20.422 36.922 20.422-11.922 6.6406-25 13.781-24.922-13.781zm10.484 31.703 25 13.781c0.94141 0.52344 2.0898 0.52344 3.0312 0l25-13.781 10.484 5.7969-37.078 20.422-36.922-20.422z" />
          </svg>
        </button>
        <Map
          mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
          mapStyle="mapbox://styles/dhalpern/cln0e32pu06ba01qxcgrp4gv9"
          onMoveEnd={(e) => {
            setZoom(Math.round(e.viewState.zoom));
            onMapMove && onMapMove(e);
          }}
          pitch={0}
          bearing={0}
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
        <Legend
          colorStops={scale}
          label={
            currentYear !== -1
              ? `Deforestation ${currentYear} (km2)`
              : `Risk score`
          }
        />
      </div>
    </div>
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

const MapLayerStepper: React.FC<{
  setChoroplethColumn: (column: string) => void;
  setChoroplethScheme: (scheme: keyof typeof colorFunctions) => void;
  choroplethColumn: string;
  choroplethScheme: keyof typeof colorFunctions;
}> = ({
  setChoroplethColumn,
  setChoroplethScheme,
  choroplethColumn,
  choroplethScheme,
}) => {
  return <div></div>;
};
