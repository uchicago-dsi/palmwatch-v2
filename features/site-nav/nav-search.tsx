"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import React from "react";
import type { SearchListPayload } from "@/domain/search-list";
import { emptySearchListPayload } from "@/domain/search-list";
import styles from "./nav-search.module.css";

const MAX_RESULTS = 20;
const MIN_QUERY_LEN = 3;

/** Display order for grouped results (countries and brands first). */
const GROUP_ORDER = ["Countries", "Brands", "Mills", "Companies"] as const;

type GroupLabel = (typeof GROUP_ORDER)[number];

type NavSearchItem = {
  label: string;
  href: string;
  category: string;
  groupLabel: GroupLabel;
};

function flattenSearchList(payload: SearchListPayload): NavSearchItem[] {
  const items: NavSearchItem[] = [];

  for (const entry of payload.Countries) {
    items.push({
      label: entry.label,
      href: entry.href,
      category: "Country",
      groupLabel: "Countries",
    });
  }

  for (const entry of payload.Brands) {
    items.push({
      label: entry.label,
      href: entry.href,
      category: "Brand",
      groupLabel: "Brands",
    });
  }

  for (const entry of payload.Mills) {
    items.push({
      label: entry.label,
      href: entry.href,
      category: "Mill",
      groupLabel: "Mills",
    });
  }

  const companiesByHref = new Map<string, NavSearchItem>();
  for (const entry of [...payload["Mill Owners"], ...payload["Mill Groups"]]) {
    companiesByHref.set(entry.href, {
      label: entry.label,
      href: entry.href,
      category: "Company",
      groupLabel: "Companies",
    });
  }
  const companies = [...companiesByHref.values()].sort((a, b) =>
    a.label.localeCompare(b.label)
  );
  items.push(...companies);

  return items;
}

function filterResults(items: NavSearchItem[], query: string): NavSearchItem[] {
  const q = query.trim().toLowerCase();
  if (q.length < MIN_QUERY_LEN) {
    return [];
  }

  const matched = items.filter((item) => item.label.toLowerCase().includes(q));
  const byGroup = new Map<GroupLabel, NavSearchItem[]>();
  for (const item of matched) {
    const list = byGroup.get(item.groupLabel) ?? [];
    list.push(item);
    byGroup.set(item.groupLabel, list);
  }

  const capped: NavSearchItem[] = [];
  for (const groupLabel of GROUP_ORDER) {
    const group = byGroup.get(groupLabel) ?? [];
    for (const item of group) {
      if (capped.length >= MAX_RESULTS) {
        return capped;
      }
      capped.push(item);
    }
  }
  return capped;
}

function groupItems(items: NavSearchItem[]) {
  const byGroup = new Map<GroupLabel, NavSearchItem[]>();
  for (const item of items) {
    const list = byGroup.get(item.groupLabel) ?? [];
    list.push(item);
    byGroup.set(item.groupLabel, list);
  }

  const groups: { groupLabel: GroupLabel; items: NavSearchItem[] }[] = [];
  for (const groupLabel of GROUP_ORDER) {
    const itemsInGroup = byGroup.get(groupLabel);
    if (itemsInGroup?.length) {
      groups.push({ groupLabel, items: itemsInGroup });
    }
  }
  return groups;
}

function IconSearch() {
  return (
    <svg
      aria-hidden
      className={styles.searchIcon}
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

function IconChevron() {
  return (
    <svg
      aria-hidden
      className={styles.resultChevron}
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
  );
}

export function NavSearch() {
  const router = useRouter();
  const pathname = usePathname();
  const wrapRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const resultsRef = React.useRef<HTMLDivElement>(null);

  const [allItems, setAllItems] = React.useState<NavSearchItem[]>([]);
  const [query, setQuery] = React.useState("");
  const [expanded, setExpanded] = React.useState(false);
  const [dropdownOpen, setDropdownOpen] = React.useState(false);
  const [activeIdx, setActiveIdx] = React.useState(-1);

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/list");
        if (!res.ok) {
          throw new Error("search list fetch failed");
        }
        const json = (await res.json()) as SearchListPayload;
        if (!cancelled) {
          setAllItems(flattenSearchList(json ?? emptySearchListPayload));
        }
      } catch {
        if (!cancelled) {
          setAllItems([]);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  React.useEffect(() => {
    setQuery("");
    setExpanded(false);
    setDropdownOpen(false);
    setActiveIdx(-1);
  }, [pathname]);

  const trimmedQuery = query.trim();
  const q = trimmedQuery.toLowerCase();
  const queryReady = q.length >= MIN_QUERY_LEN;
  const showResults = queryReady && dropdownOpen;

  const searchResults = React.useMemo(
    () => (queryReady ? filterResults(allItems, trimmedQuery) : []),
    [allItems, trimmedQuery, queryReady]
  );

  const groupedResults = React.useMemo(() => {
    const groups = groupItems(searchResults);
    let offset = 0;
    return groups.map((group) => {
      const startIndex = offset;
      offset += group.items.length;
      return { ...group, startIndex };
    });
  }, [searchResults]);

  React.useEffect(() => {
    setActiveIdx(-1);
    if (queryReady) {
      setDropdownOpen(true);
    }
  }, [q, queryReady]);

  React.useEffect(() => {
    if (!expanded) {
      return;
    }

    function onPointerDown(ev: PointerEvent) {
      const root = wrapRef.current;
      if (root && !root.contains(ev.target as Node)) {
        setQuery("");
        setDropdownOpen(false);
        setActiveIdx(-1);
        setExpanded(false);
      }
    }

    document.addEventListener("pointerdown", onPointerDown, true);
    return () =>
      document.removeEventListener("pointerdown", onPointerDown, true);
  }, [expanded]);

  React.useEffect(() => {
    if (activeIdx < 0) {
      return;
    }
    const el = document.getElementById(`nav-search-result-${activeIdx}`);
    el?.scrollIntoView({ block: "nearest" });
  }, [activeIdx]);

  function openSearch() {
    setExpanded(true);
    requestAnimationFrame(() => inputRef.current?.focus());
  }

  function closeSearch() {
    setQuery("");
    setExpanded(false);
    setDropdownOpen(false);
    setActiveIdx(-1);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Escape") {
      e.preventDefault();
      closeSearch();
      return;
    }

    if (!showResults) {
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (searchResults.length === 0) {
        return;
      }
      setActiveIdx((i) => (i < searchResults.length - 1 ? i + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (searchResults.length === 0) {
        return;
      }
      setActiveIdx((i) => (i > 0 ? i - 1 : searchResults.length - 1));
    } else if (e.key === "Enter" && activeIdx >= 0) {
      e.preventDefault();
      const target = searchResults[activeIdx];
      if (target) {
        router.push(target.href);
        closeSearch();
      }
    }
  }

  return (
    <div className={styles.wrap} ref={wrapRef}>
      {expanded ? (
        <div className={styles.inputRow}>
          <IconSearch />
          <input
            aria-activedescendant={
              activeIdx >= 0 ? `nav-search-result-${activeIdx}` : undefined
            }
            aria-autocomplete="list"
            aria-controls="nav-search-results"
            aria-expanded={showResults}
            aria-label="Search site"
            className={styles.input}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => {
              if (queryReady) {
                setDropdownOpen(true);
              }
            }}
            onKeyDown={handleKeyDown}
            placeholder="Search..."
            ref={inputRef}
            role="combobox"
            type="search"
            value={query}
          />
        </div>
      ) : (
        <button
          aria-label="Open search"
          className={styles.trigger}
          onClick={openSearch}
          type="button"
        >
          <IconSearch />
          <span className={styles.triggerLabel}>Search</span>
        </button>
      )}

      {showResults && (
        <div
          className={styles.results}
          id="nav-search-results"
          ref={resultsRef}
          role="listbox"
        >
          {searchResults.length > 0 ? (
            groupedResults.map((group, groupIndex) => (
              <div
                className={styles.resultGroup}
                key={`search-group-${groupIndex}`}
              >
                <div className={styles.groupHeader} role="presentation">
                  {group.groupLabel}
                </div>
                {group.items.map((item, itemIndex) => {
                  const idx = group.startIndex + itemIndex;
                  const active = idx === activeIdx;
                  return (
                    <Link
                      aria-selected={active}
                      className={`${styles.resultItem} ${active ? styles.resultActive : ""}`}
                      href={item.href}
                      id={`nav-search-result-${idx}`}
                      key={item.href}
                      onClick={closeSearch}
                      role="option"
                    >
                      <span className={styles.resultLabel}>{item.label}</span>
                      <span className={styles.resultCategory}>
                        {item.category}
                      </span>
                      <IconChevron />
                    </Link>
                  );
                })}
              </div>
            ))
          ) : (
            <span className={styles.noMatch}>
              No results for &ldquo;{query}&rdquo;
            </span>
          )}
        </div>
      )}
    </div>
  );
}
