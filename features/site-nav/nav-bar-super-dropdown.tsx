"use client";
import type React from "react";
import styles from "@/app/(website)/_shell/site-chrome.module.css";
import { SearchableListLayout } from "@/components/searchable-list-layout";
import { useDropdownStore } from "@/hooks/super-dropdown-store";

interface NavBarSuperDropdownProps {
  description?: string;
  icon: React.ReactNode;
  label: string;
  options: Array<{ label: string; href: string; imgPath?: string }>;
  path: string;
}

/** Desktop: label + chevron (reference site style); panel lists still use searchable layout. `icon` is unused but kept for menu config compatibility. */
export const NavBarSuperDropdown: React.FC<NavBarSuperDropdownProps> = ({
  icon: _icon,
  label,
  options,
  path,
  description,
}) => {
  const { currentDropdown, setcurrentDropdown } = useDropdownStore();
  const isActive = currentDropdown === label;

  return (
    <>
      <button
        aria-expanded={isActive}
        aria-haspopup="dialog"
        className={`${styles.navMenuTrigger} ${isActive ? styles.navMenuTriggerActive : ""}`}
        onClick={() => setcurrentDropdown(isActive ? "" : label)}
        type="button"
      >
        <span className={styles.navMenuTriggerLabel}>{label}</span>
        <svg
          aria-hidden
          className={`${styles.navMenuChevron} ${isActive ? styles.navMenuChevronOpen : ""}`}
          fill="none"
          height="10"
          viewBox="0 0 12 12"
          width="10"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M2 4.5 6 8 10 4.5"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.5"
          />
        </svg>
      </button>
      {isActive ? (
        <div className={styles.navDropdownPanel}>
          <SearchableListLayout
            description={description}
            label={label}
            navPanel
            options={options}
            path={path}
            setcurrentDropdown={setcurrentDropdown}
          />
        </div>
      ) : null}
    </>
  );
};
