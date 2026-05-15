// @ts-expect-error
import debounce from "lodash/debounce";
import React, { useEffect, useMemo, useRef } from "react";

export const InnerTextComponent: React.FC<{
  label: string;
  onChange: (s: string) => void;
  /** White nav mega-menu: outlined field instead of theme-dark input fill */
  lightOnWhite?: boolean;
}> = ({ onChange, label, lightOnWhite }) => {
  const [innerSearchTerm, setInnerSearchTerm] = React.useState("");
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const debounceOnChange = useMemo(
    () =>
      debounce((search: string) => {
        onChangeRef.current(search);
      }, 100),
    []
  );

  useEffect(
    () => () => {
      debounceOnChange.cancel();
    },
    [debounceOnChange]
  );

  const handleInput = (text: string) => {
    setInnerSearchTerm(text);
    // debounce onChange
    debounceOnChange(text);
  };
  return (
    <input
      className={
        lightOnWhite
          ? "input !border !border-neutral-400 !bg-white focus:!border-[var(--site-nav-accent)] h-10 w-full max-w-xs rounded-md text-neutral-900 text-sm shadow-none placeholder:text-neutral-500 focus:outline-none focus:ring-1 focus:ring-[var(--site-nav-accent)]"
          : "input input-bordered w-full max-w-xs"
      }
      onChange={(e) => handleInput(e.target.value)}
      placeholder={`Search for ${label} here`}
      type="text"
      value={innerSearchTerm}
    />
  );
};
