import _yearRange from "../public/data/year_meta.json";

const yearRange = [...(_yearRange as number[])].sort((a, b) => a - b);
const minYear = yearRange.length ? Math.min(...yearRange) : 2001;
const maxYear = yearRange.length ? Math.max(...yearRange) : 2022;

const range = (start: number, end: number) => {
  const length = end - start;
  return Array.from({ length }, (_, i) => start + i);
};

/** Inclusive tree-loss years used by charts and aggregations (from year_meta.json). */
const fullYearRange = yearRange.length
  ? range(minYear, maxYear + 1)
  : range(2001, 2023);

const fullYearRangeColumns = fullYearRange.map((y) => `treeloss_km_${y}`);

/** Default choropleth / “latest year” column for maps and stats. */
const latestTreelossKmColumn = `treeloss_km_${maxYear}`;

export {
  fullYearRange,
  fullYearRangeColumns,
  latestTreelossKmColumn,
  maxYear,
  minYear,
  yearRange,
};
