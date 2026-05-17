"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";
import styles from "@/app/(website)/_shell/site-chrome.module.css";
import { MENU_ITEMS } from "@/components/nav-bar-menu";
import { useTheme } from "@/components/theme-provider";
import { NavSearch } from "@/features/site-nav/nav-search";

function IconSun(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      fill="none"
      height="16"
      viewBox="0 0 24 24"
      width="16"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="2" />
      <path
        d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="2"
      />
    </svg>
  );
}

function IconMoon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      fill="none"
      height="16"
      viewBox="0 0 24 24"
      width="16"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
    </svg>
  );
}

function isNavItemActive(pathname: string, itemPath: string): boolean {
  if (pathname === itemPath) {
    return true;
  }
  switch (itemPath) {
    case "/brands":
      return pathname.startsWith("/brand/");
    case "/mills":
      return pathname.startsWith("/mill/");
    case "/companies":
      return pathname.startsWith("/owner/") || pathname.startsWith("/group/");
    case "/countries":
      return pathname.startsWith("/country/");
    default:
      return false;
  }
}

export const NavBar: React.FC = () => {
  const [menuOpen, setMenuOpen] = React.useState(false);
  const pathname = usePathname();
  const { theme, toggle } = useTheme();

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
                <NavSearch />
                <Link href="/about">About</Link>
                <Link href="/contact">Contact</Link>
                <button
                  aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
                  className={styles.themeToggle}
                  onClick={toggle}
                  type="button"
                >
                  {theme === "dark" ? (
                    <IconMoon aria-hidden />
                  ) : (
                    <IconSun aria-hidden />
                  )}
                </button>
              </nav>
            </div>
          </div>
        </div>

        <div className={styles.topbarMain}>
          <div className={styles.topbarMainInner}>
            <nav aria-label="Main navigation" className={styles.searchBar}>
              {MENU_ITEMS.map((item) => {
                const active = isNavItemActive(pathname, item.path);
                return (
                  <Link
                    aria-current={active ? "page" : undefined}
                    className={`${styles.navMenuTrigger} ${active ? styles.navMenuTriggerActive : ""}`}
                    href={item.path}
                    key={item.label}
                  >
                    <span className={styles.navMenuTriggerLabel}>
                      {item.label}
                    </span>
                  </Link>
                );
              })}
            </nav>
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
          {MENU_ITEMS.map((item) => {
            const active = isNavItemActive(pathname, item.path);
            return (
              <Link
                aria-current={active ? "page" : undefined}
                className={`${styles.mobileLink} ${active ? styles.mobileLinkActive : ""}`}
                href={item.path}
                key={item.label}
              >
                {item.label}
              </Link>
            );
          })}
          <div className={styles.mobileDivider} />
          <Link className={styles.mobileLink} href="/about">
            About
          </Link>
          <Link className={styles.mobileLink} href="/contact">
            Contact
          </Link>
          <div className={styles.mobileThemeRow}>
            <span className={styles.mobileThemeLabel}>
              {theme === "dark" ? "Dark mode" : "Light mode"}
            </span>
            <button
              aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
              className={styles.mobileThemeToggle}
              onClick={toggle}
              type="button"
            >
              {theme === "dark" ? (
                <IconMoon aria-hidden />
              ) : (
                <IconSun aria-hidden />
              )}
            </button>
          </div>
        </nav>
      </aside>
    </>
  );
};
