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
  totalForestLoss: number;
};

type StatCard = { label: string; value: string };
type SortKey = "overallScore" | "consumer_brand" | "totalForestLoss";
type SortDir = "asc" | "desc";

interface Props {
  brands: BrandRow[];
  stats: StatCard[];
}

function computeOverall(b: BrandRow) {
  return (b.averageCurrentRisk + b.averagePastRisk) / 2;
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

const LEGEND = [
  { label: "Lower risk", swatchClass: styles.swatchTeal },
  { label: "Moderate", swatchClass: styles.swatchAmber },
  { label: "Higher risk", swatchClass: styles.swatchRed },
];

export function BrandsClient({ brands, stats }: Props) {
  const [query, setQuery] = React.useState("");
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
  const q = query.trim().toLowerCase();
  const searchResults =
    q.length >= 2
      ? enriched.filter((r) => r.consumer_brand.toLowerCase().includes(q))
      : [];
  const showResults = q.length >= 2;
  const [activeIdx, setActiveIdx] = React.useState(-1);
  const resultsRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    setActiveIdx(-1);
  }, [q]);

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

  return (
    <div className={styles.page}>
      {/* Hero */}
      <section className={styles.hero}>
        <h1 className={styles.heroTitle}>
          How do major brands score on deforestation?
        </h1>
        <p className={styles.heroBody}>
          PalmWatch tracks 15 major consumer brands and scores each on its links
          to palm oil-driven deforestation. Scores run from 1 (lowest impact) to
          5 (highest). Each brand is connected to the palm oil mills it sources
          from — and from there to the cultivation areas and forests affected by
          that sourcing.
        </p>
      </section>

      {/* Search */}
      <div className={styles.searchWrap}>
        <div className={styles.searchBar}>
          <IconSearch />
          <input
            aria-activedescendant={
              activeIdx >= 0 ? `search-result-${activeIdx}` : undefined
            }
            aria-autocomplete="list"
            aria-controls="brand-search-results"
            aria-expanded={showResults && searchResults.length > 0}
            aria-label="Search brands"
            className={styles.searchInput}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleSearchKeyDown}
            placeholder="Search brands…"
            role="combobox"
            type="search"
            value={query}
          />
        </div>
        {showResults && (
          <div
            className={styles.searchResults}
            id="brand-search-results"
            ref={resultsRef}
            role="listbox"
          >
            {searchResults.length > 0 ? (
              searchResults.map((brand, i) => (
                <Link
                  aria-selected={i === activeIdx}
                  className={`${styles.searchResultItem} ${i === activeIdx ? styles.searchResultActive : ""}`}
                  href={brand.href}
                  id={`search-result-${i}`}
                  key={brand.consumer_brand}
                  role="option"
                >
                  {brand.consumer_brand}
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
                No brands match &ldquo;{query}&rdquo;
              </span>
            )}
          </div>
        )}
      </div>

      {/* Stat cards */}
      <div className={styles.statsGrid}>
        {stats.map((s) => (
          <div className={styles.statCard} key={s.label}>
            <span className={styles.statLabel}>{s.label}</span>
            <span className={styles.statValue}>{s.value}</span>
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
                    Score
                    <SortIcon
                      active={sortKey === "overallScore"}
                      dir={sortDir}
                    />
                  </span>
                </th>
                <th
                  className={`${styles.thForest} ${sortKey === "totalForestLoss" ? styles.thActive : ""}`}
                  onClick={() => handleSort("totalForestLoss")}
                >
                  <span className={styles.thInner}>
                    Forest Loss (km²)
                    <SortIcon
                      active={sortKey === "totalForestLoss"}
                      dir={sortDir}
                    />
                  </span>
                </th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((row) => (
                <tr className={styles.tr} key={row.consumer_brand}>
                  <td className={styles.tdRank}>{row.rank}</td>
                  <td className={styles.tdBrand}>
                    <span className={styles.brandName}>
                      {row.consumer_brand}
                    </span>
                  </td>
                  <td className={styles.tdScore}>
                    <div className={styles.scoreWrap}>
                      <div className={styles.scoreBarTrack}>
                        <div
                          className={`${styles.scoreBar} ${scoreColorClass(row.overallScore)}`}
                          style={{
                            width: `${Math.max(0, (row.overallScore / 5) * 100)}%`,
                          }}
                        />
                      </div>
                      <span className={styles.scoreNum}>
                        {row.overallScore.toFixed(2)}
                      </span>
                    </div>
                  </td>
                  <td className={styles.tdForest}>
                    {row.totalForestLoss.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Legend */}
        <div className={styles.legend}>
          {LEGEND.map(({ label, swatchClass: sc }) => (
            <div className={styles.legendItem} key={label}>
              <span className={`${styles.legendSwatch} ${sc}`} />
              <span className={styles.legendLabel}>{label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Browse all brands */}
      <section>
        <h2 className={styles.browseTitle}>Browse all brands</h2>
        <div className={styles.browseGrid}>
          {enriched
            .slice()
            .sort((a, b) => a.consumer_brand.localeCompare(b.consumer_brand))
            .map((brand) => (
              <Link
                className={styles.browseCard}
                href={brand.href}
                key={brand.consumer_brand}
              >
                <span className={styles.browseCardName}>
                  {brand.consumer_brand}
                </span>
                <svg
                  aria-hidden
                  className={styles.browseCardChevron}
                  fill="none"
                  height="16"
                  viewBox="0 0 24 24"
                  width="16"
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
            ))}
        </div>
      </section>
    </div>
  );
}
