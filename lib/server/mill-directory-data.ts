import { loadPrecomputedJson } from "@/lib/server/load-precomputed";

export type MillDirEntry = {
  label: string;
  href: string;
  country: string;
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
    rspo:
      typeof row["RSPO Status"] === "string" &&
      row["RSPO Status"] !== "Not RSPO Certified",
    riskScore: typeof rawScore === "number" ? rawScore : null,
  };
}

export async function loadMillDirectory(
  req?: Request
): Promise<MillDirEntry[] | null> {
  try {
    const manifest = await loadPrecomputedJson<{
      shardCount: number;
    }>("full-manifest.json", req);

    const shards = await Promise.all(
      Array.from({ length: manifest.shardCount }, (_, i) => {
        const name = `full/shard-${String(i).padStart(5, "0")}.json`;
        return loadPrecomputedJson<Array<Record<string, unknown>>>(name, req);
      })
    );

    const entries: MillDirEntry[] = [];
    for (const rows of shards) {
      for (const row of rows) {
        entries.push(rowToEntry(row));
      }
    }

    return entries;
  } catch {
    return null;
  }
}
