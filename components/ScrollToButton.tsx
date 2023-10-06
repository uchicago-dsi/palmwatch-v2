"use client";
import React from "react";

export const ScrollToButton: React.FC<{
  className: string;
  target: string;
  children: React.ReactNode;
}> = ({ className, target, children }) => {
  const handleClick = () => {
    const el = document.getElementById(target);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };
  return (
    <button className={className} onClick={handleClick}>
      {children}
    </button>
  );
};
