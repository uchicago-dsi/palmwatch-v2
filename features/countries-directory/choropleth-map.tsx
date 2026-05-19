"use client";
import "mapbox-gl/dist/mapbox-gl.css";
import mapboxgl from "mapbox-gl";
import React from "react";
import { feature } from "topojson-client";
import styles from "./countries-directory.module.css";
import type { CountryRow } from "./countries-directory-view";

export type IsoMap = Record<string, CountryRow>;

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? "";
const SATELLITE_STYLE = "mapbox://styles/mapbox/satellite-streets-v12";

const MAP_LEGEND = [
  { label: "500+", min: 500 },
  { label: "100–499", min: 100 },
  { label: "20–99", min: 20 },
  { label: "5–19", min: 5 },
  { label: "1–4", min: 1 },
];

function getColor(count: number): string {
  if (count >= 500) {
    return "#BD0026";
  }
  if (count >= 100) {
    return "#F03B20";
  }
  if (count >= 20) {
    return "#FD8D3C";
  }
  if (count >= 5) {
    return "#FECC5C";
  }
  return "#FFFFB2";
}

function applyBrightness(map: mapboxgl.Map, theme: "light" | "dark") {
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

function IconLayersOn() {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      height="15"
      viewBox="0 0 24 24"
      width="15"
    >
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

function IconLayersOff() {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      height="15"
      viewBox="0 0 24 24"
      width="15"
    >
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

interface Props {
  isoMap: IsoMap;
  onNavigate: (href: string) => void;
  theme: "light" | "dark";
}

export default function ChoroplethMap({ isoMap, onNavigate, theme }: Props) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const isoMapRef = React.useRef(isoMap);
  isoMapRef.current = isoMap;
  const onNavigateRef = React.useRef(onNavigate);
  onNavigateRef.current = onNavigate;
  const themeRef = React.useRef(theme);
  themeRef.current = theme;
  const mapInstanceRef = React.useRef<mapboxgl.Map | null>(null);

  const [fillVisible, setFillVisible] = React.useState(true);

  // Create map once
  React.useEffect(() => {
    const el = containerRef.current;
    if (!el) {
      return;
    }

    const map = new mapboxgl.Map({
      container: el,
      style: SATELLITE_STYLE,
      accessToken: MAPBOX_TOKEN,
      center: [20, 5],
      zoom: 1.2,
      minZoom: 1.2,
      maxZoom: 1.2,
      projection: { name: "mercator" },
      attributionControl: false,
      scrollZoom: false,
      boxZoom: false,
      dragRotate: false,
      dragPan: false,
      keyboard: false,
      doubleClickZoom: false,
      touchZoomRotate: false,
      touchPitch: false,
    });

    mapInstanceRef.current = map;

    map.addControl(
      new mapboxgl.AttributionControl({ compact: true }),
      "bottom-right"
    );

    const popup = new mapboxgl.Popup({
      closeButton: false,
      closeOnClick: false,
      className: "pw-country-popup",
      offset: 12,
    });

    // biome-ignore lint/complexity/noExcessiveCognitiveComplexity: map layer setup on load
    map.on("load", async () => {
      applyBrightness(map, themeRef.current);

      // Hide all text/symbol layers from the basemap
      for (const layer of map.getStyle().layers) {
        if (layer.type === "symbol") {
          map.setLayoutProperty(layer.id, "visibility", "none");
        }
      }

      const res = await fetch("/data/world-110m.json");
      if (!res.ok) {
        console.error(
          `Failed to load world map topology: ${res.status} ${res.statusText}`
        );
        return;
      }
      const topoJson = await res.json();
      const geo = feature(
        topoJson as Parameters<typeof feature>[0],
        topoJson.objects.countries as Parameters<typeof feature>[1]
      ) as unknown as GeoJSON.FeatureCollection;

      for (const f of geo.features) {
        const iso = f.id == null ? "" : String(f.id);
        const row = isoMapRef.current[iso];
        const props = f.properties as Record<string, unknown>;
        props._iso = iso;
        props._fillColor = row ? getColor(row.count) : "transparent";
        props._hasData = row ? 1 : 0;
      }

      map.addSource("countries", {
        type: "geojson",
        data: geo,
        generateId: true,
      });

      map.addLayer({
        id: "country-fill",
        type: "fill",
        source: "countries",
        paint: {
          "fill-color": ["get", "_fillColor"],
          "fill-opacity": ["get", "_hasData"],
        },
      });

      map.addLayer({
        id: "country-fill-hover",
        type: "fill",
        source: "countries",
        paint: {
          "fill-color": "#000000",
          "fill-opacity": [
            "case",
            ["boolean", ["feature-state", "hover"], false],
            0.18,
            0,
          ],
        },
      });

      map.addLayer({
        id: "country-outline",
        type: "line",
        source: "countries",
        paint: {
          "line-color": "rgba(255,255,255,0.5)",
          "line-width": 0.75,
        },
      });

      let hoveredId: number | undefined;

      map.on(
        "mousemove",
        "country-fill",
        (
          e: mapboxgl.MapMouseEvent & {
            features?: mapboxgl.MapboxGeoJSONFeature[];
          }
        ) => {
          const f = e.features?.[0];
          if (!f) {
            return;
          }
          const iso = (f.properties as Record<string, unknown>)?._iso as string;
          const row = iso ? isoMapRef.current[iso] : undefined;
          if (!row) {
            map.getCanvas().style.cursor = "";
            popup.remove();
            return;
          }

          map.getCanvas().style.cursor = "pointer";

          if (hoveredId != null) {
            map.setFeatureState(
              { source: "countries", id: hoveredId },
              { hover: false }
            );
          }
          hoveredId = f.id as number;
          map.setFeatureState(
            { source: "countries", id: hoveredId },
            { hover: true }
          );

          popup
            .setLngLat(e.lngLat)
            .setHTML(
              `<span class="pw-tt-name">${row.name}</span><span class="pw-tt-mills">${row.count.toLocaleString()} mills</span>`
            )
            .addTo(map);
        }
      );

      map.on("mouseleave", "country-fill", () => {
        map.getCanvas().style.cursor = "";
        if (hoveredId != null) {
          map.setFeatureState(
            { source: "countries", id: hoveredId },
            { hover: false }
          );
          hoveredId = undefined;
        }
        popup.remove();
      });

      map.on(
        "click",
        "country-fill",
        (
          e: mapboxgl.MapMouseEvent & {
            features?: mapboxgl.MapboxGeoJSONFeature[];
          }
        ) => {
          const f = e.features?.[0];
          if (!f) {
            return;
          }
          const iso = (f.properties as Record<string, unknown>)?._iso as string;
          const row = iso ? isoMapRef.current[iso] : undefined;
          if (row) {
            onNavigateRef.current(row.href);
          }
        }
      );
    });

    return () => {
      mapInstanceRef.current = null;
      popup.remove();
      map.remove();
    };
  }, []);

  // Update satellite brightness when theme changes
  React.useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map?.isStyleLoaded()) {
      return;
    }
    applyBrightness(map, theme);
  }, [theme]);

  // Toggle fill layer visibility
  React.useEffect(() => {
    const map = mapInstanceRef.current;
    if (map?.getLayer("country-fill")) {
      map.setLayoutProperty(
        "country-fill",
        "visibility",
        fillVisible ? "visible" : "none"
      );
    }
  }, [fillVisible]);

  return (
    <div className={styles.mapContainer}>
      <div className={styles.mapboxMap} ref={containerRef} />
      <button
        aria-label={fillVisible ? "Hide overlay" : "Show overlay"}
        className={styles.overlayToggle}
        onClick={() => setFillVisible((v) => !v)}
        title={fillVisible ? "Hide overlay" : "Show overlay"}
        type="button"
      >
        {fillVisible ? <IconLayersOn /> : <IconLayersOff />}
      </button>
      <div className={styles.mapLegend}>
        <div className={styles.mapLegendTitle}>Mills</div>
        {MAP_LEGEND.map((item) => (
          <div className={styles.mapLegendItem} key={item.label}>
            <span
              className={styles.mapLegendSwatch}
              style={{ background: getColor(item.min) }}
            />
            <span className={styles.mapLegendLabel}>{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
