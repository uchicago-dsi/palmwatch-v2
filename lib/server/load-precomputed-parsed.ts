import type { z } from "zod";
import { loadPrecomputedJson } from "@/lib/server/load-precomputed";

export type PrecomputedParseResult<T> =
  | { ok: true; data: T }
  | { ok: false; error?: z.ZodError };

/** Load precomputed JSON and validate with Zod; never throws on parse failure. */
export async function loadPrecomputedParsed<T>(
  relativePath: string,
  schema: z.ZodType<T>,
  req?: Request
): Promise<PrecomputedParseResult<T>> {
  try {
    const raw = await loadPrecomputedJson<unknown>(relativePath, req);
    const parsed = schema.safeParse(raw);
    if (!parsed.success) {
      return { ok: false, error: parsed.error };
    }
    return { ok: true, data: parsed.data };
  } catch {
    return { ok: false };
  }
}
