import yearRange from "../public/data/year_meta.json";
const minYear = Math.min(...yearRange)
const maxYear = Math.max(...yearRange)

export {
  yearRange,
  minYear,
  maxYear
}