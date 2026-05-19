"use client";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import React from "react";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { QueryProvider } from "@/components/query-provider";
import { useTheme } from "@/components/theme-provider";
import { maxYear } from "@/config/years";
import type { BrandPrecomputedPayload } from "@/domain/schemas/brand-precomputed";
import styles from "./brand.module.css";
import { BrandPageScorecard } from "./components/brand-page-scorecard";
import type { AnnualLossPoint, RankingEntry } from "./types";

// ── Types ────────────────────────────────────────────────────────────────────

type BrandStats = BrandPrecomputedPayload["brandStats"];

interface Disclosure {
  filename: string;
  year: string;
}
interface Download {
  href: string;
  label: string;
}

export interface BrandPageViewProps {
  aboutContent: React.ReactNode;
  altName?: string;
  brand: string;
  brandStats: BrandStats;
  deforestationMap: React.ReactNode;
  disclosures: Disclosure[];
  downloads: Download[];
  externalLink: string;
  forestLossTimeseries: AnnualLossPoint[];
  ranking: RankingEntry[];
  rspoMemberSince: string;
  totalForestLoss: number;
}

// ── Helper functions ─────────────────────────────────────────────────────────

function toTitleCase(str: string): string {
  return str.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatKm2(v: number): string {
  if (v >= 1_000_000) {
    return `${(v / 1_000_000).toFixed(1)}M`;
  }
  if (v >= 1000) {
    return `${Math.round(v / 1000)}k`;
  }
  return String(Math.round(v));
}

function _scoreColor(score: number, theme: "dark" | "light"): string {
  if (score > 3.05) {
    return theme === "dark" ? "#F87171" : "#DC2626";
  }
  if (score >= 2.85) {
    return theme === "dark" ? "#FB923C" : "#EA580C";
  }
  return theme === "dark" ? "#FDE047" : "#CA8A04";
}

function _scoreBarClass(score: number): string {
  if (score > 3.05) {
    return styles.barRed;
  }
  if (score >= 2.85) {
    return styles.barAmber;
  }
  return styles.barTeal;
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

// ── Icons ────────────────────────────────────────────────────────────────────

function IconSearch() {
  return (
    <svg
      aria-hidden="true"
      className={styles.filterIcon}
      fill="none"
      height="16"
      viewBox="0 0 24 24"
      width="16"
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

function IconChevronDown({ open }: { open: boolean }) {
  return (
    <svg
      aria-hidden="true"
      className={`${styles.accordionChevron} ${open ? styles.accordionChevronOpen : ""}`}
      fill="none"
      height="16"
      viewBox="0 0 24 24"
      width="16"
    >
      <path
        d="M6 9l6 6 6-6"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.75"
      />
    </svg>
  );
}

function IconExternal() {
  return (
    <svg
      aria-hidden="true"
      className={styles.linkIcon}
      fill="none"
      height="13"
      viewBox="0 0 24 24"
      width="13"
    >
      <path
        d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.75"
      />
      <polyline
        points="15 3 21 3 21 9"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.75"
      />
      <line
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.75"
        x1="10"
        x2="21"
        y1="14"
        y2="3"
      />
    </svg>
  );
}

function IconDownload() {
  return (
    <svg
      aria-hidden="true"
      className={styles.linkIcon}
      fill="none"
      height="13"
      viewBox="0 0 24 24"
      width="13"
    >
      <path
        d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.75"
      />
      <polyline
        points="7 10 12 15 17 10"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.75"
      />
      <line
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.75"
        x1="12"
        x2="12"
        y1="15"
        y2="3"
      />
    </svg>
  );
}

function IconSortBoth() {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      height="12"
      viewBox="0 0 24 24"
      width="12"
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
      height="12"
      viewBox="0 0 24 24"
      width="12"
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
      height="12"
      viewBox="0 0 24 24"
      width="12"
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

// ── Annual forest loss chart ──────────────────────────────────────────────────

function AnnualLossTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { value: number }[];
}) {
  if (!(active && payload?.length)) {
    return null;
  }
  const value = payload[0].value;
  return (
    <div className={styles.chartTooltip}>
      <span className={styles.chartTooltipVal}>
        {value.toLocaleString()} km²
      </span>
    </div>
  );
}

function AnnualLossChart({ data }: { data: AnnualLossPoint[] }) {
  const { theme } = useTheme();
  const barColor = theme === "dark" ? "#F09595" : "#E24B4A";

  if (data.length === 0) {
    return <div className={styles.chartBody} />;
  }

  const maxVal = Math.max(...data.map((d) => d.annualKm2));
  const firstYear = data[0].year;
  const lastYear = data.at(-1)?.year ?? firstYear;
  const midYear = Math.round((firstYear + lastYear) / 2);

  return (
    <ResponsiveContainer height="100%" width="100%">
      <BarChart data={data} margin={{ top: 8, right: 16, left: 4, bottom: 0 }}>
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
          tick={{ fill: "hsl(var(--bc) / 0.45)", fontSize: 11 }}
          tickFormatter={formatKm2}
          tickLine={false}
          ticks={[0, Math.round(maxVal / 2), maxVal]}
          width={40}
        />
        <Tooltip
          content={<AnnualLossTooltip />}
          cursor={{ fill: "hsl(var(--bc) / 0.06)" }}
        />
        <Bar
          dataKey="annualKm2"
          fill={barColor}
          isAnimationActive={false}
          opacity={0.85}
          radius={[2, 2, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}

// ── Mill owners table ─────────────────────────────────────────────────────────

interface OwnerRow {
  Country: string;
  count: number;
  "Parent Company": string;
}
type OwnerSortKey = "name" | "country" | "count";

const OWNER_PAGE_SIZE = 20;

function MillOwnersTable({ owners }: { owners: OwnerRow[] }) {
  const [q, setQ] = React.useState("");
  const [sortKey, setSortKey] = React.useState<OwnerSortKey>("count");
  const [sortDir, setSortDir] = React.useState<"asc" | "desc">("desc");
  const [page, setPage] = React.useState(1);

  const filtered = React.useMemo(() => {
    const lower = q.trim().toLowerCase();
    return lower
      ? owners.filter(
          (r) =>
            r["Parent Company"].toLowerCase().includes(lower) ||
            r.Country.toLowerCase().includes(lower)
        )
      : owners;
  }, [owners, q]);

  const sorted = React.useMemo(
    () =>
      [...filtered].sort((a, b) => {
        if (sortKey === "count") {
          return sortDir === "asc" ? a.count - b.count : b.count - a.count;
        }
        const av = sortKey === "name" ? a["Parent Company"] : a.Country;
        const bv = sortKey === "name" ? b["Parent Company"] : b.Country;
        return sortDir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
      }),
    [filtered, sortKey, sortDir]
  );

  const totalPages = Math.ceil(sorted.length / OWNER_PAGE_SIZE);
  const pageRows = sorted.slice(
    (page - 1) * OWNER_PAGE_SIZE,
    page * OWNER_PAGE_SIZE
  );
  const pageNums = getPageNumbers(page, totalPages);

  React.useEffect(() => {
    setPage(1);
  }, []);

  function handleSort(key: OwnerSortKey) {
    if (key === sortKey) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir(key === "count" ? "desc" : "asc");
    }
  }

  return (
    <>
      <div className={styles.tableHeaderRow}>
        <div style={{ display: "flex", alignItems: "baseline", gap: "10px" }}>
          <span className={styles.tableHeading}>Mill owners</span>
          <span className={styles.tableCount}>
            {owners.length.toLocaleString()} companies
          </span>
        </div>
        <div className={styles.tableFilter}>
          <IconSearch />
          <input
            aria-label="Filter mill owners"
            className={styles.filterInput}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Filter mill owners…"
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
                  Mill owner{" "}
                  <SortIcon active={sortKey === "name"} dir={sortDir} />
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
                className={`${styles.thMills} ${sortKey === "count" ? styles.thActive : ""}`}
                onClick={() => handleSort("count")}
              >
                <span className={styles.thInner}>
                  Mills <SortIcon active={sortKey === "count"} dir={sortDir} />
                </span>
              </th>
              <th className={styles.thArrow} />
            </tr>
          </thead>
          <tbody>
            {pageRows.length > 0 ? (
              pageRows.map((row) => (
                <tr
                  className={styles.tr}
                  key={row["Parent Company"]}
                  onClick={() =>
                    (window.location.href = `/owner/${encodeURIComponent(row["Parent Company"])}`)
                  }
                >
                  <td className={styles.tdName}>
                    <Link
                      className={styles.cellName}
                      href={`/owner/${encodeURIComponent(row["Parent Company"])}`}
                      onClick={(e) => e.stopPropagation()}
                    >
                      {toTitleCase(row["Parent Company"])}
                    </Link>
                  </td>
                  <td className={styles.tdCountry}>{row.Country}</td>
                  <td className={styles.tdMills}>
                    {row.count.toLocaleString()}
                  </td>
                  <td className={styles.tdArrow}>
                    <svg
                      aria-hidden="true"
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
                <td className={styles.noResults} colSpan={4}>
                  No mill owners match &ldquo;{q}&rdquo;
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

// ── Mills table ───────────────────────────────────────────────────────────────

interface MillRow {
  Country: string;
  "Mill Name": string;
  "Parent Company": string;
  Province: string;
  risk_score_current: number;
  "UML ID": string;
}

type MillSortKey = "name" | "score" | "country" | "province" | "parent";

const MILL_PAGE_SIZE = 20;

function MillsTable({ mills }: { mills: MillRow[] }) {
  const [q, setQ] = React.useState("");
  const [sortKey, setSortKey] = React.useState<MillSortKey>("name");
  const [sortDir, setSortDir] = React.useState<"asc" | "desc">("asc");
  const [page, setPage] = React.useState(1);

  const filtered = React.useMemo(() => {
    const lower = q.trim().toLowerCase();
    return lower
      ? mills.filter(
          (r) =>
            r["Mill Name"].toLowerCase().includes(lower) ||
            r.Province.toLowerCase().includes(lower) ||
            r["Parent Company"].toLowerCase().includes(lower) ||
            r.Country.toLowerCase().includes(lower)
        )
      : mills;
  }, [mills, q]);

  const sorted = React.useMemo(
    () =>
      [...filtered].sort((a, b) => {
        if (sortKey === "score") {
          return sortDir === "asc"
            ? a.risk_score_current - b.risk_score_current
            : b.risk_score_current - a.risk_score_current;
        }
        const field: Record<MillSortKey, keyof MillRow> = {
          name: "Mill Name",
          score: "risk_score_current",
          country: "Country",
          province: "Province",
          parent: "Parent Company",
        };
        const av = String(a[field[sortKey]] ?? "");
        const bv = String(b[field[sortKey]] ?? "");
        return sortDir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
      }),
    [filtered, sortKey, sortDir]
  );

  const totalPages = Math.ceil(sorted.length / MILL_PAGE_SIZE);
  const pageRows = sorted.slice(
    (page - 1) * MILL_PAGE_SIZE,
    page * MILL_PAGE_SIZE
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
      <div className={styles.tableHeaderRow}>
        <div style={{ display: "flex", alignItems: "baseline", gap: "10px" }}>
          <span className={styles.tableHeading}>Individual mills</span>
          <span className={styles.tableCount}>
            {mills.length.toLocaleString()} mills
          </span>
        </div>
        <div className={styles.tableFilter}>
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
                  Recent Deforestation Score{" "}
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
                className={`${styles.thParent} ${sortKey === "parent" ? styles.thActive : ""}`}
                onClick={() => handleSort("parent")}
              >
                <span className={styles.thInner}>
                  Mill owner{" "}
                  <SortIcon active={sortKey === "parent"} dir={sortDir} />
                </span>
              </th>
              <th className={styles.thArrow} />
            </tr>
          </thead>
          <tbody>
            {pageRows.length > 0 ? (
              pageRows.map((row) => {
                const umlId = row["UML ID"];
                const millHref = `/mill/${encodeURIComponent(umlId)}`;
                return (
                  <tr
                    className={styles.tr}
                    key={umlId}
                    onClick={() => (window.location.href = millHref)}
                  >
                    <td className={styles.tdName}>
                      <Link
                        className={styles.cellName}
                        href={millHref}
                        onClick={(e) => e.stopPropagation()}
                      >
                        {toTitleCase(row["Mill Name"])}
                      </Link>
                    </td>
                    <td className={styles.tdScore}>
                      {row.risk_score_current.toFixed(2)}
                    </td>
                    <td className={styles.tdCountry}>{row.Country}</td>
                    <td className={styles.tdProvince}>{row.Province}</td>
                    <td className={styles.tdParent}>
                      <Link
                        className={styles.tdParentLink}
                        href={`/owner/${encodeURIComponent(row["Parent Company"])}`}
                        onClick={(e) => e.stopPropagation()}
                      >
                        {toTitleCase(row["Parent Company"])}
                      </Link>
                    </td>
                    <td className={styles.tdArrow}>
                      <svg
                        aria-hidden="true"
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

// ── About accordion ───────────────────────────────────────────────────────────

function AboutAccordion({
  brand,
  content,
}: {
  brand: string;
  content: React.ReactNode;
}) {
  const [open, setOpen] = React.useState(false);
  return (
    <div className={styles.accordion}>
      <button
        className={styles.accordionTrigger}
        onClick={() => setOpen((o) => !o)}
        type="button"
      >
        <span className={styles.accordionTriggerLabel}>About {brand}</span>
        <IconChevronDown open={open} />
      </button>
      {open && <div className={styles.accordionBody}>{content}</div>}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

function BrandPageViewInner({
  brand,
  altName,
  externalLink,
  disclosures,
  brandStats,
  aboutContent,
  ranking,
  forestLossTimeseries,
  totalForestLoss,
  downloads,
  deforestationMap,
}: BrandPageViewProps) {
  const { data: apiData } = useQuery<{
    owners: OwnerRow[];
    umlInfo: Record<string, unknown>[];
  }>({
    queryKey: ["data", `/api/brand/${brand}`],
    queryFn: () => fetch(`/api/brand/${brand}`).then((r) => r.json()),
  });

  const owners = (apiData?.owners ?? []) as OwnerRow[];
  const umlInfo = (apiData?.umlInfo ?? []) as unknown as MillRow[];

  const forestLossDisplay = `${formatKm2(totalForestLoss)} km²`;

  const stats = [
    { label: "Mills linked", value: brandStats.uniqueMills.toLocaleString() },
    { label: "Countries", value: brandStats.uniqueCountries.toLocaleString() },
    { label: "Mill owners", value: brandStats.uniqueOwners.toLocaleString() },
    {
      label: `Cumulative loss (2001–${maxYear})`,
      value: forestLossDisplay,
    },
  ];

  return (
    <div className={styles.page}>
      <BrandPageScorecard altName={altName} brand={brand} ranking={ranking} />

      {/* Stat cards */}
      <div className={styles.statsGrid}>
        {stats.map((s) => (
          <div className={styles.statCard} key={s.label}>
            <span className={styles.statLabel}>{s.label}</span>
            <span className={styles.statValue}>{s.value}</span>
          </div>
        ))}
      </div>

      {/* Section 2: Visual story */}
      <div className={styles.visualGrid}>
        <div className={styles.mapCard}>
          <div className={styles.mapFrame}>{deforestationMap}</div>
        </div>

        <div className={styles.chartCard}>
          <p className={styles.chartTitle}>Annual forest loss</p>
          <p className={styles.chartCaption}>
            km² lost per year in {brand}&apos;s mill catchment areas, 2001–
            {maxYear}
          </p>
          <div className={styles.chartBody}>
            <AnnualLossChart data={forestLossTimeseries} />
          </div>
        </div>
      </div>

      {/* Section 3: Data explorer */}
      <section>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Supply chain detail</h2>
          <p className={styles.sectionSub}>
            Mills and companies linked to {brand}&apos;s palm oil supply chain.
          </p>
        </div>
      </section>

      {owners.length > 0 && <MillOwnersTable owners={owners} />}
      {umlInfo.length > 0 && <MillsTable mills={umlInfo} />}

      {/* About accordion */}
      <AboutAccordion brand={brand} content={aboutContent} />

      {/* Links card */}
      <div className={styles.linksCard}>
        <div className={styles.linksGrid}>
          <div className={styles.linksCol}>
            <div className={styles.linksColTitle}>External links</div>
            {externalLink && (
              <a
                className={styles.linkItem}
                href={externalLink}
                rel="noreferrer"
                target="_blank"
              >
                Company website <IconExternal />
              </a>
            )}
            {disclosures.map((d) => (
              <a
                className={styles.linkItem}
                download
                href={d.filename}
                key={d.year}
                rel="noreferrer"
                target="_blank"
              >
                Disclosure {d.year} <IconExternal />
              </a>
            ))}
          </div>
          <div className={styles.linksCol}>
            <div className={styles.linksColTitle}>Data downloads</div>
            {downloads.map((d) => (
              <a
                className={styles.linkItem}
                download
                href={d.href}
                key={d.label}
                rel="noreferrer"
                target="_blank"
              >
                {d.label} <IconDownload />
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Methodology note */}
      <p className={styles.methodology}>
        Many brands source palm oil from the same mills. Total deforestation
        loss for each brand is not disaggregated based on the amount of palm oil
        each brand sources from an individual mill, because this data is not
        disclosed.
      </p>
    </div>
  );
}

export function BrandPageView(props: BrandPageViewProps) {
  return (
    <QueryProvider>
      <BrandPageViewInner {...props} />
    </QueryProvider>
  );
}
