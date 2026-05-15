import {
  type MillApiPayload,
  millApiPayloadSchema,
} from "@/domain/schemas/mill-api";
import { loadPrecomputedParsed } from "@/lib/server/load-precomputed-parsed";

export async function loadMillApiPayload(
  slug: string,
  req?: Request
): Promise<MillApiPayload | null> {
  const r = await loadPrecomputedParsed(
    `mill/${slug}.json`,
    millApiPayloadSchema,
    req
  );
  return r.ok ? r.data : null;
}
