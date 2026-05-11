"use client";
import React, { useEffect, useMemo, useRef } from "react";
// @ts-ignore
import debounce from "lodash.debounce";
import Link from "next/link";

export const MultiSearch: React.FC<{
  options: { [key: string]: { label: string; href: string }[] };
}> = ({ options }) => {
  const [currentOption, setCurrentOption] = React.useState<string>(
    Object.keys(options)[0]
  );
  const [currentListSearch, setCurrentListSearch] = React.useState<string>("");
  const [menuOpen, setMenuOpen] = React.useState<boolean>(true);

  const currentListItems = useMemo(() => {
    if (!currentListSearch?.length) return [];
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
          <summary className="m-0 btn btn-ghost">{currentOption}...</summary>
          <ul className="p-0 shadow menu dropdown-content z-[1] bg-base-100 rounded-box w-52 ">
            {Object.keys(options).map((option) => (
              <li key={option}>
                <a onClick={() => setCurrentOption(option)}>{option}</a>
              </li>
            ))}
          </ul>
        </details>
        <div className="max-w-sm w-full">
          <input
            type="text"
            onChange={(e) => handleSearch(e.target.value)}
            onBlur={debouncedClosed}
            onFocus={() => setMenuOpen(true)}
            placeholder={`Search for ${currentOption}`}
            className="input input-bordered w-full max-w-xs"
          />
          {Boolean(menuOpen && currentListItems.length) && (
            <div className="absolute z-[1] w-full bg-base-100 rounded-box shadow-lg flex flex-col">
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
