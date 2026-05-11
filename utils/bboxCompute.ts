import { fullYearRangeColumns } from "@/config/years";
import type { CompanyData, UmlData } from "@/utils/dataTypes";
import { loadPrecomputedJson } from "@/utils/loadPrecomputed";

export type FullManifest = {
  shardCount: number;
  rowsPerShard: number;
  totalRows: number;
};

function mean(nums: number[]): number {
  const v = nums.filter((x) => Number.isFinite(x));
  if (!v.length) return NaN;
  return v.reduce((a, b) => a + b, 0) / v.length;
}

function round2(n: number) {
  return Math.round(n * 100) / 100;
}

function quantileSorted(sorted: number[], q: number): number {
  if (!sorted.length) return NaN;
  const pos = (sorted.length - 1) * q;
  const lo = Math.floor(pos);
  const hi = Math.ceil(pos);
  if (lo === hi) return sorted[lo]!;
  return sorted[lo]! + (sorted[hi]! - sorted[lo]!) * (pos - lo);
}

function quantile(values: number[], q: number): number {
  const sorted = [...values].filter(Number.isFinite).sort((a, b) => a - b);
  return quantileSorted(sorted, q);
}

function computeBrandUsage(companies: CompanyData[]) {
  const map = new Map<string, Set<number>>();
  for (const c of companies) {
    const b = c.consumer_brand;
    if (!map.has(b)) map.set(b, new Set());
    map.get(b)!.add(Number(c.report_year));
  }
  return [...map.entries()]
    .map(([consumer_brand, years]) => ({
      consumer_brand,
      years: [...years].sort((a, b) => a - b),
    }))
    .sort((a, b) => a.consumer_brand.localeCompare(b.consumer_brand));
}

function computeQuantileTimeseries(mills: UmlData[]) {
  const quantiles = [0.25, 0.5, 0.75];
  const out: Record<string, number | string>[] = [];
  for (const col of fullYearRangeColumns) {
    const colParts = col.split("_");
    const year = parseInt(colParts.at(-1) || "0", 10);
    const values = mills.map((d) => Number((d as any)[col])).filter(Number.isFinite);
    const row: Record<string, number | string> = { year };
    for (const q of quantiles) {
      row[`q${q}`] = quantile(values, q);
    }
    out.push(row);
  }
  return out;
}

function summaryStats(mills: UmlData[]) {
  const risks = mills.map((d) => parseFloat(String(d.risk_score_current)));
  return {
    averageCurrentRisk: round2(mean(risks)),
    uniqueMills: mills.length,
    uniqueCountries: new Set(mills.map((d) => d.Country)).size,
    uniqueOwners: new Set(mills.map((d) => d["Parent Company"])).size,
    uniqueGroups: new Set(mills.map((d) => d["Group Name"])).size,
  };
}

export async function loadAllMillRows(req: Request): Promise<UmlData[]> {
  return mergeFullShards(req);
}

/** Same payload shape as `getMillData.getDataInBbox` without Arquero. */
export async function mergeFullShards(req: Request): Promise<UmlData[]> {
  const manifest = await loadPrecomputedJson<FullManifest>(
    "full-manifest.json",
    req
  );
  const chunks = await Promise.all(
    Array.from({ length: manifest.shardCount }, (_, i) =>
      loadPrecomputedJson<UmlData[]>(
        `full/shard-${String(i).padStart(5, "0")}.json`,
        req
      )
    )
  );
  return chunks.flat();
}

export async function computeBboxPayload(
  req: Request,
  minLat: number,
  minLng: number,
  maxLat: number,
  maxLng: number
) {
  const [allMills, companies] = await Promise.all([
    loadAllMillRows(req),
    loadPrecomputedJson<CompanyData[]>("companies.json", req),
  ]);

  const inBox = allMills.filter((d) => {
    const millLat = +d.Latitude;
    const millLng = +d.Longitude;
    return (
      millLat >= minLat &&
      millLat <= maxLat &&
      millLng >= minLng &&
      millLng <= maxLng
    );
  });

  const byUml = new Map<string, UmlData>();
  for (const m of inBox) byUml.set(m["UML ID"], m);
  const mills = [...byUml.values()];

  const millIds = new Set(mills.map((m) => m["UML ID"]));
  const joined = companies.filter((c) => millIds.has(c["UML ID"]));

  const totalForestLoss = mills.reduce(
    (s, m) => s + Number(m.sum_of_treeloss_km ?? 0),
    0
  );

  return {
    ...summaryStats(mills),
    brandUsage: computeBrandUsage(joined),
    mills,
    timeseries: computeQuantileTimeseries(mills),
    totalForestLoss,
  };
}
