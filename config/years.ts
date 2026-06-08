import _yearRange from "../public/data/year_meta.json";

const yearRange = [...(_yearRange as number[])].sort((a, b) => a - b);
const minYear = yearRange.length ? Math.min(...yearRange) : 2001;
const maxYear = yearRange.length ? Math.max(...yearRange) : 2022;

const range = (start: number, end: number) => {
  const length = end - start;
  return Array.from({ length }, (_, i) => start + i);
};

/** Tree-loss years for map layers and charts: 2001 through max year in year_meta. */
const TREE_LOSS_START_YEAR = 2001;
const fullYearRange = range(TREE_LOSS_START_YEAR, maxYear + 1);

const fullYearRangeColumns = fullYearRange.map((y) => `treeloss_km_${y}`);

/** Default choropleth / "latest year" column for maps and stats. */
const latestTreelossKmColumn = `treeloss_km_${maxYear}`;

export {
  TREE_LOSS_START_YEAR,
  yearRange,
  fullYearRange,
  fullYearRangeColumns,
  latestTreelossKmColumn,
  minYear,
  maxYear,
};
