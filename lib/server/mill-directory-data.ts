import { existsSync, readFileSync } from "fs";
import path from "path";

export type MillDirEntry = {
  label: string;
  href: string;
  country: string;
  rspo: boolean;
};

export function loadMillDirectory(): MillDirEntry[] | null {
  try {
    const manifestPath = path.join(
      process.cwd(),
      "public/data/precomputed/full-manifest.json"
    );
    const { shardCount } = JSON.parse(readFileSync(manifestPath, "utf-8")) as {
      shardCount: number;
    };

    const entries: MillDirEntry[] = [];

    for (let i = 0; i < shardCount; i++) {
      const name = `shard-${String(i).padStart(5, "0")}.json`;
      const shardPath = path.join(
        process.cwd(),
        "public/data/precomputed/full",
        name
      );
      if (!existsSync(shardPath)) {
        continue;
      }

      const rows = JSON.parse(readFileSync(shardPath, "utf-8")) as Array<
        Record<string, unknown>
      >;

      for (const row of rows) {
        const id = row["UML ID"] as string;
        entries.push({
          label: (row["Mill Name"] as string) || id,
          href: `/mill/${id}`,
          country: (row["Country"] as string) ?? "",
          rspo:
            typeof row["RSPO Status"] === "string" &&
            row["RSPO Status"] !== "Not RSPO Certified",
        });
      }
    }

    return entries;
  } catch {
    return null;
  }
}
