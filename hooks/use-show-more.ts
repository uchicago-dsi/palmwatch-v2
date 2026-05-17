import { useMemo, useState } from "react";

const DEFAULT_PAGE_SIZE = 10;

/** Slice a list to an initial page size with optional expand-to-show-all. */
export function useShowMore<T>(items: T[], pageSize = DEFAULT_PAGE_SIZE) {
  const [expanded, setExpanded] = useState(false);
  const hasMore = items.length > pageSize;
  const hiddenCount = Math.max(0, items.length - pageSize);

  const visibleItems = useMemo(
    () => (expanded || !hasMore ? items : items.slice(0, pageSize)),
    [items, expanded, hasMore, pageSize]
  );

  return {
    visibleItems,
    expanded,
    hasMore,
    hiddenCount,
    toggle: () => setExpanded((e) => !e),
  };
}
