"use client";
import { GeoJsonLayer, IconLayer } from "@deck.gl/layers/typed";
import { MapboxOverlay, type MapboxOverlayProps } from "@deck.gl/mapbox/typed";
import { fitBounds } from "@math.gl/web-mercator";
import { useQuery } from "@tanstack/react-query";
import bbox from "@turf/bbox";
import type { Map as MapboxGLMap } from "mapbox-gl";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Map, {
  AttributionControl,
  Layer,
  type MapRef,
  NavigationControl,
  Source,
  useControl,
} from "react-map-gl";
import { useTheme } from "@/components/theme-provider";
import { colorFunctions } from "@/lib/color-function";
import GeocoderControl from "./geocoder-control";
import "mapbox-gl/dist/mapbox-gl.css";
import { DataProvider } from "@/components/data-provider";
import {
  CUMULATIVE_LOSS_START_YEAR,
  cumulativeLossColumn,
  cumulativeYearRange,
  fullYearRange,
} from "@/config/years";
import { useActiveUmlStore } from "@/hooks/use-active-uml-store";
import { Legend } from "./legend";
import { MapTooltip } from "./map-tooltip";
import { useTooltipStore } from "./stores/tooltip-store";

export const SATELLITE_MAP_STYLE =
  "mapbox://styles/mapbox/satellite-streets-v12";
const MAP_STYLE = process.env.NEXT_PUBLIC_MAPBOX_STYLE || SATELLITE_MAP_STYLE;
const MAP_PROJECTION = { name: "mercator" } as const;

const PIN_MIN_ZOOM = 7;

// ── Brightness helpers ────────────────────────────────────────────────────────

function applyThemeBrightness(map: MapboxGLMap, theme: "light" | "dark") {
  if (!map.getLayer("satellite")) {
    return;
  }
  if (theme === "light") {
    map.setPaintProperty("satellite", "raster-brightness-min", 0.15);
    map.setPaintProperty("satellite", "raster-brightness-max", 1.0);
    map.setPaintProperty("satellite", "raster-saturation", -0.1);
  } else {
    map.setPaintProperty("satellite", "raster-brightness-min", 0.0);
    map.setPaintProperty("satellite", "raster-brightness-max", 1.0);
    map.setPaintProperty("satellite", "raster-saturation", -0.15);
  }
}

// ── Icons ─────────────────────────────────────────────────────────────────────

function IconLayersOn() {
  return (
    <svg fill="none" height="15" viewBox="0 0 24 24" width="15">
      <polygon
        points="12 2 2 7 12 12 22 7 12 2"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
      <polyline
        points="2 17 12 22 22 17"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
      <polyline
        points="2 12 12 17 22 12"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
    </svg>
  );
}

function IconClose() {
  return (
    <svg aria-hidden fill="none" height="18" viewBox="0 0 24 24" width="18">
      <path
        d="M18 6L6 18M6 6l12 12"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="2"
      />
    </svg>
  );
}

function IconLayersOff() {
  return (
    <svg fill="none" height="15" viewBox="0 0 24 24" width="15">
      <polygon
        points="12 2 2 7 12 12 22 7 12 2"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeOpacity="0.35"
        strokeWidth="2"
      />
      <polyline
        points="2 17 12 22 22 17"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeOpacity="0.35"
        strokeWidth="2"
      />
      <polyline
        points="2 12 12 17 22 12"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeOpacity="0.35"
        strokeWidth="2"
      />
      <line
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="2"
        x1="3"
        x2="21"
        y1="3"
        y2="21"
      />
    </svg>
  );
}

export type MapViewport = { longitude: number; latitude: number; zoom: number };

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
  mapStyle?: string;
  showClusters?: boolean;
  onFeatureClick?: (umlId: string) => void;
  initialView?: MapViewport;
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
  noFlyMap,
  mapStyle: mapStyleProp,
  showClusters,
  onFeatureClick,
  initialView,
}) => {
  const { theme } = useTheme();
  const mapRef = React.useRef<MapRef | null>(null);
  const [mapZoom, setMapZoom] = useState(0);
  const lastRoundedZoomRef = useRef<number | null>(null);
  const [fillVisible, setFillVisible] = useState(true);

  const syncZoomFromView = useCallback((z: number) => {
    const rounded = Math.round(z);
    if (lastRoundedZoomRef.current === rounded) {
      return;
    }
    lastRoundedZoomRef.current = rounded;
    setMapZoom(rounded);
  }, []);

  const hasFlewRef = useRef(!!initialView);
  const pendingFlyRef = useRef<{
    longitude: number;
    latitude: number;
    zoom: number;
  } | null>(null);
  const [currentChoroplethScheme, setCurrentChoroplethScheme] =
    useState(choroplethScheme);
  const [currentChoroplethColumn, setCurrentChoroplethColumn] =
    useState(choroplethColumn);
  const isCumulative = currentChoroplethColumn === cumulativeLossColumn;
  const currentYear = currentChoroplethColumn.includes("score")
    ? -1
    : isCumulative
      ? -2
      : Number.parseInt(currentChoroplethColumn?.split("_")?.[2]);
  const [showLayerPanel, setShowLayerPanel] = useState(false);
  const { colorFunction, scale } = colorFunctions[currentChoroplethScheme];
  const setData = useTooltipStore((state) => state.setData);
  const setChoroplethColumnInTooltip = useTooltipStore(
    (state) => state.setChoroplethColumn
  );
  const umlStore = useActiveUmlStore();
  const setUml = umlStore.setUml;
  const activeUml = umlStore.currentUml;

  // Clear tooltip when the map unmounts (e.g. navigating away and back)
  useEffect(() => () => setData(null, null, null), [setData]);

  // Apply brightness whenever theme changes (after initial load)
  useEffect(() => {
    const nativeMap = mapRef.current?.getMap() as MapboxGLMap | undefined;
    if (nativeMap?.isStyleLoaded()) {
      applyThemeBrightness(nativeMap, theme);
    }
  }, [theme]);

  const getColor = (data: Record<string, any>) => {
    const value = data?.[currentChoroplethColumn];
    return colorFunction(value);
  };
  const { data, isLoading, isError } = useQuery<GeoJSON.FeatureCollection>(
    ["geoData"],
    async () => await fetch(geoDataUrl).then((res) => res.json())
  );
  const { initialMapView, dataDict } = useMemo(() => {
    if (isLoading || isError) {
      return {};
    }
    const dataDict: { [key: string]: unknown } = {};
    for (const row of dataTable) {
      const r = row as Record<string, unknown>;
      const cumLoss = cumulativeYearRange.reduce(
        (sum, yr) => sum + (Number(r[`treeloss_km_${yr}`]) || 0),
        0
      );
      dataDict[r[dataIdColumn] as string] = {
        ...r,
        [cumulativeLossColumn]: cumLoss,
      };
    }

    const filteredGeoFeatures =
      data?.features?.filter((feature) => {
        const id = feature.properties![geoIdColumn] as string;
        return id in dataDict;
      }) ?? [];

    const singleMillFocus = dataTable.length === 1;

    const lngs: number[] = [];
    const lats: number[] = [];
    for (const row of dataTable) {
      const r = row as Record<string, unknown>;
      const lng = Number(r.Longitude);
      const lat = Number(r.Latitude);
      if (
        Number.isFinite(lng) &&
        Number.isFinite(lat) &&
        Math.abs(lat) <= 90 &&
        Math.abs(lng) <= 180
      ) {
        lngs.push(lng);
        lats.push(lat);
      }
    }

    let bounds: [[number, number], [number, number]];
    let usePolygonFit = false;

    if (filteredGeoFeatures.length > 0) {
      // Always prefer polygon bboxes — more accurate than mill pin coordinates
      const mapBbox = bbox({
        type: "FeatureCollection",
        features: filteredGeoFeatures,
      });
      bounds = [
        [mapBbox[0], mapBbox[1]],
        [mapBbox[2], mapBbox[3]],
      ];
      usePolygonFit = true;
    } else if (lngs.length > 0) {
      let minLng = Math.min(...lngs);
      let maxLng = Math.max(...lngs);
      let minLat = Math.min(...lats);
      let maxLat = Math.max(...lats);
      if (minLng === maxLng) {
        minLng -= 0.02;
        maxLng += 0.02;
      }
      if (minLat === maxLat) {
        minLat -= 0.02;
        maxLat += 0.02;
      }
      bounds = [
        [minLng, minLat],
        [maxLng, maxLat],
      ];
    } else {
      bounds = [
        [Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY],
        [Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY],
      ];
    }

    let longitude: number;
    let latitude: number;
    let zoom: number;
    if (
      bounds[0][0] === Number.POSITIVE_INFINITY ||
      !Number.isFinite(bounds[0][0])
    ) {
      longitude = 0;
      latitude = 0;
      zoom = 1.5;
    } else if (usePolygonFit) {
      const fitted = fitBounds({
        width: 800,
        height: 600,
        bounds,
        padding: 88,
        ...(singleMillFocus ? { maxZoom: 13 } : {}),
      });
      longitude = fitted.longitude;
      latitude = fitted.latitude;
      zoom = singleMillFocus ? Math.max(2, fitted.zoom - 0.9) : fitted.zoom;
    } else {
      const fitted = fitBounds({
        width: 800,
        height: 600,
        bounds,
        padding: 100,
      });
      longitude = fitted.longitude;
      latitude = fitted.latitude;
      zoom = fitted.zoom;
    }
    return {
      initialMapView: {
        longitude,
        latitude,
        zoom,
      },
      dataDict,
    };
  }, [data, dataTable, dataIdColumn, geoIdColumn, isLoading, isError]);

  const filteredGeoData = useMemo(() => {
    if (!(data?.features && dataDict)) {
      return data ?? null;
    }
    return {
      type: "FeatureCollection" as const,
      features: data.features.filter(
        (f) => (f.properties?.[geoIdColumn] as string) in dataDict
      ),
    };
  }, [data, dataDict, geoIdColumn]);

  const millPinFeatures = useMemo(() => {
    if (!(data?.features && dataDict)) {
      return [];
    }
    return data.features.filter((f) => {
      const id = f.properties![geoIdColumn] as string;
      if (!(id in dataDict)) {
        return false;
      }
      const row = dataDict[id] as Record<string, unknown>;
      const lng = Number(row.Longitude);
      const lat = Number(row.Latitude);
      return (
        Number.isFinite(lat) &&
        Number.isFinite(lng) &&
        Math.abs(lat) <= 90 &&
        Math.abs(lng) <= 180
      );
    });
  }, [data, dataDict, geoIdColumn]);

  const millPointsGeoJSON = useMemo<GeoJSON.FeatureCollection | null>(() => {
    if (!showClusters) {
      return null;
    }
    const features: GeoJSON.Feature[] = [];
    for (const row of dataTable) {
      const r = row as Record<string, unknown>;
      const lng = Number(r.Longitude);
      const lat = Number(r.Latitude);
      if (
        Number.isFinite(lng) &&
        Number.isFinite(lat) &&
        Math.abs(lat) <= 90 &&
        Math.abs(lng) <= 180
      ) {
        features.push({
          type: "Feature",
          geometry: { type: "Point", coordinates: [lng, lat] },
          properties: {},
        });
      }
    }
    return { type: "FeatureCollection", features };
  }, [dataTable, showClusters]);

  useEffect(() => {
    if (initialMapView?.zoom != null && Number.isFinite(initialMapView.zoom)) {
      syncZoomFromView(initialMapView.zoom);
    }
  }, [
    initialMapView?.zoom,
    initialMapView?.latitude,
    initialMapView?.longitude,
    syncZoomFromView,
  ]);

  useEffect(() => {
    setChoroplethColumnInTooltip(currentChoroplethColumn);
  }, [currentChoroplethColumn, setChoroplethColumnInTooltip]);

  useEffect(() => {
    if (noFlyMap) {
      return;
    }
    if (
      !(
        initialMapView &&
        Number.isFinite(initialMapView.latitude) &&
        Number.isFinite(initialMapView.longitude) &&
        Number.isFinite(initialMapView.zoom)
      )
    ) {
      return;
    }
    if (hasFlewRef.current) {
      return;
    }

    if (mapRef.current) {
      hasFlewRef.current = true;
      pendingFlyRef.current = null;
      mapRef.current.flyTo({
        center: [initialMapView.longitude, initialMapView.latitude],
        zoom: initialMapView.zoom,
      });
    } else {
      // Map not mounted yet — store the target and let onLoad execute it
      pendingFlyRef.current = {
        longitude: initialMapView.longitude,
        latitude: initialMapView.latitude,
        zoom: initialMapView.zoom,
      };
    }
  }, [
    initialMapView?.latitude,
    initialMapView?.longitude,
    initialMapView?.zoom,
    noFlyMap,
  ]);

  const fillOpacity = theme === "light" ? 0.35 : 0.45;
  const mapDetailZoom = !showClusters || mapZoom >= PIN_MIN_ZOOM;
  const polygonFillVisible = fillVisible && mapDetailZoom;

  const layers = [
    new GeoJsonLayer({
      id: "main-map-layer",
      data: (filteredGeoData ?? data)!,
      opacity: fillOpacity,
      stroked: true,
      filled: true,
      extruded: false,
      wireframe: false,
      pickable: true,
      visible: polygonFillVisible,
      getLineWidth: (d) => (d?.properties?.[geoIdColumn] === activeUml ? 4 : 1),
      lineWidthUnits: "pixels",
      getLineColor: [255, 255, 255, 120],
      lineWidthMinPixels: 0.5,
      lineWidthMaxPixels: 6,
      onHover: ({ x, y, object }) =>
        object
          ? setData(x, y, object.properties["UML ID"])
          : setData(null, null, null),
      onClick: (info) => {
        const id = info.object.properties![geoIdColumn] as string;
        if (onFeatureClick) {
          onFeatureClick(id);
        } else {
          setUml(id);
        }
      },
      getFillColor: (d) => {
        const id = d.properties![geoIdColumn] as string;
        const data = dataDict?.[id] as any;
        const color = getColor(data);
        return color as [number, number, number, number];
      },
      updateTriggers: {
        getFillColor: [
          dataDict,
          currentChoroplethColumn,
          currentChoroplethScheme,
        ],
        getLineWidth: [activeUml],
        opacity: [fillOpacity],
        visible: [polygonFillVisible, fillVisible, showClusters, mapZoom],
      },
    }),

    new IconLayer({
      id: "mill-point",
      data: millPinFeatures,
      getPosition: (d) => {
        const row = dataDict?.[d.properties![geoIdColumn] as string] as Record<
          string,
          unknown
        >;
        return [Number(row.Longitude), Number(row.Latitude)];
      },
      iconAtlas: "/icons/pin.png",
      iconMapping: {
        marker: { x: 0, y: 0, width: 128, height: 128, mask: true },
      },
      getSize: 28,
      getIcon: () => "marker",
      sizeUnits: "pixels",
      sizeMinPixels: 12,
      sizeMaxPixels: 40,
      pickable: false,
      visible: mapZoom >= PIN_MIN_ZOOM,
      opacity: 0.9,
      getColor: [0, 0, 0, 255],
      updateTriggers: {
        visible: [mapZoom],
        getColor: [dataDict],
        getPosition: [dataDict],
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
    if (variable.includes("score")) {
      setCurrentChoroplethScheme("riskScore");
    } else if (variable === cumulativeLossColumn) {
      setCurrentChoroplethScheme("cumulativeLoss");
    } else {
      setCurrentChoroplethScheme("forestLoss");
    }
    setCurrentChoroplethColumn(variable);
  };

  const layerControlsVisible = mapDetailZoom;

  useEffect(() => {
    if (!layerControlsVisible && showLayerPanel) {
      setShowLayerPanel(false);
    }
  }, [layerControlsVisible, showLayerPanel]);

  return (
    <div className="flex h-full w-full">
      <div className="relative h-full min-h-0 w-full">
        <Map
          attributionControl={false}
          bearing={0}
          initialViewState={{
            latitude: 0,
            longitude: 0,
            zoom: 1,
            pitch: 0,
            bearing: 0,
            ...initialMapView,
            ...(initialView ?? {}),
          }}
          mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
          mapStyle={mapStyleProp ?? MAP_STYLE}
          onLoad={(e) => {
            syncZoomFromView(e.target.getZoom());
            applyThemeBrightness(e.target as unknown as MapboxGLMap, theme);
            if (!(noFlyMap || hasFlewRef.current) && pendingFlyRef.current) {
              const { longitude, latitude, zoom } = pendingFlyRef.current;
              hasFlewRef.current = true;
              pendingFlyRef.current = null;
              mapRef.current?.flyTo({ center: [longitude, latitude], zoom });
            }
          }}
          onMove={(e) => syncZoomFromView(e.viewState.zoom)}
          onMoveEnd={(e) => {
            syncZoomFromView(e.viewState.zoom);
            onMapMove && onMapMove(e);
          }}
          pitch={0}
          projection={MAP_PROJECTION}
          ref={mapRef}
          reuseMaps={true}
          style={{ width: "100%", height: "100%" }}
        >
          <GeocoderControl
            mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN!}
            position="top-left"
          />
          <NavigationControl showCompass={false} visualizePitch={false} />
          <AttributionControl
            compact={true}
            customAttribution={["© The University of Chicago"]}
          />

          <DeckGLOverlay interleaved={true} layers={layers} />
          {showClusters && millPointsGeoJSON && (
            <Source
              cluster={true}
              clusterMaxZoom={PIN_MIN_ZOOM - 1}
              clusterRadius={45}
              data={millPointsGeoJSON}
              id="mill-clusters"
              type="geojson"
            >
              <Layer
                filter={["has", "point_count"]}
                id="clusters"
                maxzoom={PIN_MIN_ZOOM}
                paint={{
                  "circle-color": [
                    "step",
                    ["get", "point_count"],
                    "#FCA5A5",
                    10,
                    "#EF4444",
                    50,
                    "#DC2626",
                    200,
                    "#991B1B",
                  ],
                  "circle-radius": [
                    "step",
                    ["get", "point_count"],
                    14,
                    10,
                    18,
                    50,
                    22,
                    200,
                    28,
                  ],
                  "circle-opacity": 0.88,
                  "circle-stroke-width": 2,
                  "circle-stroke-color": "rgba(255,255,255,0.5)",
                }}
                type="circle"
              />
              <Layer
                filter={["has", "point_count"]}
                id="cluster-count"
                layout={{
                  "text-field": "{point_count_abbreviated}",
                  "text-font": ["DIN Offc Pro Medium", "Arial Unicode MS Bold"],
                  "text-size": 12,
                }}
                maxzoom={PIN_MIN_ZOOM}
                paint={{ "text-color": "#ffffff" }}
                type="symbol"
              />
              <Layer
                filter={["!", ["has", "point_count"]]}
                id="unclustered-point"
                maxzoom={PIN_MIN_ZOOM}
                paint={{
                  "circle-color": "#F87171",
                  "circle-radius": 5,
                  "circle-opacity": 0.85,
                  "circle-stroke-width": 1,
                  "circle-stroke-color": "rgba(255,255,255,0.6)",
                }}
                type="circle"
              />
            </Source>
          )}
        </Map>

        {layerControlsVisible && showLayerPanel && (
          <aside
            aria-label="Map data layers"
            className="absolute inset-y-0 left-0 z-40 flex w-96 max-w-[min(24rem,90vw)] flex-col overflow-hidden border-base-content/10 border-r bg-base-100 shadow-xl"
            role="dialog"
          >
            <div className="flex shrink-0 items-center justify-between gap-2 border-base-content/10 border-b px-3 py-2">
              <h3 className="m-0 font-semibold text-sm">Map Data Layers</h3>
              <button
                aria-label="Close layer panel"
                className="btn btn-ghost btn-sm btn-square pointer-events-auto shrink-0"
                onClick={() => setShowLayerPanel(false)}
                type="button"
              >
                <IconClose />
              </button>
            </div>
            <div className="prose min-h-0 flex-1 overflow-y-auto px-2 py-2">
              <ul className="menu w-full rounded-box p-0">
                <li>
                  <button
                    className={`m-0 p-2 ${isCumulative ? "btn-active" : ""}`}
                    onClick={() => handleVariable(cumulativeLossColumn)}
                  >
                    Total Deforestation
                  </button>
                </li>
                <li>
                  <button
                    className={`m-0 p-2 ${!isCumulative && currentYear !== -1 ? "btn-active" : ""}`}
                    onClick={() => {
                      const idx = fullYearRange.indexOf(
                        fullYearRange[fullYearRange.length - 1]
                      );
                      handleVariable(`treeloss_km_${fullYearRange[idx]}`);
                    }}
                  >
                    Deforestation By Year
                  </button>
                </li>
                <li>
                  <button
                    className={`m-0 p-2 ${currentYear === -1 ? "btn-active" : ""}`}
                    onClick={() => handleVariable("risk_score_current")}
                  >
                    Deforestation Scores
                  </button>
                </li>
              </ul>
              {isCumulative ? (
                <p className="px-1 text-sm opacity-70">
                  Cumulative tree cover loss from {CUMULATIVE_LOSS_START_YEAR}{" "}
                  to present within mill catchment areas (km²).
                </p>
              ) : currentYear === -1 ? (
                <>
                  <h4>Deforestation Score</h4>
                  <div className="join join-vertical">
                    {[
                      {
                        value: "risk_score_past",
                        label: "Past Deforestation Score",
                      },
                      {
                        value: "risk_score_current",
                        label: "Recent Deforestation Score",
                      },
                      {
                        value: "risk_score_future",
                        label: "Future Deforestation Risk Score",
                      },
                    ].map((variable) => (
                      <button
                        className={`join-item btn ${
                          currentChoroplethColumn === variable.value
                            ? "btn-active"
                            : ""
                        }`}
                        key={variable.value}
                        onClick={() => handleVariable(variable.value)}
                      >
                        {variable.label}
                      </button>
                    ))}
                  </div>
                </>
              ) : (
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
              )}
            </div>
          </aside>
        )}

        {layerControlsVisible && !showLayerPanel && (
          <button
            aria-label="Open layer panel"
            className="btn pointer-events-auto absolute top-1/2 left-2 z-50 min-h-11 min-w-11 -translate-y-1/2 rounded-r-lg border border-base-content/10 bg-base-100 shadow-xl"
            onClick={() => setShowLayerPanel(true)}
            type="button"
          >
            <svg
              aria-hidden
              className="fill-current"
              height="24px"
              viewBox="0 0 100 100"
              width="24px"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="m3.5 67.75c-0.011719 1.125 0.58594 2.1719 1.5625 2.7344l43.375 24c0.94141 0.52344 2.0898 0.52344 3.0312 0l43.422-24c0.99609-0.55078 1.6133-1.5977 1.6133-2.7344s-0.61719-2.1836-1.6133-2.7344l-12-6.6406 12-6.6406c0.99609-0.55078 1.6133-1.5977 1.6133-2.7344s-0.61719-2.1836-1.6133-2.7344l-12-6.6406 12-6.6406c0.99609-0.55078 1.6133-1.5977 1.6133-2.7344s-0.61719-2.1836-1.6133-2.7344l-43.328-24c-0.94141-0.52344-2.0898-0.52344-3.0312 0l-43.422 24c-0.99609 0.55078-1.6133 1.5977-1.6133 2.7344s0.61719 2.1836 1.6133 2.7344l12.078 6.6406-12.078 6.6406c-0.99609 0.55078-1.6133 1.5977-1.6133 2.7344s0.61719 2.1836 1.6133 2.7344l12.078 6.6406-12.078 6.6406c-0.99219 0.55078-1.6094 1.5977-1.6094 2.7344zm9.5781-37.5 36.922-20.422 36.922 20.422-11.922 6.6406-25 13.781-24.922-13.781zm10.484 31.703 25 13.781c0.94141 0.52344 2.0898 0.52344 3.0312 0l25-13.781 10.484 5.7969-37.078 20.422-36.922-20.422z" />
            </svg>
          </button>
        )}

        {layerControlsVisible && (
          <button
            aria-label={fillVisible ? "Hide overlay" : "Show overlay"}
            onClick={() => setFillVisible((v) => !v)}
            style={{
              position: "absolute",
              bottom: "40px",
              right: "10px",
              zIndex: 50,
              background: "white",
              border: "none",
              borderRadius: "4px",
              boxShadow: "0 0 0 2px rgba(0,0,0,0.1)",
              width: "29px",
              height: "29px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#333",
              padding: 0,
            }}
            title={fillVisible ? "Hide overlay" : "Show overlay"}
            type="button"
          >
            {fillVisible ? <IconLayersOn /> : <IconLayersOff />}
          </button>
        )}
        <MapTooltip />
        {polygonFillVisible && (
          <Legend
            colorStops={scale}
            label={
              currentYear === -1
                ? "Risk score"
                : isCumulative
                  ? `Total deforestation since ${CUMULATIVE_LOSS_START_YEAR} (km²)`
                  : `Deforestation ${currentYear} (km²)`
            }
          />
        )}
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
}) => (
  <DataProvider<{ umlInfo: MapProps["dataTable"] }> dataUrl={dataUrl}>
    {(data) => <PalmwatchMap {...props} dataTable={data.umlInfo} />}
  </DataProvider>
);

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
}) => <div />;
