import { fullYearRangeColumns } from "@/config/years";
import type { CompanyData, UmlData } from "@/domain";
import {
  companiesFileSchema,
  umlShardFileSchema,
} from "@/domain/schemas/bbox-data";
import type { FullManifestValidated } from "@/domain/schemas/full-manifest";
import { fullManifestSchema } from "@/domain/schemas/full-manifest";
import { loadPrecomputedParsed } from "@/server/load-precomputed-parsed";

export type FullManifest = FullManifestValidated;

function mean(nums: number[]): number {
  const v = nums.filter((x) => Number.isFinite(x));
  if (!v.length) {
    return Number.NaN;
  }
  return v.reduce((a, b) => a + b, 0) / v.length;
}

function round2(n: number) {
  return Math.round(n * 100) / 100;
}

function quantileSorted(sorted: number[], q: number): number {
  if (!sorted.length) {
    return Number.NaN;
  }
  const pos = (sorted.length - 1) * q;
  const lo = Math.floor(pos);
  const hi = Math.ceil(pos);
  if (lo === hi) {
    return sorted[lo]!;
  }
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
    if (!map.has(b)) {
      map.set(b, new Set());
    }
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
    const year = Number.parseInt(colParts.at(-1) || "0", 10);
    const values = mills
      .map((d) => Number((d as Record<string, unknown>)[col]))
      .filter(Number.isFinite);
    const row: Record<string, number | string> = { year };
    for (const q of quantiles) {
      row[`q${q}`] = quantile(values, q);
    }
    out.push(row);
  }
  return out;
}

function summaryStats(mills: UmlData[]) {
  const risks = mills.map((d) =>
    Number.parseFloat(String(d.risk_score_current))
  );
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
  const man = await loadPrecomputedParsed(
    "full-manifest.json",
    fullManifestSchema,
    req
  );
  if (!man.ok) {
    throw new Error("invalid full-manifest.json");
  }
  const { shardCount } = man.data;
  const chunks = await Promise.all(
    Array.from({ length: shardCount }, async (_, i) => {
      const path = `full/shard-${String(i).padStart(5, "0")}.json`;
      const r = await loadPrecomputedParsed(path, umlShardFileSchema, req);
      if (!r.ok) {
        throw new Error(`invalid shard ${path}`);
      }
      return r.data as UmlData[];
    })
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
  const [allMills, companiesResult] = await Promise.all([
    loadAllMillRows(req),
    loadPrecomputedParsed("companies.json", companiesFileSchema, req),
  ]);
  if (!companiesResult.ok) {
    throw new Error("invalid companies.json");
  }
  const companies = companiesResult.data as CompanyData[];

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
  for (const m of inBox) {
    byUml.set(m["UML ID"], m);
  }
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
