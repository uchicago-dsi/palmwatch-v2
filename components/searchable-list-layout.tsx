"use client";
import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useMemo } from "react";
import { InnerTextComponent } from "./inner-text-component";

interface SearchOption {
  href: string;
  imgPath?: string;
  label: string;
}

const paginateOptions = (
  _options: SearchOption[],
  columns: number,
  rows: number,
  filter?: string,
  filterProp?: keyof SearchOption
) => {
  const filterFunc =
    filter && filterProp && filterProp === "label" && filter.length > 2
      ? (s: SearchOption) =>
          s.label.toLowerCase().includes(filter.toLowerCase())
      : (_s: SearchOption) => true;
  const options = filter ? _options.filter(filterFunc) : _options;
  const pageLength = rows * columns;
  const hasPages = options.length > pageLength;
  const colLength = hasPages ? rows : Math.ceil(options.length / columns);
  const items: SearchOption[][][] = [];
  const numPages = Math.ceil(options.length / pageLength);
  for (let i = 0; i < numPages; i++) {
    const page: SearchOption[][] = [];
    for (let j = 0; j < columns; j++) {
      const start = i * pageLength + j * colLength;
      const end = start + colLength;
      page.push(options.slice(start, end));
    }
    items.push(page);
  }
  if (items.length === 0) {
    items.push([
      [
        {
          label: "No results found",
          href: "#",
        },
      ],
    ]);
  }
  return {
    hasPages,
    items,
  };
};

export const SearchableListLayout: React.FC<{
  label: string;
  description?: string;
  options: SearchOption[];
  path?: string;
  rows?: number;
  manyRows?: number;
  columns?: number;
  setcurrentDropdown?: (label: string) => void;
}> = ({
  label,
  description,
  path,
  options,
  rows,
  columns,
  manyRows,
  setcurrentDropdown,
}) => {
  const hasNoOptions = options.length === 0;
  const [searchTerm, setSearchTerm] = React.useState("");
  const [currentPage, setCurrentPage] = React.useState(0);

  const displayRows = options.length > 32 ? manyRows || 16 : rows || 8;
  const displayColumns = columns || 4;
  const alphabeticalOptions = useMemo(
    () => [...options].sort((a, b) => a.label.localeCompare(b.label)),
    [options]
  );
  const { hasPages, items } = useMemo(
    () =>
      paginateOptions(
        alphabeticalOptions,
        displayColumns,
        displayRows,
        searchTerm,
        "label"
      ),
    [alphabeticalOptions, searchTerm, displayColumns, displayRows]
  );
  // Reset pagination when list inputs change (effect body only calls setter).
  // biome-ignore lint/correctness/useExhaustiveDependencies: intentional deps for pagination reset
  useEffect(() => {
    setCurrentPage(0);
  }, [alphabeticalOptions, searchTerm, displayColumns, displayRows]);
  const currentItems = items?.[currentPage];
  const pages = items?.length;

  if (!currentItems) {
    return null;
  }

  const pageAction = (action: "next" | "prev") => {
    setCurrentPage((page) => {
      switch (action) {
        case "next":
          return page + 1 >= pages ? 0 : page + 1;
        case "prev":
          return page - 1 < 0 ? pages - 1 : page - 1;
        default:
          return page;
      }
    });
  };
  const closeDropdown = () => setcurrentDropdown?.("");
  return (
    <div
      className={
        "prose flex w-full max-w-none flex-row space-x-4 overflow-x-auto"
      }
    >
      <div className="flex-col justify-around space-y-4 border-r-2 border-r-base-300 p-4">
        <h3 className="m-0">{label}</h3>
        {!!description && <p className="m-0 max-w-[20ch]">{description}</p>}
        {!!path && (
          <div>
            <Link className="btn-link m-0" href={path} onClick={closeDropdown}>
              {label} Overview
            </Link>
          </div>
        )}
        <InnerTextComponent label={label} onChange={setSearchTerm} />
        {hasPages && (
          <div>
            <button
              className="join-item btn"
              onClick={() => pageAction("prev")}
              type="button"
            >
              «
            </button>
            <button className="join-item btn" type="button">
              Page {currentPage + 1} / {pages}
            </button>
            <button
              className="join-item btn"
              onClick={() => pageAction("next")}
              type="button"
            >
              »
            </button>
          </div>
        )}
      </div>
      {hasNoOptions ? (
        <p>Loading, please wait...</p>
      ) : (
        currentItems.map((column, idx) => (
          <div
            className="m-0 flex flex-1 flex-col space-y-1 p-0"
            key={column.map((o) => o.label).join("|") || `col-${idx}`}
          >
            {column.map((option) => (
              <div key={option.label}>
                <Link
                  className="btn-link m-0 p-0 capitalize"
                  href={option.href}
                  onClick={closeDropdown}
                >
                  <div className="flex flex-col">
                    {option.imgPath ? (
                      <Image
                        alt={option.label}
                        className="h-20 w-20 object-contain"
                        height={80}
                        src={option.imgPath}
                        width={80}
                      />
                    ) : null}
                    {option.label.toLowerCase()}
                  </div>
                </Link>
              </div>
            ))}
          </div>
        ))
      )}
    </div>
  );
};
