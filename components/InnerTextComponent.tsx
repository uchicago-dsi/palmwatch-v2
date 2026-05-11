import React, { useEffect, useMemo, useRef } from "react";
// @ts-ignore
import debounce from "lodash/debounce";

export const InnerTextComponent: React.FC<{
  label: string;
  onChange: (s: string) => void;
}> = ({ onChange, label }) => {
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
      type="text"
      placeholder={`Search for ${label} here`}
      className="input input-bordered w-full max-w-xs"
      value={innerSearchTerm}
      onChange={(e) => handleInput(e.target.value)}
    />
  );
};
