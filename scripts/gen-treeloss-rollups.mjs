/**
 * Writes server/treeloss-rollups.generated.ts with literal Arquero rollup callbacks.
 * Cloudflare Workers disallow new Function / eval; Arquero needs literal d['col'] in sources.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const yearMetaPath = path.join(root, "public/data/year_meta.json");
const outPath = path.join(root, "server/treeloss-rollups.generated.ts");

const yearMeta = JSON.parse(fs.readFileSync(yearMetaPath, "utf8"));
const yearRange = [...yearMeta].sort((a, b) => a - b);
const minYear = yearRange.length ? Math.min(...yearRange) : 2001;
const maxYear = yearRange.length ? Math.max(...yearRange) : 2022;
const fullYearRange = [];
for (let y = minYear; y <= maxYear; y++) {
  fullYearRange.push(y);
}

// Median covers 2001–maxYear since mill data has treeloss_km_* from 2001.
const CUMULATIVE_START = 2001;
const cumulativeYearRange = [];
for (let y = CUMULATIVE_START; y <= maxYear; y++) {
  cumulativeYearRange.push(y);
}

function linesForSum() {
  return fullYearRange
    .map((y) => `    sum${y}: (d: any) => op.sum(d['treeloss_km_${y}']),`)
    .join("\n");
}
function linesForMedian() {
  return cumulativeYearRange
    .map((y) => `    median${y}: (d: any) => op.median(d['treeloss_km_${y}']),`)
    .join("\n");
}
function linesForMean() {
  return fullYearRange
    .map((y) => `    mean${y}: (d: any) => op.mean(d['sum${y}']),`)
    .join("\n");
}

const header = `/* eslint-disable */
/**
 * Auto-generated from public/data/year_meta.json — do not edit.
 * Regenerate: \`node scripts/gen-treeloss-rollups.mjs\` (runs via prebuild).
 */
import { op } from "arquero";

`;

const body = `export function buildTreelossRollups() {
  const sumAllYears: Record<string, (d: any) => any> = {
${linesForSum()}
  };
  const medianAllYears: Record<string, (d: any) => any> = {
${linesForMedian()}
  };
  const meanAllSums: Record<string, (d: any) => any> = {
${linesForMean()}
  };
  return { sumAllYears, medianAllYears, meanAllSums };
}
`;

fs.writeFileSync(outPath, header + body, "utf8");
console.log(
  "wrote",
  path.relative(root, outPath),
  "years",
  minYear,
  "–",
  maxYear
);
