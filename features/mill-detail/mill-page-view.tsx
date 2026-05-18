"use client";
import dynamic from "next/dynamic";
import Link from "next/link";
import type React from "react";
import { useMemo } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";
import { QueryProvider } from "@/components/query-provider";
import { useTheme } from "@/components/theme-provider";
import { cumulativeLossColumn, yearRange } from "@/config/years";
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
    .split(" ")
    .map((w) =>
      w.length <= 3 || KEEP.has(w)
        ? w
        : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()
    )
    .join(" ");
}

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

// ── Annual chart ──────────────────────────────────────────────────────────────

function AnnualChart({ entry }: { entry: UmlData }) {
  const { theme } = useTheme();
  const lineColor = theme === "dark" ? "#F09595" : "#E24B4A";

  const data = useMemo(
    () =>
      yearRange.map((year) => ({
        year,
        loss:
          Number((entry as Record<string, unknown>)[`treeloss_km_${year}`]) ||
          0,
      })),
    [entry]
  );

  const maxVal = Math.max(...data.map((d) => d.loss), 0.01);
  const midVal = maxVal / 2;

  return (
    <ResponsiveContainer height="100%" width="100%">
      <LineChart data={data} margin={{ top: 8, right: 12, left: 4, bottom: 0 }}>
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
          ticks={[
            yearRange[0],
            yearRange[Math.floor(yearRange.length / 2)],
            yearRange[yearRange.length - 1],
          ]}
        />
        <YAxis
          axisLine={false}
          domain={[0, maxVal * 1.05]}
          tick={{ fill: "hsl(var(--bc) / 0.45)", fontSize: 11 }}
          tickFormatter={(v) => `${v.toFixed(1)}`}
          tickLine={false}
          ticks={[
            0,
            Number.parseFloat(midVal.toFixed(1)),
            Number.parseFloat(maxVal.toFixed(1)),
          ]}
          width={38}
        />
        <Line
          dataKey="loss"
          dot={{ fill: lineColor, r: 4, strokeWidth: 0 }}
          isAnimationActive={false}
          stroke={lineColor}
          strokeWidth={2}
          type="monotone"
        />
      </LineChart>
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
  const parentCompany = entry["Parent Company"];
  const groupName = entry["Group Name"];
  const province = entry.Province;
  const country = entry.Country;
  const rspoStatus = entry["RSPO Status"] ?? "";
  const isRspoCertified =
    rspoStatus.toLowerCase().includes("certified") &&
    !rspoStatus.toLowerCase().includes("not");

  // Composite deforestation score
  const scoreRaw = Number(entry.risk_score_current);
  const dotColor = scoreColor(scoreRaw, theme);

  // Cumulative loss over yearRange
  const cumulativeLoss = yearRange.reduce(
    (sum, year) =>
      sum +
      (Number((entry as Record<string, unknown>)[`treeloss_km_${year}`]) || 0),
    0
  );

  // Forest remaining %
  const forestRemaining = Math.round(
    (Number(entry.remaining_proportion_of_forest) || 0) * 100
  );

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
          <span>{millName}</span>
        </nav>

        <h1 className={styles.millName}>{millName}</h1>

        <div className={styles.metaRow}>
          {/* RSPO */}
          {isRspoCertified ? (
            <span className={styles.rspoBadge}>RSPO certified</span>
          ) : (
            <span className={styles.rspoNone}>Not certified</span>
          )}

          {/* Parent company */}
          {hasParent && (
            <>
              <span className={styles.metaSep}>·</span>
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

      {/* Stat cards */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Deforestation score</span>
          <div className={styles.statValueRow}>
            <span
              className={styles.scoreDot}
              style={{ background: dotColor }}
            />
            <span className={styles.statValue}>{scoreRaw.toFixed(2)}</span>
          </div>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>
            Cumulative loss ({yearRange[0]}–{yearRange[yearRange.length - 1]})
          </span>
          <div className={styles.statValueRow}>
            <span className={styles.statValue}>
              {formatKm2(cumulativeLoss)} km²
            </span>
          </div>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Forest remaining</span>
          <div className={styles.statValueRow}>
            <span className={styles.statValue}>{forestRemaining}%</span>
          </div>
          <span className={styles.statSublabel}>of original forest area</span>
        </div>
      </div>

      {/* Map + annual chart */}
      <div className={styles.visualGrid}>
        <div className={styles.mapCard}>
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
              />
            </QueryProvider>
          </div>
        </div>
        <div className={styles.chartCard}>
          <p className={styles.chartTitle}>Forest loss per year</p>
          <div className={styles.chartBody}>
            <AnnualChart entry={entry} />
          </div>
          <p className={styles.chartCaption}>
            Annual forest tree cover loss (km²)
          </p>
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
