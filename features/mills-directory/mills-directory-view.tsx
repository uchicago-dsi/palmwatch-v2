"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useMemo } from "react";
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useTheme } from "@/components/theme-provider";
import type { ForestLossYearPoint } from "@/domain/schemas/aggregates";
import type {
  ForestLossQuartilePoint,
  MillDirEntry,
} from "@/server/mill-directory-data";
import styles from "./mills-directory.module.css";

type SortKey = "label" | "country" | "province" | "rspo";
type SortDir = "asc" | "desc";

const PAGE_SIZE = 20;

interface Props {
  countryCount: number;
  disclaimer?: React.ReactNode;
  forestLossByYear?: ForestLossYearPoint[];
  forestLossQuartiles?: ForestLossQuartilePoint[];
  millCount: number;
  mills: MillDirEntry[];
  rspoCertified: number;
  totalArea: number;
  totalForestArea: number;
  totalForestLoss: number;
}

function medianOf(arr: number[]): number {
  if (arr.length === 0) {
    return 0;
  }
  const sorted = [...arr].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[mid - 1] + sorted[mid]) / 2
    : sorted[mid];
}

function IconSearch() {
  return (
    <svg
      aria-hidden
      className={styles.searchIcon}
      fill="none"
      height="18"
      viewBox="0 0 24 24"
      width="18"
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
    <svg fill="none" height="12" viewBox="0 0 24 24" width="12">
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
    <svg fill="none" height="12" viewBox="0 0 24 24" width="12">
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
    <svg fill="none" height="12" viewBox="0 0 24 24" width="12">
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

function SortIcon({ active, dir }: { active: boolean; dir: SortDir }) {
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

function RspoDonut({ certified, total }: { certified: number; total: number }) {
  const { theme } = useTheme();
  const pct = total > 0 ? certified / total : 0;
  const radius = 35;
  const circumference = 2 * Math.PI * radius;
  const certifiedArc = circumference * pct;
  const tealColor = theme === "dark" ? "#5DCAA5" : "#1D9E75";
  const bgColor = theme === "dark" ? "#2a2a2a" : "#e5e5e5";
  const notCertified = total - certified;

  return (
    <div className={styles.rspoDonutLayout}>
      <svg
        className={styles.rspoDonutSvg}
        height="90"
        viewBox="0 0 90 90"
        width="90"
      >
        <circle
          cx="45"
          cy="45"
          fill="none"
          r={radius}
          stroke={bgColor}
          strokeWidth="10"
        />
        <circle
          cx="45"
          cy="45"
          fill="none"
          r={radius}
          stroke={tealColor}
          strokeDasharray={`${certifiedArc} ${circumference}`}
          strokeLinecap="round"
          strokeWidth="10"
          transform="rotate(-90 45 45)"
        />
        <text
          dominantBaseline="central"
          fill="currentColor"
          fontSize="18"
          fontWeight="500"
          textAnchor="middle"
          x="45"
          y="45"
        >
          {Math.round(pct * 100)}%
        </text>
      </svg>
      <div className={styles.rspoDonutCounts}>
        <div className={styles.rspoDonutGroup}>
          <span className={styles.rspoDonutValue} style={{ color: tealColor }}>
            {certified.toLocaleString()}
          </span>
          <span className={styles.rspoDonutSub}>RSPO certified</span>
        </div>
        <div className={styles.rspoDonutGroup}>
          <span className={styles.rspoDonutValuePrimary}>
            {notCertified.toLocaleString()}
          </span>
          <span className={styles.rspoDonutSub}>Not certified</span>
        </div>
      </div>
      <p className={styles.rspoExplainer}>
        The Roundtable on Sustainable Palm Oil (RSPO) certifies mills that meet
        environmental and social standards for sustainable production.
      </p>
    </div>
  );
}

const RISK_TIERS = [
  {
    label: "Lower risk",
    lightColor: "#1D9E75",
    darkColor: "#5DCAA5",
    test: (s: number) => s < 2.85,
  },
  {
    label: "Moderate",
    lightColor: "#EF9F27",
    darkColor: "#FAC775",
    test: (s: number) => s >= 2.85 && s <= 3.05,
  },
  {
    label: "Higher risk",
    lightColor: "#E24B4A",
    darkColor: "#F09595",
    test: (s: number) => s > 3.05,
  },
];

function RiskDistribution({ mills }: { mills: MillDirEntry[] }) {
  const { theme } = useTheme();
  const tiers = useMemo(() => {
    const withScore = mills.filter((m) => m.riskScore !== null);
    const total = withScore.length;
    return RISK_TIERS.map((tier) => {
      const count = withScore.filter((m) => tier.test(m.riskScore!)).length;
      const pct = total > 0 ? Math.round((count / total) * 100) : 0;
      return { ...tier, count, pct };
    });
  }, [mills]);

  return (
    <div>
      <span className={styles.impactLabel}>Risk distribution</span>
      <div className={styles.riskRows}>
        {tiers.map((tier) => {
          const color = theme === "dark" ? tier.darkColor : tier.lightColor;
          return (
            <div className={styles.riskRow} key={tier.label}>
              <span className={styles.riskDot} style={{ background: color }} />
              <span className={styles.riskLabel}>{tier.label}</span>
              <div className={styles.riskBarTrack}>
                <div
                  className={styles.riskBarFill}
                  style={{ width: `${tier.pct}%`, background: color }}
                />
              </div>
              <span className={styles.riskCount}>
                {tier.count.toLocaleString()} ({tier.pct}%)
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function fmtKm2(v: number): string {
  if (v >= 1_000_000) {
    return `${(v / 1_000_000).toFixed(1)}M km²`;
  }
  if (v >= 1000) {
    return `${Math.round(v / 1000).toLocaleString()}K km²`;
  }
  return `${Math.round(v).toLocaleString()} km²`;
}

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

function AreaBreakdownCard({
  totalArea,
  totalForestArea,
  totalForestLoss,
}: {
  totalArea: number;
  totalForestArea: number;
  totalForestLoss: number;
}) {
  const { theme } = useTheme();
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
    <div className={styles.impactCard}>
      <span className={styles.impactLabel}>Area breakdown</span>
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
                {fmtKm2(values[key])}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function fmtKm2Axis(v: number): string {
  if (v === 0) {
    return "0";
  }
  if (v >= 1000) {
    return `${(v / 1000).toFixed(1)}k`;
  }
  if (v >= 1) {
    return v.toFixed(1);
  }
  return v.toFixed(2);
}

function QuartileTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { value: number; name: string }[];
  label?: number;
}) {
  if (!(active && payload) || payload.length === 0) {
    return null;
  }
  const q1 = payload.find((p) => p.name === "q1")?.value ?? 0;
  const band = payload.find((p) => p.name === "band")?.value ?? 0;
  const median = payload.find((p) => p.name === "median")?.value;
  const q3 = q1 + band;
  return (
    <div className={styles.chartTooltip}>
      <p className={styles.chartTooltipYear}>{label}</p>
      {median !== undefined && (
        <div className={styles.chartTooltipRow}>
          <span className={styles.chartTooltipLabel}>Median</span>
          <span className={styles.chartTooltipValue}>
            {median.toFixed(3)} km²
          </span>
        </div>
      )}
      <div className={styles.chartTooltipRow}>
        <span className={styles.chartTooltipLabel}>Q1 (25th pct)</span>
        <span className={styles.chartTooltipValue}>{q1.toFixed(3)} km²</span>
      </div>
      <div className={styles.chartTooltipRow}>
        <span className={styles.chartTooltipLabel}>Q3 (75th pct)</span>
        <span className={styles.chartTooltipValue}>{q3.toFixed(3)} km²</span>
      </div>
    </div>
  );
}

function ForestLossQuartileChart({
  data,
}: {
  data: ForestLossQuartilePoint[];
}) {
  const { theme } = useTheme();
  const lineColor = theme === "dark" ? "#F09595" : "#E24B4A";
  const bandColor = theme === "dark" ? "#F09595" : "#E24B4A";

  const chartData = useMemo(
    () =>
      data.map((d) => ({
        year: d.year,
        q1: d.q1,
        band: d.q3 - d.q1,
        median: d.median,
      })),
    [data]
  );

  const maxVal = Math.max(...data.map((d) => d.q3), 0.01);
  const firstYear = data[0]?.year ?? 2001;
  const lastYear = data[data.length - 1]?.year ?? 2025;
  const midYear = Math.round((firstYear + lastYear) / 2);
  const yMax = maxVal * 1.15;
  const yMid = Number.parseFloat((yMax / 2).toFixed(2));

  return (
    <div className={styles.annualLossCard}>
      <p className={styles.annualLossTitle}>Annual forest loss per mill</p>
      <p className={styles.annualLossCaption}>
        km² · median with Q1–Q3 band · {firstYear}–{lastYear}
      </p>
      <div className={styles.annualLossBody}>
        <ResponsiveContainer height="100%" width="100%">
          <ComposedChart
            data={chartData}
            margin={{ top: 4, right: 12, left: 4, bottom: 0 }}
          >
            <defs>
              <linearGradient id="quartileBand" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor={bandColor} stopOpacity={0.18} />
                <stop offset="100%" stopColor={bandColor} stopOpacity={0.06} />
              </linearGradient>
            </defs>
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
              domain={[0, yMax]}
              tick={{ fill: "hsl(var(--bc) / 0.45)", fontSize: 11 }}
              tickFormatter={fmtKm2Axis}
              tickLine={false}
              ticks={[0, yMid, Number.parseFloat(yMax.toFixed(2))]}
              width={38}
            />
            <Tooltip
              content={<QuartileTooltip />}
              cursor={{ stroke: "hsl(var(--bc) / 0.15)", strokeWidth: 1 }}
            />
            {/* Invisible base to anchor the band at Q1 */}
            <Area
              dataKey="q1"
              fill="transparent"
              isAnimationActive={false}
              stackId="band"
              stroke="none"
              type="monotone"
            />
            {/* Q1–Q3 shaded band */}
            <Area
              dataKey="band"
              fill="url(#quartileBand)"
              isAnimationActive={false}
              stackId="band"
              stroke="none"
              type="monotone"
            />
            <Line
              dataKey="median"
              dot={false}
              isAnimationActive={false}
              stroke={lineColor}
              strokeWidth={2}
              type="monotone"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function MillsClient({
  mills,
  rspoCertified,
  millCount,
  countryCount,
  totalArea,
  totalForestArea,
  totalForestLoss,
  forestLossByYear,
  forestLossQuartiles,
  disclaimer,
}: Props) {
  const router = useRouter();

  const [query, setQuery] = React.useState("");
  const [activeIdx, setActiveIdx] = React.useState(-1);
  const resultsRef = React.useRef<HTMLDivElement>(null);

  const [sortKey, setSortKey] = React.useState<SortKey>("label");
  const [sortDir, setSortDir] = React.useState<SortDir>("asc");
  const [tableFilter, setTableFilter] = React.useState("");
  const [page, setPage] = React.useState(1);

  const q = query.trim().toLowerCase();
  const showResults = q.length >= 2;
  const searchResults = React.useMemo(
    () =>
      showResults
        ? mills.filter((m) => m.label.toLowerCase().includes(q)).slice(0, 8)
        : [],
    [mills, q, showResults]
  );

  React.useEffect(() => {
    setActiveIdx(-1);
  }, [q]);

  React.useEffect(() => {
    setPage(1);
  }, [sortKey, sortDir, tableFilter]);

  function handleSearchKeyDown(e: React.KeyboardEvent) {
    if (!showResults || searchResults.length === 0) {
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIdx((i) => (i < searchResults.length - 1 ? i + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIdx((i) => (i > 0 ? i - 1 : searchResults.length - 1));
    } else if (e.key === "Enter" && activeIdx >= 0) {
      e.preventDefault();
      router.push(searchResults[activeIdx].href);
    } else if (e.key === "Escape") {
      setQuery("");
    }
  }

  React.useEffect(() => {
    if (activeIdx < 0 || !resultsRef.current) {
      return;
    }
    const item = resultsRef.current.children[activeIdx] as
      | HTMLElement
      | undefined;
    item?.scrollIntoView({ block: "nearest" });
  }, [activeIdx]);

  const sorted = React.useMemo(
    () =>
      [...mills].sort((a, b) => {
        if (sortKey === "rspo") {
          const av = a.rspo ? 1 : 0;
          const bv = b.rspo ? 1 : 0;
          return sortDir === "asc" ? av - bv : bv - av;
        }
        const av = (a[sortKey] as string) ?? "";
        const bv = (b[sortKey] as string) ?? "";
        return sortDir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
      }),
    [mills, sortKey, sortDir]
  );

  const tf = tableFilter.trim().toLowerCase();
  const filtered = React.useMemo(
    () =>
      tf
        ? sorted.filter(
            (m) =>
              m.label.toLowerCase().includes(tf) ||
              m.country.toLowerCase().includes(tf) ||
              m.province.toLowerCase().includes(tf)
          )
        : sorted,
    [sorted, tf]
  );

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const pageRows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function handleSort(key: SortKey) {
    if (key === sortKey) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  return (
    <div className={styles.page}>
      {/* Hero */}
      <section className={styles.hero}>
        <h1 className={styles.heroTitle}>Palm oil mills directory</h1>
        <p className={styles.heroBody}>
          PalmWatch tracks {millCount.toLocaleString()} palm oil mills linked to
          major consumer brands. Each mill is connected to the cultivation areas
          and forests within its catchment, letting you trace sourcing impacts
          from shelf to landscape.
        </p>
      </section>

      {/* Search */}
      <div className={styles.searchWrap}>
        <div className={styles.searchBar}>
          <IconSearch />
          <input
            aria-activedescendant={
              activeIdx >= 0 ? `mill-result-${activeIdx}` : undefined
            }
            aria-autocomplete="list"
            aria-controls="mill-search-results"
            aria-expanded={showResults && searchResults.length > 0}
            aria-label="Search mills"
            className={styles.searchInput}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleSearchKeyDown}
            placeholder="Search mills…"
            role="combobox"
            type="search"
            value={query}
          />
        </div>
        {showResults && (
          <div
            className={styles.searchResults}
            id="mill-search-results"
            ref={resultsRef}
            role="listbox"
          >
            {searchResults.length > 0 ? (
              searchResults.map((mill, i) => (
                <Link
                  aria-selected={i === activeIdx}
                  className={`${styles.searchResultItem} ${i === activeIdx ? styles.searchResultActive : ""}`}
                  href={mill.href}
                  id={`mill-result-${i}`}
                  key={mill.href}
                  role="option"
                >
                  <span>{mill.label}</span>
                  <span className={styles.searchResultMeta}>
                    {mill.country}
                  </span>
                  <svg
                    aria-hidden
                    className={styles.searchResultChevron}
                    fill="none"
                    height="14"
                    viewBox="0 0 24 24"
                    width="14"
                  >
                    <path
                      d="M9 18l6-6-6-6"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="1.75"
                    />
                  </svg>
                </Link>
              ))
            ) : (
              <span className={styles.searchNoMatch}>
                No mills match &ldquo;{query}&rdquo;
              </span>
            )}
          </div>
        )}
      </div>

      {/* Stat cards */}
      {(() => {
        const medianLoss = forestLossByYear?.length
          ? medianOf(forestLossByYear.map((p) => p.annualKm2))
          : null;
        const pctLost =
          totalForestArea > 0
            ? (totalForestLoss / totalForestArea) * 100
            : null;
        return (
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <span className={styles.statLabel}>Mills</span>
              <span className={styles.statValue}>
                {millCount.toLocaleString()}
              </span>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statLabel}>Countries</span>
              <span className={styles.statValue}>
                {countryCount.toLocaleString()}
              </span>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statLabel}>Forest loss per year</span>
              <span className={styles.statValue}>
                {medianLoss === null ? "—" : fmtKm2(medianLoss)}
              </span>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statLabel}>Percent forest lost</span>
              <span className={styles.statValue}>
                {pctLost === null ? "—" : `${pctLost.toFixed(1)}%`}
              </span>
            </div>
          </div>
        );
      })()}

      {/* Impact cards */}
      <div className={styles.impactGrid}>
        <div className={styles.impactCard}>
          <span className={styles.impactLabel}>RSPO certification</span>
          <RspoDonut certified={rspoCertified} total={millCount} />
          <div className={styles.riskDivider} />
          <RiskDistribution mills={mills} />
        </div>

        <AreaBreakdownCard
          totalArea={totalArea}
          totalForestArea={totalForestArea}
          totalForestLoss={totalForestLoss}
        />
      </div>

      {/* Annual forest loss quartile chart */}
      {forestLossQuartiles && forestLossQuartiles.length > 0 && (
        <ForestLossQuartileChart data={forestLossQuartiles} />
      )}

      {/* Mill directory table */}
      <section>
        <div className={styles.tableHeader}>
          <div className={styles.tableHeaderLeft}>
            <span className={styles.sectionTitle}>All mills</span>
            <span className={styles.tableCount}>
              {filtered.length.toLocaleString()} mills
            </span>
          </div>
          <div className={styles.tableFilterWrap}>
            <IconSearch />
            <input
              aria-label="Filter mills"
              className={styles.tableFilterInput}
              onChange={(e) => setTableFilter(e.target.value)}
              placeholder="Filter by name, country, province…"
              type="search"
              value={tableFilter}
            />
          </div>
        </div>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th
                  className={`${styles.thName} ${sortKey === "label" ? styles.thActive : ""}`}
                  onClick={() => handleSort("label")}
                >
                  <span className={styles.thInner}>
                    Mill name
                    <SortIcon active={sortKey === "label"} dir={sortDir} />
                  </span>
                </th>
                <th
                  className={`${styles.thCountry} ${sortKey === "country" ? styles.thActive : ""}`}
                  onClick={() => handleSort("country")}
                >
                  <span className={styles.thInner}>
                    Country
                    <SortIcon active={sortKey === "country"} dir={sortDir} />
                  </span>
                </th>
                <th
                  className={`${styles.thProvince} ${sortKey === "province" ? styles.thActive : ""}`}
                  onClick={() => handleSort("province")}
                >
                  <span className={styles.thInner}>
                    Province
                    <SortIcon active={sortKey === "province"} dir={sortDir} />
                  </span>
                </th>
                <th
                  className={`${styles.thRspo} ${sortKey === "rspo" ? styles.thActive : ""}`}
                  onClick={() => handleSort("rspo")}
                >
                  <span className={styles.thInner}>
                    RSPO
                    <SortIcon active={sortKey === "rspo"} dir={sortDir} />
                  </span>
                </th>
                <th className={styles.thArrow} />
              </tr>
            </thead>
            <tbody>
              {pageRows.length > 0 ? (
                pageRows.map((mill) => (
                  <tr
                    className={styles.tr}
                    key={mill.href}
                    onClick={() => router.push(mill.href)}
                  >
                    <td className={styles.tdName}>
                      <Link
                        className={styles.millName}
                        href={mill.href}
                        onClick={(e) => e.stopPropagation()}
                      >
                        {mill.label}
                      </Link>
                    </td>
                    <td className={styles.tdCountry}>{mill.country}</td>
                    <td className={styles.tdProvince}>{mill.province}</td>
                    <td className={styles.tdRspo}>
                      {mill.rspo ? (
                        <span className={styles.rspoBadgeYes}>Yes</span>
                      ) : (
                        <span className={styles.rspoBadgeNo}>—</span>
                      )}
                    </td>
                    <td className={styles.tdArrow}>
                      <svg
                        aria-hidden
                        fill="none"
                        height="14"
                        viewBox="0 0 24 24"
                        width="14"
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
                ))
              ) : (
                <tr>
                  <td className={styles.noResults} colSpan={5}>
                    No mills found.
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
              <span className={styles.paginationInfo}>
                Page {page} of {totalPages}
              </span>
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
      </section>
      {disclaimer == null ? null : (
        <div className={styles.disclaimer}>{disclaimer}</div>
      )}
    </div>
  );
}
