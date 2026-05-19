/* eslint-disable */
/**
 * Auto-generated from public/data/year_meta.json — do not edit.
 * Regenerate: `node scripts/gen-treeloss-rollups.mjs` (runs via prebuild).
 */
import { op } from "arquero";

export function buildTreelossRollups() {
  const sumAllYears: Record<string, (d: any) => any> = {
    sum2017: (d: any) => op.sum(d['treeloss_km_2017']),
    sum2018: (d: any) => op.sum(d['treeloss_km_2018']),
    sum2019: (d: any) => op.sum(d['treeloss_km_2019']),
    sum2020: (d: any) => op.sum(d['treeloss_km_2020']),
    sum2021: (d: any) => op.sum(d['treeloss_km_2021']),
    sum2022: (d: any) => op.sum(d['treeloss_km_2022']),
    sum2023: (d: any) => op.sum(d['treeloss_km_2023']),
    sum2024: (d: any) => op.sum(d['treeloss_km_2024']),
    sum2025: (d: any) => op.sum(d['treeloss_km_2025']),
  };
  const medianAllYears: Record<string, (d: any) => any> = {
    median2001: (d: any) => op.median(d['treeloss_km_2001']),
    median2002: (d: any) => op.median(d['treeloss_km_2002']),
    median2003: (d: any) => op.median(d['treeloss_km_2003']),
    median2004: (d: any) => op.median(d['treeloss_km_2004']),
    median2005: (d: any) => op.median(d['treeloss_km_2005']),
    median2006: (d: any) => op.median(d['treeloss_km_2006']),
    median2007: (d: any) => op.median(d['treeloss_km_2007']),
    median2008: (d: any) => op.median(d['treeloss_km_2008']),
    median2009: (d: any) => op.median(d['treeloss_km_2009']),
    median2010: (d: any) => op.median(d['treeloss_km_2010']),
    median2011: (d: any) => op.median(d['treeloss_km_2011']),
    median2012: (d: any) => op.median(d['treeloss_km_2012']),
    median2013: (d: any) => op.median(d['treeloss_km_2013']),
    median2014: (d: any) => op.median(d['treeloss_km_2014']),
    median2015: (d: any) => op.median(d['treeloss_km_2015']),
    median2016: (d: any) => op.median(d['treeloss_km_2016']),
    median2017: (d: any) => op.median(d['treeloss_km_2017']),
    median2018: (d: any) => op.median(d['treeloss_km_2018']),
    median2019: (d: any) => op.median(d['treeloss_km_2019']),
    median2020: (d: any) => op.median(d['treeloss_km_2020']),
    median2021: (d: any) => op.median(d['treeloss_km_2021']),
    median2022: (d: any) => op.median(d['treeloss_km_2022']),
    median2023: (d: any) => op.median(d['treeloss_km_2023']),
    median2024: (d: any) => op.median(d['treeloss_km_2024']),
    median2025: (d: any) => op.median(d['treeloss_km_2025']),
  };
  const meanAllSums: Record<string, (d: any) => any> = {
    mean2017: (d: any) => op.mean(d['sum2017']),
    mean2018: (d: any) => op.mean(d['sum2018']),
    mean2019: (d: any) => op.mean(d['sum2019']),
    mean2020: (d: any) => op.mean(d['sum2020']),
    mean2021: (d: any) => op.mean(d['sum2021']),
    mean2022: (d: any) => op.mean(d['sum2022']),
    mean2023: (d: any) => op.mean(d['sum2023']),
    mean2024: (d: any) => op.mean(d['sum2024']),
    mean2025: (d: any) => op.mean(d['sum2025']),
  };
  return { sumAllYears, medianAllYears, meanAllSums };
}
