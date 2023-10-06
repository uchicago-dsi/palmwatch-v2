import React, {useCallback} from "react";
// @ts-ignore
import debounce from "lodash/debounce";

export const InnerTextComponent: React.FC<{
  label: string;
  onChange: (s: string) => void;
}> = ({ onChange, label }) => {
  const [innerSearchTerm, setInnerSearchTerm] = React.useState("");

  const debounceOnChange = useCallback(
    debounce((search: string) => {
      onChange(search);
    }, 100),
    []
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
