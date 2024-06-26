"use client";
import { useDropdownStore } from "@/stores/superDropdownStore";
import React from "react";
import { SearchableListLayout } from "./SearchableListLayout";

interface NavBarSuperDropdownProps {
  icon: React.ReactNode;
  label: string;
  options: Array<{ label: string; href: string; imgPath?: string }>;
  path: string;
  showText?: boolean;
  description?: string;
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
      <li key={label}>
        <button
          className={`tooltip tooltip-bottom ${isActive ? "bg-info" : ""}`}
          data-tip={label}
          onClick={() => setcurrentDropdown(label)}
        >
          <svg
            className="w-6 h-6 fill-base-content"
            version="1.1"
            viewBox="0 0 100 100"
            xmlns="http://www.w3.org/2000/svg"
          >
            {icon}
          </svg>
          {showText && <span className="ml-2">{label}</span>}
        </button>
      </li>
      {isActive && (
        <>
          <button
            onClick={() => setcurrentDropdown("")}
            className="w-full h-[100vh] absolute top-[100%] left-0 bg-black opacity-30 shadow-xl"
          ></button>
          <div className="w-full absolute top-[100%] p-4 left-0 bg-base-100 shadow-xl pr-4">
            <SearchableListLayout
              label={label}
              options={options}
              path={path}
              description={description}
              setcurrentDropdown={setcurrentDropdown}
            />
          </div>
        </>
      )}
    </>
  );
};
