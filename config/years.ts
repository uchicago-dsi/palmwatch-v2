import _yearRange from "../public/data/year_meta.json";
import { range } from "@/utils/range";

/**
 * Year constants for the tree-loss data series (NOT brand–mill association
 * years). Everything here is derived from `year_meta.json`, a flat, ascending
 * list of the tree-loss years present in the arrow files, which the backend
 * regenerates alongside those files.
 */

/**
 * Inclusive start year of the tree-loss dataset. Tree-loss columns in the
 * arrow files run from this year through the latest year in `year_meta.json`
 * (e.g. `treeloss_km_2001` … `treeloss_km_2025`).
 */
const TREE_LOSS_START_YEAR = 2001;

/** Tree-loss years present in the data, sorted ascending. */
const yearRange = [...(_yearRange as number[])].sort((a, b) => a - b);

/**
 * `minYear`/`maxYear` are the first/last tree-loss years in the data. The
 * fallback to `TREE_LOSS_START_YEAR` only applies to the degenerate case of an
 * empty `year_meta.json`; it keeps downstream ranges/columns well-formed rather
 * than producing `NaN`.
 */
const minYear = yearRange.length ? Math.min(...yearRange) : TREE_LOSS_START_YEAR;
const maxYear = yearRange.length ? Math.max(...yearRange) : TREE_LOSS_START_YEAR;

/** Tree-loss years for map layers and charts: start year through max year. */
const fullYearRange = range(TREE_LOSS_START_YEAR, maxYear + 1);

const fullYearRangeColumns = fullYearRange.map((y) => `treeloss_km_${y}`);

/** Default choropleth / "latest year" column for maps and stats. */
const latestTreelossKmColumn = `treeloss_km_${maxYear}`;

/** Risk scores are calculated from the last two disclosure years in year_meta. */
const riskScoreWindowStart =
  yearRange.length >= 2 ? yearRange[yearRange.length - 2]! : maxYear;
const riskScoreWindowEnd = maxYear;

export {
  TREE_LOSS_START_YEAR,
  yearRange,
  fullYearRange,
  fullYearRangeColumns,
  latestTreelossKmColumn,
  minYear,
  maxYear,
  riskScoreWindowStart,
  riskScoreWindowEnd,
};
