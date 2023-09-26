import companyData from "@/utils/company_columnar.json";

const years = companyData.report_year
export const minYear = Math.min(...years)
export const maxYear = Math.max(...years)
export const yearRange = Array.from({length: maxYear - minYear + 1}, (_, i) => i + minYear)