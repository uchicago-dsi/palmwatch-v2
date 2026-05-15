"use client";
import type React from "react";
import { SearchableListLayout } from "@/components/searchable-list-layout";
import { useDropdownStore } from "@/hooks/super-dropdown-store";

interface NavBarSuperDropdownProps {
  description?: string;
  icon: React.ReactNode;
  label: string;
  options: Array<{ label: string; href: string; imgPath?: string }>;
  path: string;
  showText?: boolean;
}

export const NavBarSuperDropdown: React.FC<NavBarSuperDropdownProps> = ({
  icon,
  label,
  options,
  path,
  showText,
  description,
}) => {
  const { currentDropdown, setcurrentDropdown } = useDropdownStore();
  const isActive = currentDropdown === label;

  return (
    <>
      <li>
        <button
          className={`tooltip tooltip-bottom ${isActive ? "bg-info" : ""}`}
          data-tip={label}
          onClick={() => setcurrentDropdown(label)}
          type="button"
        >
          <svg
            aria-hidden={true}
            className="h-6 w-6 fill-base-content"
            version="1.1"
            viewBox="0 0 100 100"
            xmlns="http://www.w3.org/2000/svg"
          >
            {icon}
          </svg>
          {showText ? <span className="ml-2">{label}</span> : null}
        </button>
      </li>
      {isActive ? (
        <>
          <button
            className="absolute top-[100%] left-0 h-[100vh] w-full bg-black opacity-30 shadow-xl"
            onClick={() => setcurrentDropdown("")}
            type="button"
          />
          <div className="absolute top-[100%] left-0 w-full bg-base-100 p-4 pr-4 shadow-xl">
            <SearchableListLayout
              description={description}
              label={label}
              options={options}
              path={path}
              setcurrentDropdown={setcurrentDropdown}
            />
          </div>
        </>
      ) : null}
    </>
  );
};
