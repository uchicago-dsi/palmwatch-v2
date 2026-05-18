"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React from "react";
import styles from "./companies.module.css";

export type CompanyEntry =
  | { label: string; type: "owner"; href: string }
  | { label: string; type: "group"; href: string }
  | { label: string; type: "both"; ownerHref: string; groupHref: string };

type StatCard = { label: string; value: string };
type SortKey = "label" | "type";
type SortDir = "asc" | "desc";
type FilterType = "all" | "owner" | "group";

const PAGE_SIZE = 20;

const TYPE_ORDER = { owner: 0, both: 1, group: 1 } as const;

interface Props {
  companies: CompanyEntry[];
  stats: StatCard[];
}

type RowMode =
  | { dual: true; ownerHref: string; groupHref: string }
  | { dual: false; href: string; displayType: "owner" | "group" };

function getRowMode(company: CompanyEntry, filter: FilterType): RowMode {
  if (company.type === "both") {
    if (filter === "all") {
      return {
        dual: true,
        ownerHref: company.ownerHref,
        groupHref: company.groupHref,
      };
    }
    return {
      dual: false,
      href: filter === "owner" ? company.ownerHref : company.groupHref,
      displayType: filter,
    };
  }
  return { dual: false, href: company.href, displayType: company.type };
}

function getSearchHref(company: CompanyEntry): string {
  if (company.type === "both") return company.groupHref;
  return company.href;
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

function getPageNumbers(current: number, total: number): (number | "...")[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  const nearSet = new Set(
    [1, current - 1, current, current + 1, total].filter(
      (p) => p >= 1 && p <= total
    )
  );
  const near = [...nearSet].sort((a, b) => a - b);
  const result: (number | "...")[] = [];
  let prev = 0;
  for (const p of near) {
    if (p - prev > 1) {
      result.push("...");
    }
    result.push(p);
    prev = p;
  }
  return result;
}

export function CompaniesClient({ companies, stats }: Props) {
  const router = useRouter();

  // Search bar state (dropdown only — does not filter table)
  const [query, setQuery] = React.useState("");
  const [activeIdx, setActiveIdx] = React.useState(-1);
  const resultsRef = React.useRef<HTMLDivElement>(null);

  // Table state
  const [tableFilter, setTableFilter] = React.useState("");
  const [filter, setFilter] = React.useState<FilterType>("all");
  const [sortKey, setSortKey] = React.useState<SortKey>("label");
  const [sortDir, setSortDir] = React.useState<SortDir>("asc");
  const [page, setPage] = React.useState(1);

  const q = query.trim().toLowerCase();
  const showResults = q.length >= 2;

  const searchResults = React.useMemo(
    () =>
      showResults
        ? companies
            .filter((c) => c.label.toLowerCase().includes(q))
            .slice(0, 8)
        : [],
    [companies, q, showResults]
  );

  React.useEffect(() => {
    setActiveIdx(-1);
  }, [q]);

  React.useEffect(() => {
    setPage(1);
  }, [filter, tableFilter, sortKey, sortDir]);

  React.useEffect(() => {
    if (activeIdx < 0 || !resultsRef.current) return;
    const item = resultsRef.current.children[activeIdx] as HTMLElement | undefined;
    item?.scrollIntoView({ block: "nearest" });
  }, [activeIdx]);

  function handleSearchKeyDown(e: React.KeyboardEvent) {
    if (!showResults || searchResults.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIdx((i) => (i < searchResults.length - 1 ? i + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIdx((i) => (i > 0 ? i - 1 : searchResults.length - 1));
    } else if (e.key === "Enter" && activeIdx >= 0) {
      e.preventDefault();
      router.push(getSearchHref(searchResults[activeIdx]));
    } else if (e.key === "Escape") {
      setQuery("");
    }
  }

  const filtered = React.useMemo(() => {
    let rows = companies;
    if (filter !== "all") {
      rows = rows.filter((c) => c.type === filter || c.type === "both");
    }
    const tf = tableFilter.trim().toLowerCase();
    if (tf) {
      rows = rows.filter((c) => c.label.toLowerCase().includes(tf));
    }
    return rows;
  }, [companies, filter, tableFilter]);

  const sorted = React.useMemo(
    () =>
      [...filtered].sort((a, b) => {
        if (sortKey === "type") {
          const diff = TYPE_ORDER[a.type] - TYPE_ORDER[b.type];
          return sortDir === "asc" ? diff : -diff;
        }
        return sortDir === "asc"
          ? a.label.localeCompare(b.label)
          : b.label.localeCompare(a.label);
      }),
    [filtered, sortKey, sortDir]
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

  const pageNumbers = getPageNumbers(page, totalPages);

  return (
    <div className={styles.page}>
      {/* Hero */}
      <section className={styles.hero}>
        <h1 className={styles.heroTitle}>
          Companies in the palm oil supply chain
        </h1>
        <p className={styles.heroBody}>
          The companies that own and operate palm oil mills. Mill owners run
          mills directly; corporate groups are parent companies that control one
          or more mill owners.
        </p>
      </section>

      {/* Search with dropdown */}
      <div className={styles.searchWrap}>
        <div className={styles.searchBar}>
          <IconSearch />
          <input
            aria-activedescendant={
              activeIdx >= 0 ? `company-result-${activeIdx}` : undefined
            }
            aria-autocomplete="list"
            aria-controls="company-search-results"
            aria-expanded={showResults && searchResults.length > 0}
            aria-label="Search companies"
            className={styles.searchInput}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleSearchKeyDown}
            placeholder="Search companies…"
            role="combobox"
            type="search"
            value={query}
          />
        </div>
        {showResults && (
          <div
            className={styles.searchResults}
            id="company-search-results"
            ref={resultsRef}
            role="listbox"
          >
            {searchResults.length > 0 ? (
              searchResults.map((company, i) => (
                <Link
                  aria-selected={i === activeIdx}
                  className={`${styles.searchResultItem} ${i === activeIdx ? styles.searchResultActive : ""}`}
                  href={getSearchHref(company)}
                  id={`company-result-${i}`}
                  key={company.label}
                  role="option"
                >
                  <span>{company.label}</span>
                  <span className={styles.searchResultMeta}>
                    {company.type === "owner"
                      ? "Mill owner"
                      : company.type === "group"
                        ? "Corporate group"
                        : "Mill owner · Group"}
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
                No companies match &ldquo;{query}&rdquo;
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

      {/* Type filter chips */}
      <div className={styles.filterRow}>
        <div className={styles.chips}>
          {(
            [
              { key: "all", label: "All" },
              { key: "owner", label: "Mill owners" },
              { key: "group", label: "Corporate groups" },
            ] as const
          ).map(({ key, label }) => (
            <button
              className={`${styles.chip} ${filter === key ? styles.chipActive : ""}`}
              key={key}
              onClick={() => setFilter(key)}
              type="button"
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <section>
        <div className={styles.tableHeader}>
          <div className={styles.tableHeaderLeft}>
            <span className={styles.sectionTitle}>All companies</span>
            <span className={styles.tableCount}>
              {sorted.length.toLocaleString()} companies
            </span>
          </div>
          <div className={styles.tableFilterWrap}>
            <IconSearch />
            <input
              aria-label="Filter companies"
              className={styles.tableFilterInput}
              onChange={(e) => setTableFilter(e.target.value)}
              placeholder="Filter by company…"
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
                  className={`${styles.thCompany} ${sortKey === "label" ? styles.thActive : ""}`}
                  onClick={() => handleSort("label")}
                >
                  <span className={styles.thInner}>
                    Company
                    <SortIcon active={sortKey === "label"} dir={sortDir} />
                  </span>
                </th>
                <th
                  className={`${styles.thType} ${sortKey === "type" ? styles.thActive : ""}`}
                  onClick={() => handleSort("type")}
                >
                  <span className={styles.thInner}>
                    Type
                    <SortIcon active={sortKey === "type"} dir={sortDir} />
                  </span>
                </th>
                <th className={styles.thArrow} />
              </tr>
            </thead>
            <tbody>
              {pageRows.length > 0 ? (
                pageRows.map((company) => {
                  const mode = getRowMode(company, filter);
                  if (mode.dual) {
                    return (
                      <tr
                        className={`${styles.tr} ${styles.trDual}`}
                        key={company.label}
                      >
                        <td className={styles.tdCompany}>
                          <Link
                            className={styles.companyName}
                            href={mode.groupHref}
                          >
                            {company.label}
                          </Link>
                        </td>
                        <td className={styles.tdType}>
                          <div className={styles.badgePair}>
                            <Link
                              className={styles.badgeOwnerLink}
                              href={mode.ownerHref}
                              onClick={(e) => e.stopPropagation()}
                            >
                              Mill owner
                            </Link>
                            <Link
                              className={styles.badgeGroupLink}
                              href={mode.groupHref}
                              onClick={(e) => e.stopPropagation()}
                            >
                              Corporate group
                            </Link>
                          </div>
                        </td>
                        <td className={styles.tdArrow} />
                      </tr>
                    );
                  }

                  return (
                    <tr
                      className={styles.tr}
                      key={company.label}
                      onClick={() => router.push(mode.href)}
                    >
                      <td className={styles.tdCompany}>
                        <Link
                          className={styles.companyName}
                          href={mode.href}
                          onClick={(e) => e.stopPropagation()}
                        >
                          {company.label}
                        </Link>
                      </td>
                      <td className={styles.tdType}>
                        {mode.displayType === "owner" ? (
                          <span className={styles.badgeOwner}>Mill owner</span>
                        ) : (
                          <span className={styles.badgeGroup}>
                            Corporate group
                          </span>
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
                  );
                })
              ) : (
                <tr>
                  <td className={styles.noResults} colSpan={3}>
                    No companies found.
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
              {pageNumbers.map((n, i) =>
                n === "..." ? (
                  <span className={styles.pageEllipsis} key={`ellipsis-${i}`}>
                    …
                  </span>
                ) : (
                  <button
                    className={n === page ? styles.pageNumActive : styles.pageNum}
                    key={n}
                    onClick={() => setPage(n)}
                    type="button"
                  >
                    {n}
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
      </section>
    </div>
  );
}
