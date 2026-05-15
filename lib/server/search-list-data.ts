import type { SearchListPayload } from "@/domain";
import { searchListPayloadSchema } from "@/domain/schemas/search-list";
import { loadPrecomputedJson } from "@/lib/server/load-precomputed";

/** Loads and validates navbar / list search JSON. Returns `null` when invalid or missing. */
export async function loadSearchListPayload(
  req?: Request
): Promise<SearchListPayload | null> {
  try {
    const raw = await loadPrecomputedJson<unknown>("search-list.json", req);
    const parsed = searchListPayloadSchema.safeParse(raw);
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}
