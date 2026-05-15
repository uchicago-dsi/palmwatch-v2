"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";
import styles from "@/app/(website)/_shell/site-chrome.module.css";
import { MENU_ITEMS } from "@/components/nav-bar-menu";
import type { SearchListPayload } from "@/domain";
import { useDropdownStore } from "@/hooks/super-dropdown-store";
import { NavBarSuperDropdown } from "./nav-bar-super-dropdown";

interface NavbarProps {
  searchList?: SearchListPayload;
}

export const NavBar: React.FC<NavbarProps> = ({ searchList }) => {
  const [innerSearchList, setInnerSearchList] =
    React.useState<NavbarProps["searchList"]>();
  const [menuOpen, setMenuOpen] = React.useState(false);
  const pathname = usePathname();
  const searchBarRef = React.useRef<HTMLDivElement>(null);
  const currentMegaMenu = useDropdownStore((s) => s.currentDropdown);
  const setMegaMenu = useDropdownStore((s) => s.setcurrentDropdown);

  React.useEffect(() => {
    if (!currentMegaMenu) {
      return;
    }
    function onPointerDown(ev: PointerEvent) {
      const root = searchBarRef.current;
      if (root && !root.contains(ev.target as Node)) {
        setMegaMenu("");
      }
    }
    document.addEventListener("pointerdown", onPointerDown, true);
    return () =>
      document.removeEventListener("pointerdown", onPointerDown, true);
  }, [currentMegaMenu, setMegaMenu]);

  React.useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  React.useEffect(() => {
    if (!menuOpen) {
      return;
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setMenuOpen(false);
      }
    }
    document.addEventListener("keydown", onKeyDown, { capture: true });
    return () =>
      document.removeEventListener("keydown", onKeyDown, { capture: true });
  }, [menuOpen]);

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
    <>
      <header className={styles.siteHeader}>
        <div className={styles.topbarUtility}>
          <div className={styles.topbarUtilityInner}>
            <Link className={styles.logoUtility} href="/">
              PalmWatch
            </Link>
            <div className={styles.topbarUtilityRight}>
              <button
                aria-expanded={menuOpen}
                aria-label="Open menu"
                className={styles.hamburger}
                onClick={() => setMenuOpen(true)}
                type="button"
              >
                <svg
                  aria-hidden
                  fill="none"
                  height="20"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  width="20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <nav
                aria-label="Utility navigation"
                className={styles.topbarUtilityNav}
              >
                <Link href="/about">About</Link>
                <Link href="/contact">Contact</Link>
              </nav>
            </div>
          </div>
        </div>

        <div className={styles.topbarMain}>
          <div className={styles.topbarMainInner}>
            <div className={styles.searchBar} ref={searchBarRef}>
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
            </div>
          </div>
        </div>
      </header>

      {menuOpen && (
        <div
          aria-hidden
          className={styles.mobileBackdrop}
          onClick={() => setMenuOpen(false)}
        />
      )}

      <aside
        aria-label="Site navigation"
        className={`${styles.mobilePanel} ${menuOpen ? styles.mobilePanelOpen : ""}`}
      >
        <button
          aria-label="Close menu"
          className={styles.mobileClose}
          onClick={() => setMenuOpen(false)}
          type="button"
        >
          <svg
            aria-hidden
            fill="none"
            height="18"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            width="18"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>

        <nav className={styles.mobilePanelNav}>
          {MENU_ITEMS.map((item) => (
            <Link
              className={styles.mobileLink}
              href={item.path}
              key={item.label}
            >
              {item.label}
            </Link>
          ))}
          <div className={styles.mobileDivider} />
          <Link className={styles.mobileLink} href="/about">
            About
          </Link>
          <Link className={styles.mobileLink} href="/contact">
            Contact
          </Link>
        </nav>
      </aside>
    </>
  );
};
