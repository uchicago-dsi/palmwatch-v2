// @ts-expect-error
import debounce from "lodash/debounce";
import React, { useEffect, useMemo, useRef } from "react";

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
      className="input input-bordered w-full max-w-xs"
      onChange={(e) => handleInput(e.target.value)}
      placeholder={`Search for ${label} here`}
      type="text"
      value={innerSearchTerm}
    />
  );
};
