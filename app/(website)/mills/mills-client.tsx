"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React from "react";
import { useTheme } from "@/components/theme-provider";
import type { MillDirEntry } from "@/lib/server/mill-directory-data";
import styles from "./mills.module.css";

type SortKey = "label" | "country" | "rspo" | "riskScore";
type SortDir = "asc" | "desc";

function scoreColor(score: number | null, theme: string): string {
  if (score === null) {
    return "hsl(var(--bc) / 0.4)";
  }
  if (score < 2.85) {
    return theme === "dark" ? "#FDE047" : "#CA8A04";
  }
  if (score <= 3.05) {
    return theme === "dark" ? "#FB923C" : "#EA580C";
  }
  return theme === "dark" ? "#F87171" : "#DC2626";
}

const PAGE_SIZE = 20;

interface RiskDistribution {
  higher: number;
  lower: number;
  moderate: number;
  total: number;
}

interface Props {
  millCount: number;
  mills: MillDirEntry[];
  riskDistribution: RiskDistribution;
  rspoCertified: number;
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
    key: "lower" as const,
    label: "Lower risk",
    lightColor: "#CA8A04",
    darkColor: "#FDE047",
  },
  {
    key: "moderate" as const,
    label: "Moderate",
    lightColor: "#EA580C",
    darkColor: "#FB923C",
  },
  {
    key: "higher" as const,
    label: "Higher risk",
    lightColor: "#DC2626",
    darkColor: "#F87171",
  },
];

function RiskDistributionCard({
  distribution,
}: {
  distribution: {
    lower: number;
    moderate: number;
    higher: number;
    total: number;
  };
}) {
  const { theme } = useTheme();
  const { lower, moderate, higher, total } = distribution;
  const counts = { lower, moderate, higher };

  return (
    <div className={styles.impactCard}>
      <span className={styles.impactLabel}>Risk distribution</span>
      <div className={styles.riskRows}>
        {RISK_TIERS.map(({ key, label, lightColor, darkColor }) => {
          const count = counts[key];
          const color = theme === "dark" ? darkColor : lightColor;
          const pct = total > 0 ? (count / total) * 100 : 0;
          return (
            <div className={styles.riskRow} key={key}>
              <span className={styles.riskDot} style={{ background: color }} />
              <span className={styles.riskLabel}>{label}</span>
              <div className={styles.riskBarTrack}>
                <div
                  className={styles.riskBarFill}
                  style={{ width: `${pct.toFixed(1)}%`, background: color }}
                />
              </div>
              <span className={styles.riskCount}>
                {count.toLocaleString()} ({Math.round(pct)}%)
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function MillsClient({
  mills,
  rspoCertified,
  millCount,
  riskDistribution,
}: Props) {
  const router = useRouter();
  const { theme } = useTheme();

  const [query, setQuery] = React.useState("");
  const [activeIdx, setActiveIdx] = React.useState(-1);
  const resultsRef = React.useRef<HTMLDivElement>(null);

  const [sortKey, setSortKey] = React.useState<SortKey>("label");
  const [sortDir, setSortDir] = React.useState<SortDir>("asc");
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
  }, [sortKey, sortDir]);

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
        if (sortKey === "riskScore") {
          const nullFallback =
            sortDir === "asc"
              ? Number.POSITIVE_INFINITY
              : Number.NEGATIVE_INFINITY;
          const av = a.riskScore ?? nullFallback;
          const bv = b.riskScore ?? nullFallback;
          return sortDir === "asc" ? av - bv : bv - av;
        }
        const av = (a[sortKey] as string) ?? "";
        const bv = (b[sortKey] as string) ?? "";
        return sortDir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
      }),
    [mills, sortKey, sortDir]
  );

  const totalPages = Math.ceil(sorted.length / PAGE_SIZE);
  const pageRows = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

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

      {/* Impact cards */}
      <div className={styles.impactGrid}>
        <div className={styles.impactCard}>
          <span className={styles.impactLabel}>RSPO certification</span>
          <RspoDonut certified={rspoCertified} total={millCount} />
        </div>

        <RiskDistributionCard distribution={riskDistribution} />
      </div>

      {/* Mill directory table */}
      <section>
        <div className={styles.tableHeader}>
          <span className={styles.sectionTitle}>All mills</span>
          <span className={styles.tableCount}>
            {sorted.length.toLocaleString()} mills
          </span>
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
                  className={`${styles.thScore} ${sortKey === "riskScore" ? styles.thActive : ""}`}
                  onClick={() => handleSort("riskScore")}
                >
                  <span className={styles.thInner}>
                    Risk
                    <SortIcon active={sortKey === "riskScore"} dir={sortDir} />
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
                    <td className={styles.tdScore}>
                      {mill.riskScore !== null && (
                        <span
                          className={styles.riskDotCell}
                          style={{
                            background: scoreColor(mill.riskScore, theme),
                          }}
                        />
                      )}
                    </td>
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
    </div>
  );
}
