"use client";
import Link from "next/link";
import React, { useMemo, useState } from "react";
import {
  Area,
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
import type { CountryPagePayload } from "@/domain/schemas/entity-pages";
import { CountryPageHeader } from "./components/country-page-header";
import styles from "./country.module.css";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface CountryPageViewProps {
  country: string;
  deforestationMap: React.ReactNode;
  millsTyped: UmlData[];
  pageData: CountryPagePayload;
}

interface CumulativePoint {
  cumulativeKm2: number;
  year: number;
}
interface YearlyPoint {
  annualKm2: number;
  year: number;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatKm2(v: number): string {
  if (v >= 1_000_000) {
    return `${(v / 1_000_000).toFixed(1)}M`;
  }
  if (v >= 1000) {
    return `${(v / 1000).toFixed(1)}k`;
  }
  return String(Math.round(v));
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

const allYearsSince2001 = Array.from(
  { length: maxYear - 2001 + 1 },
  (_, i) => 2001 + i
);

function millTreelossSince2001(mill: UmlData): number {
  return allYearsSince2001.reduce(
    (s, year) =>
      s + (Number(mill[`treeloss_km_${year}` as keyof UmlData]) || 0),
    0
  );
}

function computeForestTimeseries(mills: UmlData[]): CumulativePoint[] {
  let cumulative = 0;
  return allYearsSince2001.map((year) => {
    const col = `treeloss_km_${year}` as keyof UmlData;
    const annual = mills.reduce(
      (sum, mill) => sum + (Number(mill[col]) || 0),
      0
    );
    cumulative += annual;
    return { year, cumulativeKm2: Math.round(cumulative) };
  });
}

function computeYearlyTimeseries(mills: UmlData[]): YearlyPoint[] {
  return allYearsSince2001.map((year) => {
    const col = `treeloss_km_${year}` as keyof UmlData;
    const annual = mills.reduce(
      (sum, mill) => sum + (Number(mill[col]) || 0),
      0
    );
    return { year, annualKm2: Math.round(annual) };
  });
}

function getPageNumbers(current: number, total: number): (number | "...")[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  const pages: (number | "...")[] = [1];
  if (current > 3) {
    pages.push("...");
  }
  for (
    let p = Math.max(2, current - 1);
    p <= Math.min(total - 1, current + 1);
    p++
  ) {
    pages.push(p);
  }
  if (current < total - 2) {
    pages.push("...");
  }
  pages.push(total);
  return pages;
}

function toTitleCase(str: string): string {
  return str
    .split(" ")
    .map((w) =>
      w.length <= 3 ? w : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()
    )
    .join(" ");
}

// ── Icons ─────────────────────────────────────────────────────────────────────

function IconSearch() {
  return (
    <svg
      aria-hidden="true"
      className={styles.filterIcon}
      fill="none"
      height="14"
      viewBox="0 0 24 24"
      width="14"
    >
      <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="1.75" />
      <path
        d="m21 21-4.35-4.35"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.75"
      />
    </svg>
  );
}

function IconSortBoth() {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      height="11"
      viewBox="0 0 24 24"
      width="11"
    >
      <path
        d="M8 9l4-4 4 4M16 15l-4 4-4-4"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
    </svg>
  );
}

function IconSortUp() {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      height="11"
      viewBox="0 0 24 24"
      width="11"
    >
      <path
        d="M8 15l4-4 4 4"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2.5"
      />
    </svg>
  );
}

function IconSortDown() {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      height="11"
      viewBox="0 0 24 24"
      width="11"
    >
      <path
        d="M8 9l4 4 4-4"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2.5"
      />
    </svg>
  );
}

function SortIcon({ active, dir }: { active: boolean; dir: "asc" | "desc" }) {
  if (!active) {
    return (
      <span className={styles.sortIconInactive}>
        <IconSortBoth />
      </span>
    );
  }
  return (
    <span className={styles.sortIconActive}>
      {dir === "asc" ? <IconSortUp /> : <IconSortDown />}
    </span>
  );
}

// ── Cumulative chart ──────────────────────────────────────────────────────────

function CumulativeChart({ data }: { data: CumulativePoint[] }) {
  const { theme } = useTheme();
  const lineColor = theme === "dark" ? "#F09595" : "#E24B4A";
  const gradientId = "countryCumulativeGrad";

  if (data.length === 0) {
    return <div className={styles.chartBody} />;
  }

  const lastPoint = data.at(-1);
  const maxVal = lastPoint?.cumulativeKm2 ?? 0;
  const firstYear = data[0].year;
  const lastYear = lastPoint?.year ?? firstYear;
  const midYear = Math.round((firstYear + lastYear) / 2);

  return (
    <ResponsiveContainer height="100%" width="100%">
      <ComposedChart
        data={data}
        margin={{ top: 8, right: 56, left: 4, bottom: 0 }}
      >
        <defs>
          <linearGradient id={gradientId} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor={lineColor} stopOpacity={0.15} />
            <stop offset="100%" stopColor={lineColor} stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <XAxis
          axisLine={{ stroke: "hsl(var(--bc) / 0.1)" }}
          dataKey="year"
          tick={{ fill: "hsl(var(--bc) / 0.45)", fontSize: 11 }}
          tickLine={false}
          ticks={[firstYear, midYear, lastYear]}
        />
        <YAxis
          axisLine={false}
          domain={[0, maxVal || 1]}
          orientation="left"
          tick={{ fill: "hsl(var(--bc) / 0.45)", fontSize: 11 }}
          tickFormatter={formatKm2}
          tickLine={false}
          ticks={[0, Math.round((maxVal || 1) / 2), maxVal || 1]}
          width={40}
        />
        <Area
          dataKey="cumulativeKm2"
          fill={`url(#${gradientId})`}
          isAnimationActive={false}
          stroke="none"
          type="monotone"
        />
        <Line
          dataKey="cumulativeKm2"
          dot={false}
          isAnimationActive={false}
          label={({ x, y, index }: { x: number; y: number; index: number }) => {
            if (index !== data.length - 1) {
              return <g key={index} />;
            }
            return (
              <g key={index}>
                <circle cx={x} cy={y} fill={lineColor} r={3} />
                <text
                  dominantBaseline="middle"
                  fill={lineColor}
                  fontSize={11}
                  fontWeight={500}
                  textAnchor="start"
                  x={x + 6}
                  y={y}
                >
                  {formatKm2(data[index].cumulativeKm2)} km²
                </text>
              </g>
            );
          }}
          stroke={lineColor}
          strokeWidth={2}
          type="monotone"
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}

// ── Yearly chart ─────────────────────────────────────────────────────────────

function YearlyTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { value: number }[];
  label?: number;
}) {
  if (!(active && payload) || payload.length === 0) {
    return null;
  }
  const val = payload[0]?.value ?? 0;
  return (
    <div className={styles.chartTooltip}>
      <p className={styles.chartTooltipYear}>{label}</p>
      <div className={styles.chartTooltipRow}>
        <span className={styles.chartTooltipLabel}>Annual loss</span>
        <span className={styles.chartTooltipValue}>{formatKm2(val)} km²</span>
      </div>
    </div>
  );
}

function YearlyChart({ data }: { data: YearlyPoint[] }) {
  const { theme } = useTheme();
  const lineColor = theme === "dark" ? "#F09595" : "#E24B4A";
  const gradientId = "countryAnnualGrad";

  if (data.length === 0) {
    return <div className={styles.chartBody} />;
  }

  const maxVal = Math.max(...data.map((d) => d.annualKm2), 1);
  const firstYear = data[0].year;
  const lastYear = data.at(-1)?.year ?? firstYear;
  const midYear = Math.round((firstYear + lastYear) / 2);

  return (
    <ResponsiveContainer height="100%" width="100%">
      <ComposedChart
        data={data}
        margin={{ top: 8, right: 12, left: 4, bottom: 0 }}
      >
        <defs>
          <linearGradient id={gradientId} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor={lineColor} stopOpacity={0.15} />
            <stop offset="100%" stopColor={lineColor} stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <XAxis
          axisLine={{ stroke: "hsl(var(--bc) / 0.1)" }}
          dataKey="year"
          tick={{ fill: "hsl(var(--bc) / 0.45)", fontSize: 11 }}
          tickLine={false}
          ticks={[firstYear, midYear, lastYear]}
        />
        <YAxis
          axisLine={false}
          domain={[0, maxVal]}
          orientation="left"
          tick={{ fill: "hsl(var(--bc) / 0.45)", fontSize: 11 }}
          tickFormatter={formatKm2}
          tickLine={false}
          ticks={[0, Math.round(maxVal / 2), maxVal]}
          width={40}
        />
        <Tooltip
          content={<YearlyTooltip />}
          cursor={{ stroke: "hsl(var(--bc) / 0.15)", strokeWidth: 1 }}
        />
        <Area
          dataKey="annualKm2"
          fill={`url(#${gradientId})`}
          isAnimationActive={false}
          stroke="none"
          type="monotone"
        />
        <Line
          dataKey="annualKm2"
          dot={false}
          isAnimationActive={false}
          stroke={lineColor}
          strokeWidth={2}
          type="monotone"
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}

// ── Province bar chart ────────────────────────────────────────────────────────

interface ProvinceRow {
  loss: number;
  name: string;
}

const PROVINCE_LIMIT = 10;

function ProvinceChart({ mills }: { mills: UmlData[] }) {
  const [showAll, setShowAll] = useState(false);

  const allRows = useMemo<ProvinceRow[]>(() => {
    const map = new Map<string, number>();
    for (const mill of mills) {
      const prov = mill.Province?.trim();
      if (!prov) {
        continue;
      }
      map.set(prov, (map.get(prov) ?? 0) + millTreelossSince2001(mill));
    }
    return [...map.entries()]
      .map(([name, loss]) => ({ name, loss }))
      .sort((a, b) => b.loss - a.loss);
  }, [mills]);

  if (allRows.length < 3) {
    return null;
  }

  const visibleRows = showAll ? allRows : allRows.slice(0, PROVINCE_LIMIT);
  const maxLoss = allRows[0].loss || 1;
  const _hiddenCount = allRows.length - PROVINCE_LIMIT;

  return (
    <div className={styles.provinceCard}>
      <div className={styles.provinceTitleRow}>
        <p className={styles.provinceTitle}>Forest loss by province</p>
        <span className={styles.provinceSub}>km² lost since 2001</span>
      </div>
      <div className={styles.provinceList}>
        {visibleRows.map((row) => (
          <div className={styles.provinceRow} key={row.name}>
            <span className={styles.provinceName}>{row.name}</span>
            <div className={styles.provinceBarWrap}>
              <div
                className={styles.provinceBar}
                style={{ width: `${(row.loss / maxLoss) * 100}%` }}
              />
            </div>
            <span className={styles.provinceValue}>
              {formatKm2(row.loss)} km²
            </span>
          </div>
        ))}
      </div>
      {allRows.length > PROVINCE_LIMIT && (
        <button
          className={styles.provinceShowAllBtn}
          onClick={() => setShowAll((s) => !s)}
          type="button"
        >
          {showAll ? "Show less" : `Show all ${allRows.length} provinces`}
        </button>
      )}
    </div>
  );
}

// ── Mills table ───────────────────────────────────────────────────────────────

const MILLS_PAGE_SIZE = 20;
type MillSortKey =
  | "name"
  | "score"
  | "country"
  | "province"
  | "district"
  | "parentCompany";

function MillsTable({ mills }: { mills: UmlData[] }) {
  const [q, setQ] = useState("");
  const [sortKey, setSortKey] = useState<MillSortKey>("score");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);

  const showFilter = mills.length > 10;

  const filtered = useMemo(() => {
    if (!q.trim()) {
      return mills;
    }
    const lq = q.trim().toLowerCase();
    return mills.filter(
      (m) =>
        m["Mill Name"].toLowerCase().includes(lq) ||
        (m.Country ?? "").toLowerCase().includes(lq) ||
        (m.Province ?? "").toLowerCase().includes(lq) ||
        (m["Parent Company"] ?? "").toLowerCase().includes(lq)
    );
  }, [mills, q]);

  const sorted = useMemo(
    () =>
      [...filtered].sort((a, b) => {
        if (sortKey === "score") {
          const av = Number(a.risk_score_current) || 0;
          const bv = Number(b.risk_score_current) || 0;
          return sortDir === "asc" ? av - bv : bv - av;
        }
        const fieldMap: Record<MillSortKey, keyof UmlData> = {
          name: "Mill Name",
          score: "risk_score_current",
          country: "Country",
          province: "Province",
          district: "District",
          parentCompany: "Parent Company",
        };
        const av = String(a[fieldMap[sortKey]] ?? "");
        const bv = String(b[fieldMap[sortKey]] ?? "");
        return sortDir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
      }),
    [filtered, sortKey, sortDir]
  );

  const showPagination = sorted.length > MILLS_PAGE_SIZE;
  const totalPages = Math.ceil(sorted.length / MILLS_PAGE_SIZE);
  const pageRows = sorted.slice(
    (page - 1) * MILLS_PAGE_SIZE,
    page * MILLS_PAGE_SIZE
  );
  const pageNums = getPageNumbers(page, totalPages);

  React.useEffect(() => {
    setPage(1);
  }, []);

  function handleSort(key: MillSortKey) {
    if (key === sortKey) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir(key === "score" ? "desc" : "asc");
    }
  }

  return (
    <>
      <div className={styles.sectionHeader}>
        <div className={styles.sectionLeft}>
          <span className={styles.sectionTitle}>Mills</span>
          <span className={styles.sectionCount}>
            {mills.length.toLocaleString()} mills
          </span>
        </div>
        {showFilter && (
          <div className={styles.filterWrap}>
            <IconSearch />
            <input
              aria-label="Filter mills"
              className={styles.filterInput}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Filter by name, province, company…"
              type="search"
              value={q}
            />
          </div>
        )}
      </div>
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th
                className={`${styles.thName} ${sortKey === "name" ? styles.thActive : ""}`}
                onClick={() => handleSort("name")}
              >
                <span className={styles.thInner}>
                  Mill name{" "}
                  <SortIcon active={sortKey === "name"} dir={sortDir} />
                </span>
              </th>
              <th
                className={`${styles.thScore} ${sortKey === "score" ? styles.thActive : ""}`}
                onClick={() => handleSort("score")}
              >
                <span className={styles.thInner}>
                  Recent score{" "}
                  <SortIcon active={sortKey === "score"} dir={sortDir} />
                </span>
              </th>
              <th
                className={`${styles.thProv} ${sortKey === "province" ? styles.thActive : ""}`}
                onClick={() => handleSort("province")}
              >
                <span className={styles.thInner}>
                  Province{" "}
                  <SortIcon active={sortKey === "province"} dir={sortDir} />
                </span>
              </th>
              <th
                className={`${styles.thDist} ${sortKey === "district" ? styles.thActive : ""}`}
                onClick={() => handleSort("district")}
              >
                <span className={styles.thInner}>
                  District{" "}
                  <SortIcon active={sortKey === "district"} dir={sortDir} />
                </span>
              </th>
              <th
                className={`${styles.thParent} ${sortKey === "parentCompany" ? styles.thActive : ""}`}
                onClick={() => handleSort("parentCompany")}
              >
                <span className={styles.thInner}>
                  Parent company{" "}
                  <SortIcon
                    active={sortKey === "parentCompany"}
                    dir={sortDir}
                  />
                </span>
              </th>
              <th className={styles.thArrow} />
            </tr>
          </thead>
          <tbody>
            {pageRows.length > 0 ? (
              pageRows.map((mill) => {
                const umlId = mill["UML ID"];
                const href = `/mill/${encodeURIComponent(umlId)}`;
                const rawScore = mill.risk_score_current;
                const score =
                  rawScore !== null && rawScore !== undefined
                    ? Number(rawScore)
                    : null;
                return (
                  <tr
                    className={styles.tr}
                    key={umlId}
                    onClick={() => (window.location.href = href)}
                  >
                    <td className={styles.tdName}>
                      <Link
                        className={styles.cellName}
                        href={href}
                        onClick={(e) => e.stopPropagation()}
                      >
                        {toTitleCase(mill["Mill Name"])}
                      </Link>
                    </td>
                    <td className={styles.tdScore}>
                      {score !== null && (
                        <span className={styles.scoreNum}>
                          {score.toFixed(2)}
                        </span>
                      )}
                    </td>
                    <td className={styles.tdProv}>{mill.Province}</td>
                    <td className={styles.tdDist}>{mill.District}</td>
                    <td className={styles.tdParent}>
                      {mill["Parent Company"]}
                    </td>
                    <td className={styles.tdArrow}>
                      <svg
                        aria-hidden="true"
                        fill="none"
                        height="13"
                        viewBox="0 0 24 24"
                        width="13"
                      >
                        <path
                          d="M9 18l6-6-6-6"
                          stroke="currentColor"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="1.75"
                        />
                      </svg>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td className={styles.noResults} colSpan={6}>
                  No mills match &ldquo;{q}&rdquo;
                </td>
              </tr>
            )}
          </tbody>
        </table>
        {showPagination && (
          <div className={styles.tableFooter}>
            <button
              className={styles.paginationBtn}
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              type="button"
            >
              ← Prev
            </button>
            {pageNums.map((p, i) =>
              p === "..." ? (
                <span
                  className={styles.pageEllipsis}
                  key={`ellipsis-${String(pageNums[i - 1])}-${String(pageNums[i + 1])}`}
                >
                  …
                </span>
              ) : (
                <button
                  className={p === page ? styles.pageNumActive : styles.pageNum}
                  key={p}
                  onClick={() => setPage(p as number)}
                  type="button"
                >
                  {p}
                </button>
              )
            )}
            <button
              className={styles.paginationBtn}
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              type="button"
            >
              Next →
            </button>
          </div>
        )}
      </div>
    </>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function CountryPageView({
  country,
  pageData,
  millsTyped,
  deforestationMap,
}: CountryPageViewProps) {
  const { theme } = useTheme();
  const { brandUsage, averageCurrentRisk, uniqueMills } = pageData;

  const dotColor = scoreColor(averageCurrentRisk, theme);

  const forestTimeseries = useMemo(
    () => computeForestTimeseries(millsTyped),
    [millsTyped]
  );

  const yearlyTimeseries = useMemo(
    () => computeYearlyTimeseries(millsTyped),
    [millsTyped]
  );

  const forestLossSince2001 = useMemo(
    () =>
      millsTyped.reduce((sum, mill) => sum + millTreelossSince2001(mill), 0),
    [millsTyped]
  );

  const forestLossPct = useMemo(() => {
    const forestAreaAt2000 = millsTyped.reduce(
      (sum, mill) => sum + (Number(mill.km_forest_area_00) || 0),
      0
    );
    if (forestAreaAt2000 === 0) {
      return null;
    }
    return (forestLossSince2001 / forestAreaAt2000) * 100;
  }, [millsTyped, forestLossSince2001]);

  const normalizedBrandUsage = useMemo(
    () => brandUsage.map((b) => ({ ...b, years: b.years.map(Number) })),
    [brandUsage]
  );

  return (
    <div className={styles.page}>
      <CountryPageHeader country={country} />

      {/* Stat cards */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Mills</span>
          <div className={styles.statValueRow}>
            <span className={styles.statValue}>
              {uniqueMills.toLocaleString()}
            </span>
          </div>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>
            Average recent deforestation score
          </span>
          <div className={styles.statValueRow}>
            <span
              className={styles.scoreDot}
              style={{ background: dotColor }}
            />
            <span className={styles.statValue}>
              {averageCurrentRisk.toFixed(2)}
            </span>
          </div>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>
            Cumulative loss (2001–{maxYear})
          </span>
          <div className={styles.statValueRow}>
            <span className={styles.statValue}>
              {formatKm2(forestLossSince2001)} km²
            </span>
          </div>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>
            Forest area lost (2001–{maxYear})
          </span>
          <div className={styles.statValueRow}>
            <span className={styles.statValue}>
              {forestLossPct === null ? "—" : `${forestLossPct.toFixed(1)}%`}
            </span>
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

      {/* Charts row */}
      <div className={styles.chartsRow}>
        <div className={styles.chartCard}>
          <p className={styles.chartTitle}>Cumulative forest loss</p>
          <p className={styles.chartCaption}>km² lost since 2001</p>
          <div className={styles.chartBody}>
            <CumulativeChart data={forestTimeseries} />
          </div>
        </div>
        <div className={styles.chartCard}>
          <p className={styles.chartTitle}>Annual forest loss</p>
          <p className={styles.chartCaption}>km² lost per year</p>
          <div className={styles.chartBody}>
            <YearlyChart data={yearlyTimeseries} />
          </div>
        </div>
      </div>

      {/* Province bar chart */}
      <ProvinceChart mills={millsTyped} />

      {/* Brands sourcing matrix */}
      {normalizedBrandUsage.length > 0 && (
        <div className={styles.matrixCard}>
          <p className={styles.matrixTitle}>Brands sourcing from {country}</p>
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
                {normalizedBrandUsage.map((brand) => (
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

      {/* Mills table */}
      {millsTyped.length > 0 && <MillsTable mills={millsTyped} />}
    </div>
  );
}
