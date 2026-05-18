"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React from "react";
import styles from "./brands.module.css";

type BrandRow = {
  consumer_brand: string;
  averageCurrentRisk: number;
  averageFutureRisk: number;
  averagePastRisk: number;
  millCount: number;
};

type StatCard = {
  label: string;
  value: string;
  dotCategory?: "red" | "amber" | "teal";
};
type SortKey = "overallScore" | "consumer_brand" | "averagePastRisk";
type SortDir = "asc" | "desc";

interface Props {
  brands: BrandRow[];
  stats: StatCard[];
}

function computeOverall(b: BrandRow) {
  return b.averageCurrentRisk;
}

function scoreColorClass(score: number) {
  if (score < 2.85) {
    return styles.barTeal;
  }
  if (score <= 3.05) {
    return styles.barAmber;
  }
  return styles.barRed;
}

function swatchClass(score: number) {
  if (score < 2.85) {
    return styles.swatchTeal;
  }
  if (score <= 3.05) {
    return styles.swatchAmber;
  }
  return styles.swatchRed;
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

export function BrandsClient({ brands, stats }: Props) {
  const [sortKey, setSortKey] = React.useState<SortKey>("overallScore");
  const [sortDir, setSortDir] = React.useState<SortDir>("desc");

  function handleSort(key: SortKey) {
    if (key === sortKey) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  }

  const enriched = React.useMemo(
    () =>
      brands.map((b) => ({
        ...b,
        overallScore: computeOverall(b),
        href: `/brand/${b.consumer_brand}`,
      })),
    [brands]
  );

  const sorted = React.useMemo(() => {
    const rows = [...enriched].sort((a, b) => {
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
    });
    return rows.map((r, i) => ({ ...r, rank: i + 1 }));
  }, [enriched, sortKey, sortDir]);

  const router = useRouter();

  return (
    <div className={styles.page}>
      {/* Hero */}
      <section className={styles.hero}>
        <h1 className={styles.heroTitle}>
          Consumer brands in the palm oil supply chain
        </h1>
        <p className={styles.heroBody}>
          PalmWatch tracks 15 major consumer brands and scores each on its links
          to palm oil-driven deforestation. Scores run from 1 (lowest impact) to
          5 (highest). Each brand is connected to the palm oil mills it sources
          from — and from there to the cultivation areas and forests affected by
          that sourcing.
        </p>
      </section>

      {/* Stat cards */}
      <div className={styles.statsGrid}>
        {stats.map((s) => (
          <div className={styles.statCard} key={s.label}>
            <span className={styles.statLabel}>{s.label}</span>
            {s.dotCategory ? (
              <div className={styles.statValueRow}>
                <span
                  className={`${styles.scoreDot} ${
                    s.dotCategory === "red"
                      ? styles.scoreDotRed
                      : s.dotCategory === "amber"
                        ? styles.scoreDotAmber
                        : styles.scoreDotTeal
                  }`}
                />
                <span className={styles.statValue}>{s.value}</span>
              </div>
            ) : (
              <span className={styles.statValue}>{s.value}</span>
            )}
          </div>
        ))}
      </div>

      {/* Rankings table */}
      <section>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.thRank}>#</th>
                <th
                  className={`${styles.thBrand} ${sortKey === "consumer_brand" ? styles.thActive : ""}`}
                  onClick={() => handleSort("consumer_brand")}
                >
                  <span className={styles.thInner}>
                    Brand
                    <SortIcon
                      active={sortKey === "consumer_brand"}
                      dir={sortDir}
                    />
                  </span>
                </th>
                <th
                  className={`${styles.thScore} ${sortKey === "overallScore" ? styles.thActive : ""}`}
                  onClick={() => handleSort("overallScore")}
                >
                  <span className={styles.thInner}>
                    Recent Deforestation Score
                    <SortIcon
                      active={sortKey === "overallScore"}
                      dir={sortDir}
                    />
                  </span>
                </th>
                <th
                  className={`${styles.thScore} ${sortKey === "averagePastRisk" ? styles.thActive : ""}`}
                  onClick={() => handleSort("averagePastRisk")}
                >
                  <span className={styles.thInner}>
                    Past Deforestation Score
                    <SortIcon
                      active={sortKey === "averagePastRisk"}
                      dir={sortDir}
                    />
                  </span>
                </th>
                <th className={styles.thArrow} />
              </tr>
            </thead>
            <tbody>
              {sorted.map((row) => (
                <tr
                  className={styles.tr}
                  key={row.consumer_brand}
                  onClick={() => router.push(row.href)}
                >
                  <td className={styles.tdRank}>{row.rank}</td>
                  <td className={styles.tdBrand}>
                    <Link
                      className={styles.brandName}
                      href={row.href}
                      onClick={(e) => e.stopPropagation()}
                    >
                      {row.consumer_brand}
                    </Link>
                  </td>
                  <td className={styles.tdScore}>
                    {row.overallScore.toFixed(2)}
                  </td>
                  <td className={styles.tdScore}>
                    {row.averagePastRisk.toFixed(2)}
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
              ))}
            </tbody>
          </table>
        </div>
      </section>


    </div>
  );
}
