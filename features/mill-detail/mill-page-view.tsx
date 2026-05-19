"use client";
import dynamic from "next/dynamic";
import Link from "next/link";
import type React from "react";
import { useMemo } from "react";
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";
import { QueryProvider } from "@/components/query-provider";
import { useTheme } from "@/components/theme-provider";
import { cumulativeLossColumn, maxYear, yearRange } from "@/config/years";
import type { UmlData } from "@/domain";
import type { MillPageModel } from "@/lib/server/mill-page-data";
import styles from "./mill.module.css";

// ── Dynamic map ───────────────────────────────────────────────────────────────

const PalmwatchMapDynamic = dynamic(
  () =>
    import("@/features/map/palmwatch-map").then((m) => ({
      default: m.PalmwatchMap,
    })),
  { ssr: false, loading: () => <div className={styles.mapPlaceholder} /> }
);

// ── Types ─────────────────────────────────────────────────────────────────────

export type MillPageViewProps = {
  model: MillPageModel;
  cmsContent?: React.ReactNode;
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function toTitleCase(str: string): string {
  const KEEP = new Set([
    "A",
    "AN",
    "IN",
    "OF",
    "AT",
    "BY",
    "SA",
    "CV",
    "NV",
    "AG",
    "PT",
  ]);
  return str
    .trim()
    .split(" ")
    .map((w) =>
      w.length <= 3 || KEEP.has(w)
        ? w
        : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()
    )
    .join(" ");
}

const allYearsSince2001 = Array.from(
  { length: maxYear - 2001 + 1 },
  (_, i) => 2001 + i
);

function formatKm2(v: number): string {
  if (v >= 1000) {
    return `${(v / 1000).toFixed(1)}k`;
  }
  return v.toFixed(1);
}

function scoreColor(score: number, theme: "dark" | "light"): string {
  if (score > 3.05) {
    return theme === "dark" ? "#F87171" : "#DC2626";
  }
  if (score >= 2.85) {
    return theme === "dark" ? "#FB923C" : "#EA580C";
  }
  return theme === "dark" ? "#FDE047" : "#CA8A04";
}

// ── Forest area breakdown ─────────────────────────────────────────────────────

const AREA_TIERS = [
  {
    key: "total" as const,
    label: "Total catchment area",
    lightColor: "#64748B",
    darkColor: "#94A3B8",
  },
  {
    key: "forest" as const,
    label: "Total forest area",
    lightColor: "#16A34A",
    darkColor: "#4ADE80",
  },
  {
    key: "loss" as const,
    label: "Total forest loss",
    lightColor: "#DC2626",
    darkColor: "#F87171",
  },
];

function AreaBreakdownCard({ entry }: { entry: UmlData }) {
  const { theme } = useTheme();
  const totalArea = Number(entry.km_area) || 0;
  const totalForestArea = Number(entry.km_forest_area_00) || 0;
  const totalForestLoss = useMemo(() => {
    let sum = 0;
    for (let y = 2001; y <= maxYear; y++) {
      sum +=
        Number((entry as Record<string, unknown>)[`treeloss_km_${y}`]) || 0;
    }
    return Math.min(sum, totalForestArea);
  }, [entry, totalForestArea]);

  const forestPct =
    totalArea > 0 ? Math.sqrt(totalForestArea / totalArea) * 100 : 0;
  const lossPct =
    totalArea > 0 ? Math.sqrt(totalForestLoss / totalArea) * 100 : 0;
  const values = {
    total: totalArea,
    forest: totalForestArea,
    loss: totalForestLoss,
  };

  return (
    <div className={styles.chartCardFixed}>
      <p className={styles.chartTitle}>Forest area breakdown</p>
      <div className={styles.areaVizWrap}>
        <div className={styles.areaViz}>
          <div className={styles.areaTotal}>
            <div
              className={styles.areaForest}
              style={{ width: `${forestPct}%`, height: `${forestPct}%` }}
            >
              <div
                className={styles.areaLoss}
                style={{
                  width:
                    forestPct > 0 ? `${(lossPct / forestPct) * 100}%` : "0%",
                  height:
                    forestPct > 0 ? `${(lossPct / forestPct) * 100}%` : "0%",
                }}
              />
            </div>
          </div>
        </div>
        <div className={styles.areaLegend}>
          {AREA_TIERS.map(({ key, label, lightColor, darkColor }) => (
            <div className={styles.areaLegendRow} key={key}>
              <span
                className={styles.areaLegendSwatch}
                style={{
                  background: theme === "dark" ? darkColor : lightColor,
                }}
              />
              <span className={styles.areaLegendLabel}>{label}</span>
              <span className={styles.areaLegendValue}>
                {formatKm2(values[key])} km²
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Annual loss chart (2001–maxYear) ─────────────────────────────────────────

function AnnualLossFullChart({ entry }: { entry: UmlData }) {
  const { theme } = useTheme();
  const barColor = theme === "dark" ? "#F09595" : "#E24B4A";

  const data = useMemo(
    () =>
      allYearsSince2001.map((year) => ({
        year,
        loss:
          Number((entry as Record<string, unknown>)[`treeloss_km_${year}`]) ||
          0,
      })),
    [entry]
  );

  const maxVal = Math.max(...data.map((d) => d.loss), 0.01);
  const firstYear = allYearsSince2001[0];
  const lastYear = allYearsSince2001[allYearsSince2001.length - 1];
  const midYear = Math.round((firstYear + lastYear) / 2);

  return (
    <ResponsiveContainer height="100%" width="100%">
      <ComposedChart
        data={data}
        margin={{ top: 8, right: 12, left: 4, bottom: 0 }}
      >
        <CartesianGrid
          stroke="hsl(var(--bc) / 0.06)"
          strokeDasharray="3 3"
          vertical={false}
        />
        <XAxis
          axisLine={{ stroke: "hsl(var(--bc) / 0.1)" }}
          dataKey="year"
          tick={{ fill: "hsl(var(--bc) / 0.45)", fontSize: 11 }}
          tickLine={false}
          ticks={[firstYear, midYear, lastYear]}
        />
        <YAxis
          axisLine={false}
          domain={[0, maxVal * 1.1]}
          tick={{ fill: "hsl(var(--bc) / 0.45)", fontSize: 11 }}
          tickFormatter={(v) => formatKm2(v)}
          tickLine={false}
          ticks={[
            0,
            Number.parseFloat((maxVal / 2).toFixed(1)),
            Number.parseFloat(maxVal.toFixed(1)),
          ]}
          width={38}
        />
        <Bar
          dataKey="loss"
          fill={barColor}
          isAnimationActive={false}
          opacity={0.75}
          radius={[2, 2, 0, 0]}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function MillPageView({ model, cmsContent }: MillPageViewProps) {
  const { theme } = useTheme();
  const { millPayload } = model;
  const entry = millPayload.info[0] as UmlData | undefined;
  const brands = millPayload.brands;

  if (!entry) {
    return <div>Mill not found.</div>;
  }

  const millName = toTitleCase(entry["Mill Name"]);
  const altName = entry["Alternative name"]?.trim() || null;
  const parentCompany = entry["Parent Company"]?.trim() ?? "";
  const groupName = entry["Group Name"]?.trim() ?? "";
  const province = entry.Province;
  const country = entry.Country;
  const rspoStatus = entry["RSPO Status"] ?? "";
  const isRspoCertified =
    rspoStatus.toLowerCase().includes("certified") &&
    !rspoStatus.toLowerCase().includes("not");

  // Cumulative loss 2001–maxYear
  const cumulativeLoss2001 = useMemo(() => {
    let sum = 0;
    for (let y = 2001; y <= maxYear; y++) {
      sum +=
        Number((entry as Record<string, unknown>)[`treeloss_km_${y}`]) || 0;
    }
    return sum;
  }, [entry]);

  const normalizedBrands = useMemo(
    () => brands.map((b) => ({ ...b, years: b.years.map(Number) })),
    [brands]
  );

  const hasParent = parentCompany && parentCompany.trim();
  const hasGroup =
    groupName && groupName.trim() && groupName.trim() !== parentCompany?.trim();

  return (
    <div className={styles.page}>
      {/* Header */}
      <div>
        <nav className={styles.breadcrumb}>
          <Link className={styles.breadcrumbLink} href="/mills">
            Mills
          </Link>
          <span className={styles.breadcrumbSep}>/</span>
          <span className={styles.breadcrumbCurrent}>{millName}</span>
        </nav>

        <h1 className={styles.millName}>{millName}</h1>
        {altName && <p className={styles.altName}>Also known as {altName}</p>}

        <div className={styles.metaRow}>
          {/* Parent company */}
          {hasParent && (
            <>
              <span>
                Owned by{" "}
                <Link
                  className={styles.metaLink}
                  href={`/owner/${encodeURIComponent(parentCompany)}`}
                >
                  {toTitleCase(parentCompany)}
                </Link>
              </span>
            </>
          )}

          {/* Group */}
          {hasGroup && (
            <>
              <span className={styles.metaSep}>·</span>
              <span>
                Group:{" "}
                <Link
                  className={styles.metaLink}
                  href={`/group/${encodeURIComponent(groupName)}`}
                >
                  {toTitleCase(groupName)}
                </Link>
              </span>
            </>
          )}

          {/* Location */}
          {(province || country) && (
            <>
              <span className={styles.metaSep}>·</span>
              <span>{[province, country].filter(Boolean).join(", ")}</span>
            </>
          )}
        </div>
      </div>

      {/* Stat cards — row 1 */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Total forest loss</span>
          <div className={styles.statValueRow}>
            <span className={styles.statValue}>
              {formatKm2(cumulativeLoss2001)} km²
            </span>
          </div>
          <span className={styles.statSublabel}>
            Cumulative forest loss from 2001 to {maxYear}
          </span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Catchment area</span>
          <div className={styles.statValueRow}>
            <span className={styles.statValue}>
              {formatKm2(Number(entry.km_area))} km²
            </span>
          </div>
          <span className={styles.statSublabel}>
            Overall area assigned to this mill
          </span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>RSPO certification</span>
          <span
            className={
              isRspoCertified
                ? styles.rspoCertifiedValue
                : styles.rspoUncertifiedValue
            }
          >
            {isRspoCertified ? "RSPO certified" : "Not RSPO certified"}
          </span>
          <span className={styles.statSublabel}>
            {isRspoCertified
              ? "Meets RSPO standards for responsible sourcing and production."
              : "Has not obtained RSPO certification for sustainable palm oil."}
          </span>
        </div>

        {/* Row 2 */}
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Recent deforestation score</span>
          <div className={styles.statValueRow}>
            <span className={styles.statValue}>
              {Number(entry.risk_score_current).toFixed(2)}
            </span>
          </div>
          <span className={styles.statSublabel}>
            out of 5 · higher means more recent forest loss
          </span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Past deforestation score</span>
          <div className={styles.statValueRow}>
            <span className={styles.statValue}>
              {Number(entry.risk_score_past).toFixed(2)}
            </span>
          </div>
          <span className={styles.statSublabel}>
            out of 5 · higher means more historical forest loss
          </span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Future deforestation score</span>
          <div className={styles.statValueRow}>
            <span className={styles.statValue}>
              {Number(entry.risk_score_future).toFixed(2)}
            </span>
          </div>
          <span className={styles.statSublabel}>
            out of 5 · higher means greater projected risk
          </span>
        </div>
      </div>

      {/* Area breakdown + annual loss charts */}
      <div className={styles.chartsRow}>
        <AreaBreakdownCard entry={entry} />
        <div className={styles.chartCardFixed}>
          <p className={styles.chartTitle}>Annual forest loss</p>
          <p className={styles.chartCaption}>km² per year, 2001–{maxYear}</p>
          <div className={styles.chartBody}>
            <AnnualLossFullChart entry={entry} />
          </div>
        </div>
      </div>

      {/* Map full width */}
      <div className={styles.mapCard}>
        <p className={styles.chartTitle}>
          Mill deforestation map: Forest loss in km²
        </p>
        <div className={styles.mapFrame}>
          <QueryProvider>
            <PalmwatchMapDynamic
              choroplethColumn={cumulativeLossColumn}
              choroplethScheme="cumulativeLoss"
              dataIdColumn="UML ID"
              dataTable={millPayload.info}
              geoDataUrl="/data/mill-catchment.geojson"
              geoIdColumn="UML ID"
              noFlyMap={false}
              showLayerStepper={true}
            />
          </QueryProvider>
        </div>
      </div>

      {/* Brands sourcing matrix */}
      {normalizedBrands.length > 0 && (
        <div className={styles.matrixCard}>
          <p className={styles.matrixTitle}>Brands sourcing from this mill</p>
          <div className={styles.matrixWrap}>
            <table className={styles.matrixTable}>
              <thead>
                <tr>
                  <th className={styles.matrixHeaderBrand}>Brand</th>
                  {yearRange.map((year) => (
                    <th className={styles.matrixHeaderCell} key={year}>
                      {year}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {normalizedBrands.map((brand) => (
                  <tr className={styles.matrixRow} key={brand.consumer_brand}>
                    <td className={styles.matrixBrandCell}>
                      <Link
                        className={styles.matrixBrandLink}
                        href={`/brand/${encodeURIComponent(brand.consumer_brand)}`}
                      >
                        {brand.consumer_brand}
                      </Link>
                    </td>
                    {yearRange.map((year) => (
                      <td className={styles.matrixCell} key={year}>
                        {brand.years.includes(year) ? (
                          <span className={styles.matrixDot} />
                        ) : null}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CMS content */}
      {cmsContent && <div className={styles.cmsCard}>{cmsContent}</div>}
    </div>
  );
}
