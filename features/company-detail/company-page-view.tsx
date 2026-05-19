"use client";
import dynamic from "next/dynamic";
import Link from "next/link";
import React, { useMemo, useState } from "react";
import {
  Area,
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";
import { QueryProvider } from "@/components/query-provider";
import { useTheme } from "@/components/theme-provider";
import { cumulativeLossColumn, maxYear, yearRange } from "@/config/years";

const allYearsSince2001 = Array.from(
  { length: maxYear - 2001 + 1 },
  (_, i) => 2001 + i
);

import type { UmlData } from "@/domain";
import type { GroupOwnerPagePayload } from "@/domain/schemas/entity-pages";
import styles from "./company.module.css";

// ── Dynamic imports ───────────────────────────────────────────────────────────

const PalmwatchMapDynamic = dynamic(
  () =>
    import("@/features/map/palmwatch-map").then((m) => ({
      default: m.PalmwatchMap,
    })),
  { ssr: false, loading: () => <div className={styles.mapPlaceholder} /> }
);

// ── Types ─────────────────────────────────────────────────────────────────────

export type CompanyPageViewProps = {
  name: string;
  type: "owner" | "group";
  pageData: GroupOwnerPagePayload;
  millsTyped: UmlData[];
  aboutContent?: React.ReactNode;
};

type CumulativePoint = { year: number; cumulativeKm2: number };

// ── Helpers ───────────────────────────────────────────────────────────────────

function toCompanyCase(name: string): string {
  return name
    .trim()
    .split(" ")
    .map((w) =>
      w.length <= 3 ? w : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()
    )
    .join(" ");
}

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

function scoreBarClass(score: number): string {
  if (score > 3.05) {
    return styles.barRed;
  }
  if (score >= 2.85) {
    return styles.barAmber;
  }
  return styles.barTeal;
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

// ── Icons ─────────────────────────────────────────────────────────────────────

function IconSearch() {
  return (
    <svg
      aria-hidden
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
    <svg fill="none" height="11" viewBox="0 0 24 24" width="11">
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
    <svg fill="none" height="11" viewBox="0 0 24 24" width="11">
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
    <svg fill="none" height="11" viewBox="0 0 24 24" width="11">
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
  const gradientId = "companyCumulativeGrad";

  if (data.length === 0) {
    return <div className={styles.chartBody} />;
  }

  const maxVal = data[data.length - 1].cumulativeKm2;
  const firstYear = data[0].year;
  const lastYear = data[data.length - 1].year;
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

// ── Annual loss chart ─────────────────────────────────────────────────────────

function AnnualLossChart({ mills }: { mills: UmlData[] }) {
  const { theme } = useTheme();
  const barColor = theme === "dark" ? "#F09595" : "#E24B4A";

  const data = useMemo(
    () =>
      allYearsSince2001.map((year) => {
        const col = `treeloss_km_${year}` as keyof UmlData;
        return {
          year,
          loss: mills.reduce((sum, mill) => sum + (Number(mill[col]) || 0), 0),
        };
      }),
    [mills]
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
          tickFormatter={formatKm2}
          tickLine={false}
          ticks={[
            0,
            Number.parseFloat((maxVal / 2).toFixed(1)),
            Number.parseFloat(maxVal.toFixed(1)),
          ]}
          width={40}
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

  const filtered = useMemo(() => {
    if (!q.trim()) {
      return mills;
    }
    const lq = q.trim().toLowerCase();
    return mills.filter((m) => m["Mill Name"].toLowerCase().includes(lq));
  }, [mills, q]);

  const sorted = useMemo(
    () =>
      [...filtered].sort((a, b) => {
        if (sortKey === "score") {
          const av = Number(a.risk_score_current) || 0;
          const bv = Number(b.risk_score_current) || 0;
          return sortDir === "asc" ? av - bv : bv - av;
        }
        const field: Record<MillSortKey, keyof UmlData> = {
          name: "Mill Name",
          score: "risk_score_current",
          country: "Country",
          province: "Province",
          district: "District",
          parentCompany: "Parent Company",
        };
        const av = String(a[field[sortKey]] ?? "");
        const bv = String(b[field[sortKey]] ?? "");
        return sortDir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
      }),
    [filtered, sortKey, sortDir]
  );

  const totalPages = Math.ceil(sorted.length / MILLS_PAGE_SIZE);
  const pageRows = sorted.slice(
    (page - 1) * MILLS_PAGE_SIZE,
    page * MILLS_PAGE_SIZE
  );
  const pageNums = getPageNumbers(page, totalPages);

  React.useEffect(() => {
    setPage(1);
  }, [q, sortKey, sortDir]);

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
        <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
          <span className={styles.sectionTitle}>Mills</span>
          <span className={styles.sectionCount}>
            {mills.length.toLocaleString()} mills
          </span>
        </div>
        <div className={styles.filterWrap}>
          <IconSearch />
          <input
            aria-label="Filter mills"
            className={styles.filterInput}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Filter mills…"
            type="search"
            value={q}
          />
        </div>
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
                  Recent deforestation score{" "}
                  <SortIcon active={sortKey === "score"} dir={sortDir} />
                </span>
              </th>
              <th
                className={`${styles.thCountry} ${sortKey === "country" ? styles.thActive : ""}`}
                onClick={() => handleSort("country")}
              >
                <span className={styles.thInner}>
                  Country{" "}
                  <SortIcon active={sortKey === "country"} dir={sortDir} />
                </span>
              </th>
              <th
                className={`${styles.thProvince} ${sortKey === "province" ? styles.thActive : ""}`}
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
                const score = Number(mill.risk_score_current) || 0;
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
                        {toCompanyCase(mill["Mill Name"])}
                      </Link>
                    </td>
                    <td className={styles.tdScore}>
                      <span className={styles.scoreNum}>
                        {score.toFixed(2)}
                      </span>
                    </td>
                    <td className={styles.tdCountry}>{mill.Country}</td>
                    <td className={styles.tdProvince}>{mill.Province}</td>
                    <td className={styles.tdDist}>{mill.District}</td>
                    <td className={styles.tdParent}>
                      {mill["Parent Company"]?.trim()}
                    </td>
                    <td className={styles.tdArrow}>
                      <svg
                        aria-hidden
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
                <td className={styles.noResults} colSpan={7}>
                  No mills match &ldquo;{q}&rdquo;
                </td>
              </tr>
            )}
          </tbody>
        </table>
        {totalPages > 1 && (
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
                <span className={styles.pageEllipsis} key={`e${i}`}>
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

// ── Subsidiary owners table (groups only) ──────────────────────────────────────

type OwnerRow = { name: string; millCount: number; countries: string };
type OwnerSortKey = "name" | "mills" | "country";

function SubsidiaryOwnersTable({ owners }: { owners: OwnerRow[] }) {
  const [sortKey, setSortKey] = useState<OwnerSortKey>("mills");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const sorted = useMemo(
    () =>
      [...owners].sort((a, b) => {
        if (sortKey === "mills") {
          return sortDir === "asc"
            ? a.millCount - b.millCount
            : b.millCount - a.millCount;
        }
        const av = sortKey === "name" ? a.name : a.countries;
        const bv = sortKey === "name" ? b.name : b.countries;
        return sortDir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
      }),
    [owners, sortKey, sortDir]
  );

  function handleSort(key: OwnerSortKey) {
    if (key === sortKey) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir(key === "mills" ? "desc" : "asc");
    }
  }

  return (
    <>
      <div className={styles.sectionHeader}>
        <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
          <span className={styles.sectionTitle}>Subsidiary companies</span>
          <span className={styles.sectionCount}>
            {owners.length} mill owners
          </span>
        </div>
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
                  Company <SortIcon active={sortKey === "name"} dir={sortDir} />
                </span>
              </th>
              <th
                className={`${styles.thOwner} ${sortKey === "country" ? styles.thActive : ""}`}
                onClick={() => handleSort("country")}
              >
                <span className={styles.thInner}>
                  Country{" "}
                  <SortIcon active={sortKey === "country"} dir={sortDir} />
                </span>
              </th>
              <th
                className={`${styles.thMills} ${sortKey === "mills" ? styles.thActive : ""}`}
                onClick={() => handleSort("mills")}
                style={{ textAlign: "right" }}
              >
                <span className={styles.thInner}>
                  Mills <SortIcon active={sortKey === "mills"} dir={sortDir} />
                </span>
              </th>
              <th className={styles.thArrow} />
            </tr>
          </thead>
          <tbody>
            {sorted.map((owner) => {
              const href = `/owner/${encodeURIComponent(owner.name)}`;
              return (
                <tr
                  className={styles.tr}
                  key={owner.name}
                  onClick={() => (window.location.href = href)}
                >
                  <td className={styles.tdName}>
                    <Link
                      className={styles.ownerLink}
                      href={href}
                      onClick={(e) => e.stopPropagation()}
                    >
                      {toCompanyCase(owner.name)}
                    </Link>
                  </td>
                  <td className={styles.tdCountry}>{owner.countries}</td>
                  <td className={styles.tdMills}>{owner.millCount}</td>
                  <td className={styles.tdArrow}>
                    <svg
                      aria-hidden
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
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function CompanyPageView({
  name,
  type,
  pageData,
  millsTyped,
  aboutContent,
}: CompanyPageViewProps) {
  const { theme } = useTheme();
  const {
    brandUsage,
    averageCurrentRisk,
    uniqueMills,
    uniqueCountries,
    totalForestLoss,
  } = pageData;

  const displayName = useMemo(() => toCompanyCase(name), [name]);
  const forestTimeseries = useMemo(
    () => computeForestTimeseries(millsTyped),
    [millsTyped]
  );
  const forestLossSince2001 = useMemo(
    () =>
      millsTyped.reduce(
        (sum, mill) =>
          sum +
          allYearsSince2001.reduce(
            (s, year) =>
              s + (Number(mill[`treeloss_km_${year}` as keyof UmlData]) || 0),
            0
          ),
        0
      ),
    [millsTyped]
  );

  const normalizedBrandUsage = useMemo(
    () =>
      brandUsage.map((b) => ({
        ...b,
        years: b.years.map(Number),
      })),
    [brandUsage]
  );

  const subsidiaryOwners = useMemo<OwnerRow[]>(() => {
    if (type !== "group") {
      return [];
    }
    const ownerMap = new Map<
      string,
      { millCount: number; countries: Set<string> }
    >();
    for (const mill of millsTyped) {
      const owner = mill["Parent Company"];
      if (!owner) {
        continue;
      }
      if (!ownerMap.has(owner)) {
        ownerMap.set(owner, { millCount: 0, countries: new Set() });
      }
      const entry = ownerMap.get(owner)!;
      entry.millCount++;
      entry.countries.add(mill.Country);
    }
    return [...ownerMap.entries()]
      .map(([ownerName, data]) => ({
        name: ownerName,
        millCount: data.millCount,
        countries: [...data.countries].sort().join(", "),
      }))
      .sort((a, b) => b.millCount - a.millCount);
  }, [millsTyped, type]);

  return (
    <div className={styles.page}>
      {/* Header */}
      <div>
        <nav className={styles.breadcrumb}>
          <Link className={styles.breadcrumbLink} href="/companies">
            Companies
          </Link>
          <span className={styles.breadcrumbSep}>/</span>
          <span className={styles.breadcrumbCurrent}>{displayName}</span>
        </nav>
        <div className={styles.headerRow}>
          <h1 className={styles.companyName}>{displayName}</h1>
          <span
            className={type === "group" ? styles.badgeGroup : styles.badgeOwner}
          >
            {type === "group" ? "Corporate group" : "Mill owner"}
          </span>
        </div>
      </div>

      {/* Stat cards */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Mills</span>
          <div className={styles.statValueRow}>
            <span className={styles.statValue}>{uniqueMills}</span>
          </div>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Countries</span>
          <div className={styles.statValueRow}>
            <span className={styles.statValue}>{uniqueCountries}</span>
          </div>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>
            Average recent deforestation score
          </span>
          <div className={styles.statValueRow}>
            <span className={styles.statValue}>
              {averageCurrentRisk.toFixed(2)}
            </span>
          </div>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>
            Total forest loss (2001–{maxYear})
          </span>
          <div className={styles.statValueRow}>
            <span className={styles.statValue}>
              {formatKm2(forestLossSince2001)} km²
            </span>
          </div>
        </div>
      </div>

      {/* Full-width deforestation map */}
      <div className={styles.mapCardFull}>
        <p className={styles.chartTitle}>
          Mill deforestation map: Forest loss in km²
        </p>
        <div className={styles.mapFrameFull}>
          <QueryProvider>
            <PalmwatchMapDynamic
              choroplethColumn={cumulativeLossColumn}
              choroplethScheme="cumulativeLoss"
              dataIdColumn="UML ID"
              dataTable={millsTyped}
              geoDataUrl="/data/mill-catchment.geojson"
              geoIdColumn="UML ID"
              showLayerStepper={true}
            />
          </QueryProvider>
        </div>
      </div>

      {/* Cumulative + annual charts */}
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
          <p className={styles.chartCaption}>km² per year, 2001–{maxYear}</p>
          <div className={styles.chartBody}>
            <AnnualLossChart mills={millsTyped} />
          </div>
        </div>
      </div>

      {/* Brands sourcing matrix */}
      {normalizedBrandUsage.length > 0 && (
        <div className={styles.matrixCard}>
          <p className={styles.matrixTitle}>
            Brands sourcing from this company
          </p>
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

      {/* Subsidiary owners (groups only) */}
      {subsidiaryOwners.length > 1 && (
        <SubsidiaryOwnersTable owners={subsidiaryOwners} />
      )}

      {/* About / CMS content */}
      {aboutContent && (
        <div className={styles.aboutCard}>
          <p className={styles.aboutTitle}>About</p>
          <div className={styles.aboutBody}>{aboutContent}</div>
        </div>
      )}
    </div>
  );
}
