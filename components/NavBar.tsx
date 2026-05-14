"use client";
import Link from "next/link";
import React from "react";
import { MENU_ITEMS } from "@/config/navBarConfig";
import type { SearchListPayload } from "@/types/searchList";
import { NavBarSuperDropdown } from "./NavBarSuperDropdown";

interface NavbarProps {
  children?: React.ReactNode;
  searchList?: SearchListPayload;
}

export const NavBar: React.FC<NavbarProps> = ({ searchList, children }) => {
  const [innerSearchList, setInnerSearchList] =
    React.useState<NavbarProps["searchList"]>();

  React.useEffect(() => {
    if (innerSearchList !== undefined) {
      return;
    }
    if (searchList) {
      setInnerSearchList(searchList);
      return;
    }
    let cancelled = false;
    (async () => {
      const res = await fetch("/api/list");
      const json = await res.json();
      if (!cancelled) {
        setInnerSearchList(json);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [searchList, innerSearchList]);

  return (
    <div className="drawer z-50">
      <input className="drawer-toggle" id="my-drawer-3" type="checkbox" />
      <div className="drawer-content flex max-w-full flex-col">
        {/* Navbar */}
        <div className="navbar relative z-10 w-full bg-base-300">
          <div className="flex-none lg:hidden">
            <label
              aria-label="open sidebar"
              className="btn btn-square btn-ghost"
              htmlFor="my-drawer-3"
            >
              <svg
                className="inline-block h-6 w-6 stroke-current"
                fill="none"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M4 6h16M4 12h16M4 18h16"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                />
              </svg>
            </label>
          </div>
          <div className="mx-2 flex-none px-2">
            <ul className="menu menu-horizontal">
              <li>
                <Link className="font-bold" href="/">
                  PalmWatch
                  {/* <i className="text-accent inline">beta</i> */}
                </Link>
              </li>
            </ul>
          </div>
          <div className="hidden flex-1 px-2 lg:block">
            <div className="mx-auto block w-fit">
              <ul className="menu menu-horizontal rounded-xl bg-base-100 p-0">
                {/* Navbar menu content here */}
                <li className="pointer-events-none">
                  <p>Search:</p>
                </li>
                {MENU_ITEMS.map((item) => (
                  <NavBarSuperDropdown
                    description={item.description}
                    icon={item.icon}
                    key={item.label}
                    label={item.label}
                    options={(innerSearchList?.[item.label] as []) || []}
                    path={item.path}
                  />
                ))}
              </ul>
            </div>
          </div>
          <div className="hidden flex-none lg:block">
            <ul className="menu menu-horizontal">
              <li>
                <Link href="/about">About</Link>
              </li>
              <li>
                <Link href="/contact">Contact</Link>
              </li>
            </ul>
          </div>
        </div>
        {children}
      </div>
      <div className="drawer-side">
        <label
          aria-label="close sidebar"
          className="drawer-overlay"
          htmlFor="my-drawer-3"
        />
        <ul className="menu min-h-full w-80 bg-base-200 p-4">
          {/* Sidebar content here */}
          <ul className="menu menu-vertical rounded-xl bg-base-100 p-0 pt-24">
            <li>
              <Link className="mb-8 font-bold" href="/">
                PalmWatch
              </Link>
            </li>
            {MENU_ITEMS.map((item) => (
              <li key={item.label}>
                <Link href={`${item.path}`}>{item.label}</Link>
              </li>
            ))}
            {/* about, contact */}
            <li>
              <Link className="mt-8" href="/about">
                About
              </Link>
            </li>
            <li>
              <Link href="/contact">Contact</Link>
            </li>
          </ul>
        </ul>
      </div>
    </div>
  );
};
