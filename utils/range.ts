/**
 * Builds an ascending array of integers from `start` (inclusive) to `end`
 * (exclusive), e.g. `range(2001, 2004)` → `[2001, 2002, 2003]`.
 */
export const range = (start: number, end: number) => {
  const length = end - start;
  return Array.from({ length }, (_, i) => start + i);
};
