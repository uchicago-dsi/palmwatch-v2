"use client";
import { useDropdownStore } from "@/stores/superDropdownStore";
import Link from "next/link";
import React, { useCallback, useEffect, useMemo } from "react";
// @ts-ignore
import debounce from "lodash.debounce";

interface NavBarSuperDropdownProps {
  icon: React.ReactNode;
  label: string;
  options: Array<{ label: string; href: string; imgPath?: string }>;
  path: string;
}

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
  const numPages = Math.ceil(options.length / (colLength * rows));

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

export const NavBarSuperDropdown: React.FC<NavBarSuperDropdownProps> = ({
  icon,
  label,
  options,
  path,
}) => {
  const { currentDropdown, setcurrentDropdown } = useDropdownStore();
  const [searchTerm, setSearchTerm] = React.useState("");
  const [currentPage, setCurrentPage] = React.useState(0);
  const isActive = currentDropdown === label;
  const rows = options.length > 32 ? 16 : 8;
  const columns = 4;
  const alphabeticalOptions = useMemo(
    () =>
      options.sort((a, b) => {
        return a.label.localeCompare(b.label);
      }),
    [options]
  );
  const { hasPages, items } = useMemo(
    () => paginateOptions(alphabeticalOptions, columns, rows, searchTerm, "label"),
    [alphabeticalOptions, searchTerm]
  );
  useEffect(() => {
    setCurrentPage(0);
  }, [items]);
  const currentItems = items[currentPage];
  const pages = items.length;

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
  return (
    <>
      <li key={label}>
        <button
          className={`tooltip tooltip-bottom ${isActive ? "bg-info" : ""}`}
          data-tip={label}
          onClick={() => setcurrentDropdown(label)}
        >
          <svg
            className="w-6 h-6"
            version="1.1"
            viewBox="0 0 100 100"
            xmlns="http://www.w3.org/2000/svg"
          >
            {icon}
          </svg>
        </button>
      </li>
      {isActive && (
        <>
          <button
            onClick={() => setcurrentDropdown("")}
            className="w-full h-[100vh] absolute top-[100%] left-0 bg-black opacity-30 shadow-xl"
          ></button>
          <div className="w-full absolute top-[100%] p-4 left-0 bg-neutral-100 shadow-xl pr-4">
            <div className={`flex flex-row overflow-x-auto space-x-4`}>
                  <div className="p-4 flex-col justify-around border-r-2 border-r-neutral-400 space-y-4">
                      <h3 className="text-lg text-bold">{label}</h3>
                      <div>
                      <Link href={path} className="btn-link">{label} Overview</Link></div>
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
                  {currentItems.map((column: any[]) => (
                    <div className="flex flex-col space-y-1 flex-1">
                      {column.map((option) => (
                        <div key={option.label}>
                          <Link
                            className="btn-link"
                            href={`${path}/${option.href}`}
                          >
                            <div className="flex flex-col">
                              {Boolean(option.imgPath) && (
                                <img
                                  src={option.imgPath}
                                  alt={option.label}
                                  className="w-20 h-20"
                                />
                              )}
                              <p>{option.label}</p>
                            </div>
                          </Link>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
          </div>
        </>
      )}
    </>
  );
};

const InnerTextComponent: React.FC<{ label: string, onChange: (s: string) => void }> = ({
  onChange,
  label
}) => {
  const [innerSearchTerm, setInnerSearchTerm] = React.useState("");

  const debounceOnChange = useCallback(
    debounce((search: string) => {
      onChange(search);
    }, 100),
    []
  );

  const handleInput = (text: string) => {
    setInnerSearchTerm(text);
    // debounce onChange
    debounceOnChange(text);
  };
  return (
    <input
      type="text"
      placeholder={`Search for ${label} here`}
      className="input input-bordered w-full max-w-xs"
      value={innerSearchTerm}
      onChange={(e) => handleInput(e.target.value)}
    />
  );
};
