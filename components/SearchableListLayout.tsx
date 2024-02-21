"use client";
import Link from "next/link";
import { InnerTextComponent } from "./InnerTextComponent";
import React, { useEffect, useMemo } from "react";

const paginateOptions = (
  _options: any[],
  columns: number,
  rows: number,
  filter?: string,
  filterProp?: string
) => {
  const filterFunc =
    filter && filterProp && filterProp?.length > 2
      ? (s: object) =>
          // @ts-ignore
          s?.[filterProp]?.toLowerCase().includes(filter.toLowerCase())
      : (s: any) => true;
  const options = filter ? _options.filter(filterFunc) : _options;
  const pageLength = rows * columns;
  const hasPages = options.length > pageLength;
  const colLength = hasPages ? rows : Math.ceil(options.length / columns);
  const items: any[][] = [];
  const numPages = Math.ceil(options.length / pageLength);
  for (let i = 0; i < numPages; i++) {
    const page = [];
    for (let j = 0; j < columns; j++) {
      const start = i * pageLength + j * colLength;
      const end = start + colLength;
      page.push(options.slice(start, end));
    }
    items.push(page);
  }
  if (items.length === 0)
    items.push([
      [
        {
          label: "No results found",
          href: "#",
        },
      ],
    ]);
  return {
    hasPages,
    items,
  };
};

export const SearchableListLayout: React.FC<{
  label: string;
  description?: string;
  options: Array<{
    label: string;
    href: string;
    imgPath?: string;
  }>;
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
    () =>
      options.sort((a, b) => {
        return a.label.localeCompare(b.label);
      }),
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
    [alphabeticalOptions, searchTerm]
  );
  useEffect(() => {
    setCurrentPage(0);
  }, [items]);
  const currentItems = items?.[currentPage];
  const pages = items?.length;

  if (!currentItems) return null;

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
  const closeDropdown = () => setcurrentDropdown && setcurrentDropdown("");
  return (
    <div
      className={`flex flex-row overflow-x-auto space-x-4 prose max-w-none w-full`}
    >
      <div className="p-4 flex-col justify-around border-r-2 border-r-base-300 space-y-4">
        <h3 className="m-0">{label}</h3>
        {!!description && <p className="m-0 max-w-[20ch]">{description}</p>}
        {!!path && (
          <div>
            <Link href={path} className="btn-link m-0" onClick={closeDropdown}>
              {label} Overview
            </Link>
          </div>
        )}
        <InnerTextComponent onChange={setSearchTerm} label={label} />
        {hasPages && (
          <div>
            <button
              className="join-item btn"
              onClick={() => pageAction("prev")}
            >
              «
            </button>
            <button className="join-item btn">
              Page {currentPage + 1} / {pages}
            </button>
            <button
              className="join-item btn"
              onClick={() => pageAction("next")}
            >
              »
            </button>
          </div>
        )}
      </div>
      {hasNoOptions ? (
        <p>Loading, please wait...</p>
      ) : (
        currentItems.map((column: any[], idx: number) => (
          <div className="flex flex-col space-y-1 flex-1 m-0 p-0" key={idx}>
            {column.map((option) => (
              <div key={option.label}>
                <Link
                  className="btn-link m-0 p-0 capitalize"
                  href={option.href}
                  onClick={closeDropdown}
                >
                  <div className="flex flex-col">
                    {Boolean(option.imgPath) && (
                      <img
                        src={option.imgPath}
                        alt={option.label}
                        className="w-20 h-20"
                      />
                    )}
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
