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

/** Default choropleth / "latest year" column for maps and stats. */
const latestTreelossKmColumn = `treeloss_km_${maxYear}`;

/** Start year for cumulative deforestation layer. */
const CUMULATIVE_LOSS_START_YEAR = 2001;

/** Year range used to compute the cumulative deforestation column (2001–maxYear). */
const cumulativeYearRange = Array.from(
  { length: maxYear - CUMULATIVE_LOSS_START_YEAR + 1 },
  (_, i) => CUMULATIVE_LOSS_START_YEAR + i
);

/** Synthetic column key added to each row at runtime (not in raw data). */
const cumulativeLossColumn = "treeloss_km_cumulative";

/** Synthetic column: cumulative loss as % of km_forest_area_00 (runtime only). */
const cumulativeLossPctColumn = "treeloss_pct_cumulative";

export {
  CUMULATIVE_LOSS_START_YEAR,
  cumulativeLossColumn,
  cumulativeLossPctColumn,
  cumulativeYearRange,
  fullYearRange,
  fullYearRangeColumns,
  latestTreelossKmColumn,
  maxYear,
  minYear,
  yearRange,
};
