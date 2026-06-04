"use client";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React from "react";
import { useTheme } from "@/components/theme-provider";
import type { IsoMap } from "./choropleth-map";
import styles from "./countries-directory.module.css";

const ChoroplethMap = dynamic(() => import("./choropleth-map"), {
  ssr: false,
  loading: () => <div className={styles.mapPlaceholder} />,
});

export interface CountryRow {
  count: number;
  currentRisk: number;
  futureRisk: number;
  href: string;
  isoCode: string; // ISO 3166-1 numeric as string, e.g. "360"
  name: string;
  pastRisk: number;
  pctForestLoss: number;
  score: number;
}

interface StatCard {
  label: string;
  value: string;
}
type SortKey =
  | "name"
  | "count"
  | "pctForestLoss"
  | "pastRisk"
  | "currentRisk"
  | "futureRisk";
type SortDir = "asc" | "desc";

interface Props {
  rows: CountryRow[];
  stats: StatCard[];
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

// ── Main component ──────────────────────────────────────────────────────────

export function CountriesClient({ rows, stats }: Props) {
  const router = useRouter();
  const { theme } = useTheme();

  const [sortKey, setSortKey] = React.useState<SortKey>("count");
  const [sortDir, setSortDir] = React.useState<SortDir>("desc");

  const sorted = React.useMemo(
    () =>
      [...rows].sort((a, b) => {
        const av = a[sortKey] as string | number;
        const bv = b[sortKey] as string | number;
        if (typeof av === "string") {
          return sortDir === "asc"
            ? av.localeCompare(bv as string)
            : (bv as string).localeCompare(av);
        }
        return sortDir === "asc"
          ? (av as number) - (bv as number)
          : (bv as number) - (av as number);
      }),
    [rows, sortKey, sortDir]
  );

  // Build iso→row map for the map component
  const isoMap = React.useMemo(() => {
    const m: IsoMap = {};
    for (const row of rows) {
      if (row.isoCode) {
        m[row.isoCode] = row;
      }
    }
    return m;
  }, [rows]);

  function handleSort(key: SortKey) {
    if (key === sortKey) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  }

  return (
    <div className={styles.page}>
      {/* Hero */}
      <section className={styles.hero}>
        <h1 className={styles.heroTitle}>Palm oil production by country</h1>
        <p className={styles.heroBody}>
          PalmWatch tracks {rows.length} countries where palm oil mills operate.
          Indonesia and Malaysia dominate global production, together accounting
          for over 80% of tracked mills, but cultivation and associated
          deforestation spans Southeast Asia, West Africa, and Latin America.
        </p>
      </section>

      {/* Stat cards */}
      <div className={styles.statsGrid}>
        {stats.map((s) => (
          <div className={styles.statCard} key={s.label}>
            <span className={styles.statLabel}>{s.label}</span>
            <span className={styles.statValue}>{s.value}</span>
          </div>
        ))}
      </div>

      {/* Map */}
      <div className={styles.mapCard}>
        <ChoroplethMap
          isoMap={isoMap}
          onNavigate={(href) => router.push(href)}
          theme={theme}
        />
      </div>

      {/* Table */}
      <section>
        <div className={styles.tableHeader}>
          <span className={styles.sectionTitle}>All countries</span>
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
                    Country
                    <SortIcon active={sortKey === "name"} dir={sortDir} />
                  </span>
                </th>
                <th
                  className={`${styles.thMills} ${sortKey === "count" ? styles.thActive : ""}`}
                  onClick={() => handleSort("count")}
                >
                  <span className={styles.thInner}>
                    Mills
                    <SortIcon active={sortKey === "count"} dir={sortDir} />
                  </span>
                </th>
                <th
                  className={`${styles.thForest} ${sortKey === "pctForestLoss" ? styles.thActive : ""}`}
                  onClick={() => handleSort("pctForestLoss")}
                >
                  <span className={styles.thInner}>
                    Forest loss (2001–2025)
                    <SortIcon
                      active={sortKey === "pctForestLoss"}
                      dir={sortDir}
                    />
                  </span>
                </th>
                <th
                  className={`${styles.thScore} ${sortKey === "pastRisk" ? styles.thActive : ""}`}
                  onClick={() => handleSort("pastRisk")}
                >
                  <span className={styles.thInner}>
                    Avg past score
                    <SortIcon active={sortKey === "pastRisk"} dir={sortDir} />
                  </span>
                </th>
                <th
                  className={`${styles.thScore} ${sortKey === "currentRisk" ? styles.thActive : ""}`}
                  onClick={() => handleSort("currentRisk")}
                >
                  <span className={styles.thInner}>
                    Avg recent score
                    <SortIcon
                      active={sortKey === "currentRisk"}
                      dir={sortDir}
                    />
                  </span>
                </th>
                <th
                  className={`${styles.thScore} ${sortKey === "futureRisk" ? styles.thActive : ""}`}
                  onClick={() => handleSort("futureRisk")}
                >
                  <span className={styles.thInner}>
                    Avg future risk score
                    <SortIcon active={sortKey === "futureRisk"} dir={sortDir} />
                  </span>
                </th>
                <th className={styles.thArrow} />
              </tr>
            </thead>
            <tbody>
              {sorted.length > 0
                ? sorted.map((row) => (
                    <tr
                      className={styles.tr}
                      key={row.name}
                      onClick={() => router.push(row.href)}
                    >
                      <td className={styles.tdName}>
                        <Link
                          className={styles.countryName}
                          href={row.href}
                          onClick={(e) => e.stopPropagation()}
                        >
                          {row.name}
                        </Link>
                      </td>
                      <td className={styles.tdMills}>
                        {row.count.toLocaleString()}
                      </td>
                      <td className={styles.tdForest}>
                        {row.pctForestLoss.toFixed(1)}%
                      </td>
                      <td className={styles.tdScore}>
                        {row.pastRisk.toFixed(2)}
                      </td>
                      <td className={styles.tdScore}>
                        {row.currentRisk.toFixed(2)}
                      </td>
                      <td className={styles.tdScore}>
                        {row.futureRisk.toFixed(2)}
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
                : null}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
