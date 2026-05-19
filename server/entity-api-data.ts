import { looseEntityApiDocumentSchema } from "@/domain/schemas/entity-api";
import { loadPrecomputedParsed } from "@/server/load-precomputed-parsed";

export async function loadGroupApiDocument(
  slug: string,
  req?: Request
): Promise<Record<string, unknown> | null> {
  const r = await loadPrecomputedParsed(
    `group/${slug}-api.json`,
    looseEntityApiDocumentSchema,
    req
  );
  return r.ok ? r.data : null;
}

export async function loadOwnerApiDocument(
  slug: string,
  req?: Request
): Promise<Record<string, unknown> | null> {
  const r = await loadPrecomputedParsed(
    `owner/${slug}-api.json`,
    looseEntityApiDocumentSchema,
    req
  );
  return r.ok ? r.data : null;
}
