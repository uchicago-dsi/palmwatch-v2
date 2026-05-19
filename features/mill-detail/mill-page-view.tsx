"use client";
import Link from "next/link";
import type React from "react";
import { useMemo } from "react";
import {
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useTheme } from "@/components/theme-provider";
import { maxYear, yearRange } from "@/config/years";
import type { UmlData } from "@/domain";
import type { MillPageModel } from "@/server/mill-page-data";
import { MillPageHeader } from "./components/mill-page-header";
import styles from "./mill.module.css";

// ── Types ─────────────────────────────────────────────────────────────────────

export type MillPageViewProps = {
  model: MillPageModel;
  cmsContent?: React.ReactNode;
  deforestationMap: React.ReactNode;
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

function AnnualLossTooltip({ active, payload, label }: any) {
  if (!(active && payload?.length)) {
    return null;
  }
  return (
    <div className={styles.chartTooltip}>
      <p className={styles.chartTooltipYear}>{label}</p>
      {payload.map((p: any) => (
        <div className={styles.chartTooltipRow} key={p.dataKey}>
          <span
            className={styles.chartTooltipSwatch}
            style={{
              background: p.stroke,
              opacity: p.strokeDasharray ? 0.5 : 1,
            }}
          />
          <span className={styles.chartTooltipLabel}>{p.name}</span>
          <span className={styles.chartTooltipValue}>
            {p.value == null ? "—" : `${formatKm2(p.value)} km²`}
          </span>
        </div>
      ))}
    </div>
  );
}

function AnnualLossFullChart({
  entry,
  medianMill,
}: {
  entry: UmlData;
  medianMill?: Record<string, number>[] | null;
}) {
  const { theme } = useTheme();
  const lineColor = theme === "dark" ? "#F09595" : "#E24B4A";
  const medianColor =
    theme === "dark" ? "rgba(255,255,255,0.35)" : "rgba(0,0,0,0.3)";
  const medianRow = medianMill?.[0];

  const data = useMemo(
    () =>
      allYearsSince2001.map((year) => ({
        year,
        loss:
          Number((entry as Record<string, unknown>)[`treeloss_km_${year}`]) ||
          0,
        median: medianRow ? (medianRow[`median${year}`] ?? null) : null,
      })),
    [entry, medianRow]
  );

  const maxVal = Math.max(
    ...data.map((d) => d.loss),
    ...data.map((d) => d.median ?? 0),
    0.01
  );
  const firstYear = allYearsSince2001[0];
  const lastYear = allYearsSince2001[allYearsSince2001.length - 1];
  const midYear = Math.round((firstYear + lastYear) / 2);

  return (
    <div className={styles.chartWithLegend}>
      <div className={styles.chartLegend}>
        <span className={styles.chartLegendItem}>
          <span
            className={styles.chartLegendLine}
            style={{ background: lineColor }}
          />
          This mill
        </span>
        {medianRow && (
          <span className={styles.chartLegendItem}>
            <span
              className={styles.chartLegendDash}
              style={{ borderColor: medianColor }}
            />
            Median mill
          </span>
        )}
      </div>
      <div className={styles.chartInner}>
        <ResponsiveContainer height="100%" width="100%">
          <ComposedChart
            data={data}
            margin={{ top: 4, right: 12, left: 4, bottom: 0 }}
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
            <Tooltip
              content={<AnnualLossTooltip />}
              cursor={{ stroke: "hsl(var(--bc) / 0.1)", strokeWidth: 1 }}
            />
            <Line
              dataKey="loss"
              dot={false}
              isAnimationActive={false}
              name="This mill"
              stroke={lineColor}
              strokeWidth={2}
              type="monotone"
            />
            {medianRow && (
              <Line
                dataKey="median"
                dot={false}
                isAnimationActive={false}
                name="Median mill"
                stroke={medianColor}
                strokeDasharray="4 3"
                strokeWidth={1.5}
                type="monotone"
              />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function MillPageView({
  model,
  cmsContent,
  deforestationMap,
}: MillPageViewProps) {
  const { theme } = useTheme();
  const { millPayload, medianMill } = model;
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
    groupName &&
    groupName.trim() &&
    groupName.trim().toUpperCase() !== "UNKNOWN" &&
    groupName.trim() !== parentCompany?.trim();

  return (
    <div className={styles.page}>
      <MillPageHeader
        altName={altName}
        country={country}
        formatTitle={toTitleCase}
        groupName={groupName}
        millName={millName}
        parentCompany={parentCompany}
        province={province}
      />

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
            <AnnualLossFullChart entry={entry} medianMill={medianMill} />
          </div>
        </div>
      </div>

      {/* Map full width */}
      <div className={styles.mapCard}>
        <p className={styles.chartTitle}>
          Mill deforestation map: Forest loss in km²
        </p>
        <div className={styles.mapFrame}>{deforestationMap}</div>
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

      {/* Mill record */}
      <div className={styles.recordCard}>
        <p className={styles.recordTitle}>Mill record</p>
        <div className={styles.recordGrid}>
          {[
            { label: "Mill name", value: entry["Mill Name"] },
            { label: "UML ID", value: entry["UML ID"] },
            {
              label: "Parent company",
              value: entry["Parent Company"],
              href: entry["Parent Company"]?.trim()
                ? `/owner/${encodeURIComponent(entry["Parent Company"].trim())}`
                : undefined,
            },
            {
              label: "Group name",
              value: entry["Group Name"],
              href:
                entry["Group Name"]?.trim() &&
                entry["Group Name"].trim().toUpperCase() !== "UNKNOWN"
                  ? `/group/${encodeURIComponent(entry["Group Name"].trim())}`
                  : undefined,
            },
            {
              label: "Country",
              value: entry.Country,
              href: entry.Country?.trim()
                ? `/country/${encodeURIComponent(entry.Country.trim())}`
                : undefined,
            },
            { label: "Province", value: entry.Province },
            { label: "District", value: entry.District },
            { label: "RSPO status", value: entry["RSPO Status"] },
            {
              label: "RSPO type",
              value:
                entry["RSPO Type"] == null ? null : String(entry["RSPO Type"]),
            },
            { label: "Confidence level", value: entry["Confidence level"] },
            {
              label: "Date RSPO certification status",
              value: entry["Date RSPO Certification Status"],
            },
            { label: "GPS coordinates", value: entry["GPS coordinates"] },
          ].map(
            ({
              label,
              value,
              href,
            }: {
              label: string;
              value: string | null | undefined;
              href?: string;
            }) => (
              <div className={styles.recordItem} key={label}>
                <span className={styles.recordLabel}>{label}</span>
                {value ? (
                  href ? (
                    <Link className={styles.recordLink} href={href}>
                      {value}
                    </Link>
                  ) : (
                    <span className={styles.recordValue}>{value}</span>
                  )
                ) : (
                  <span className={styles.recordValue}>—</span>
                )}
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}
