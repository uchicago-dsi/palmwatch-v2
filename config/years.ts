import _yearRange from "../public/data/year_meta.json";
const yearRange = _yearRange as number[]
const minYear = Math.min(...yearRange)
const maxYear = Math.max(...yearRange)


const range = (start: number, end: number) => {
  const length = end - start;
  return Array.from({ length }, (_, i) => start + i);
};
const fullYearRange = range(2001, 2023);
const fullYearRangeColumns = range(2001, 2023).map((i) => `treeloss_km_${i}`);

export {
  yearRange,
  fullYearRange,
  fullYearRangeColumns,
  minYear,
  maxYear
}