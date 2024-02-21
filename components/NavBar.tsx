"use client";
import queryClient from "@/utils/getMillData";
import React from "react";
import Link from "next/link";
import { NavBarSuperDropdown } from "./NavBarSuperDropdown";
import { MENU_ITEMS } from "@/config/navBarConfig";

interface NavbarProps {
  searchList?: ReturnType<typeof queryClient.getSearchList>;
  children?: React.ReactNode;
}

export const NavBar: React.FC<NavbarProps> = ({ searchList, children }) => {
  const [innerSearchList, setInnerSearchList] =
    React.useState<NavbarProps["searchList"]>();

  React.useEffect(() => {
    if (innerSearchList == undefined) {
      if (searchList) {
        setInnerSearchList(searchList);
      } else {
        const getSearchList = async () => {
          const data = await fetch("/api/list");
          const json = await data.json();
          setInnerSearchList(json);
        };
        getSearchList();
      }
    }
  }, [searchList]);

  return (
    <div className="drawer z-50">
      <input id="my-drawer-3" type="checkbox" className="drawer-toggle" />
      <div className="drawer-content flex flex-col max-w-full">
        {/* Navbar */}
        <div className="w-full navbar bg-base-300 relative z-10">
          <div className="flex-none lg:hidden">
            <label
              htmlFor="my-drawer-3"
              aria-label="open sidebar"
              className="btn btn-square btn-ghost"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                className="inline-block w-6 h-6 stroke-current"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h16"
                ></path>
              </svg>
            </label>
          </div>
          <div className="flex-none px-2 mx-2">
            <ul className="menu menu-horizontal">
              <li>
                <Link href="/" className="font-bold">
                  PalmWatch
                  <i className="text-accent inline">beta</i>
                </Link>
              </li>
            </ul>
          </div>
          <div className="flex-1 hidden px-2 lg:block">
            <div className="block mx-auto w-fit">
              <ul className="menu menu-horizontal bg-base-100 rounded-xl p-0">
                {/* Navbar menu content here */}
                <li className="pointer-events-none">
                  <p>Search:</p>
                </li>
                {MENU_ITEMS.map((item) => (
                  <NavBarSuperDropdown
                    icon={item.icon}
                    label={item.label}
                    options={(innerSearchList?.[item.label] as []) || []}
                    path={item.path}
                    key={item.label}
                    description={item.description}
                  />
                ))}
              </ul>
            </div>
          </div>
          <div className="flex-none hidden lg:block">
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
          htmlFor="my-drawer-3"
          aria-label="close sidebar"
          className="drawer-overlay"
        ></label>
        <ul className="menu p-4 w-80 min-h-full bg-base-200">
          {/* Sidebar content here */}
          <ul className="menu menu-vertical bg-base-100 rounded-xl p-0 pt-24">
            <li>
              <Link href="/" className="font-bold mb-8">
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
              <Link href="/about" className="mt-8">
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
