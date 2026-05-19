"use client";
// @ts-expect-error
import debounce from "lodash.debounce";
import Link from "next/link";
import React, { useEffect, useMemo, useRef } from "react";

export const MultiSearch: React.FC<{
  options: { [key: string]: { label: string; href: string }[] };
}> = ({ options }) => {
  const [currentOption, setCurrentOption] = React.useState<string>(
    Object.keys(options)[0]
  );
  const [currentListSearch, setCurrentListSearch] = React.useState<string>("");
  const [menuOpen, setMenuOpen] = React.useState<boolean>(true);

  const currentListItems = useMemo(() => {
    if (!currentListSearch?.length) {
      return [];
    }
    return options[currentOption]
      .filter((item) =>
        item.label.toLowerCase().includes(currentListSearch.toLowerCase())
      )
      .slice(0, 10);
  }, [currentListSearch, currentOption, options]);

  const setCurrentListSearchRef = useRef(setCurrentListSearch);
  setCurrentListSearchRef.current = setCurrentListSearch;
  const handleSearch = useMemo(
    () =>
      debounce((search: string) => {
        setCurrentListSearchRef.current(search);
      }, 100),
    []
  );

  const setMenuOpenRef = useRef(setMenuOpen);
  setMenuOpenRef.current = setMenuOpen;
  const debouncedClosed = useMemo(
    () =>
      debounce(() => {
        setMenuOpenRef.current(false);
      }, 250),
    []
  );

  useEffect(
    () => () => {
      handleSearch.cancel();
      debouncedClosed.cancel();
    },
    [handleSearch, debouncedClosed]
  );

  return (
    <div className="relative">
      <div className="flex flex-row">
        <details className="dropdown mb-32">
          <summary className="btn btn-ghost m-0">{currentOption}...</summary>
          <ul className="menu dropdown-content z-[1] w-52 rounded-box bg-base-100 p-0 shadow">
            {Object.keys(options).map((option) => (
              <li key={option}>
                <button
                  className="w-full text-left"
                  onClick={() => setCurrentOption(option)}
                  type="button"
                >
                  {option}
                </button>
              </li>
            ))}
          </ul>
        </details>
        <div className="w-full max-w-sm">
          <input
            className="input input-bordered w-full max-w-xs"
            onBlur={debouncedClosed}
            onChange={(e) => handleSearch(e.target.value)}
            onFocus={() => setMenuOpen(true)}
            placeholder={`Search for ${currentOption}`}
            type="text"
          />
          {Boolean(menuOpen && currentListItems.length) && (
            <div className="absolute z-[1] flex w-full flex-col rounded-box bg-base-100 shadow-lg">
              {currentListItems.map((item) => (
                <Link className="p-2" href={item.href} key={item.label}>
                  {item.label}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
