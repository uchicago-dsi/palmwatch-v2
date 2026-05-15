import { z } from "zod";

/** `full-manifest.json` for bbox / full shard merge. */
export const fullManifestSchema = z.object({
  shardCount: z.number().int().nonnegative(),
  rowsPerShard: z.number().int().nonnegative(),
  totalRows: z.number().int().nonnegative(),
});

export type FullManifestValidated = z.infer<typeof fullManifestSchema>;
