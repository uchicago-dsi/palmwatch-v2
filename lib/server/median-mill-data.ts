import { medianMillPayloadSchema } from "@/domain/schemas/aggregates";
import { loadPrecomputedParsed } from "@/lib/server/load-precomputed-parsed";

export async function loadMedianMill(
  req?: Request
): Promise<Record<string, number>[] | null> {
  const r = await loadPrecomputedParsed(
    "aggregates/median-mill.json",
    medianMillPayloadSchema,
    req
  );
  return r.ok ? r.data : null;
}
