import { cumulativeYearRange } from "@/config/years";
import { loadPrecomputedJson } from "@/server/load-precomputed";

export type MillDirEntry = {
  label: string;
  href: string;
  country: string;
  province: string;
  rspo: boolean;
  riskScore: number | null;
};

function rowToEntry(row: Record<string, unknown>): MillDirEntry {
  const id = row["UML ID"] as string;
  const rawScore = row.risk_score_current;
  return {
    label: (row["Mill Name"] as string) || id,
    href: `/mill/${id}`,
    country: (row.Country as string) ?? "",
    province: (row.Province as string) ?? (row.District as string) ?? "",
    rspo:
      typeof row["RSPO Status"] === "string" &&
      row["RSPO Status"] !== "Not RSPO Certified",
    riskScore: typeof rawScore === "number" ? rawScore : null,
  };
}

export type ForestLossQuartilePoint = {
  year: number;
  q1: number;
  median: number;
  q3: number;
};

function quantile(sorted: number[], q: number): number {
  if (sorted.length === 0) {
    return 0;
  }
  const pos = q * (sorted.length - 1);
  const lo = Math.floor(pos);
  const hi = Math.ceil(pos);
  return lo === hi
    ? sorted[lo]
    : sorted[lo] * (hi - pos) + sorted[hi] * (pos - lo);
}

async function loadAllShards(
  req?: Request
): Promise<Array<Record<string, unknown>>> {
  const manifest = await loadPrecomputedJson<{ shardCount: number }>(
    "full-manifest.json",
    req
  );
  const shards = await Promise.all(
    Array.from({ length: manifest.shardCount }, (_, i) =>
      loadPrecomputedJson<Array<Record<string, unknown>>>(
        `full/shard-${String(i).padStart(5, "0")}.json`,
        req
      )
    )
  );
  return shards.flat();
}

export async function loadMillForestLossQuartiles(
  req?: Request
): Promise<ForestLossQuartilePoint[] | null> {
  try {
    const rows = await loadAllShards(req);
    return cumulativeYearRange.map((year) => {
      const col = `treeloss_km_${year}`;
      const values = rows
        .map((r) => (typeof r[col] === "number" ? (r[col] as number) : 0))
        .sort((a, b) => a - b);
      return {
        year,
        q1: quantile(values, 0.25),
        median: quantile(values, 0.5),
        q3: quantile(values, 0.75),
      };
    });
  } catch {
    return null;
  }
}

export async function loadMillDirectory(
  req?: Request
): Promise<MillDirEntry[] | null> {
  try {
    const rows = await loadAllShards(req);
    return rows.map(rowToEntry);
  } catch {
    return null;
  }
}
