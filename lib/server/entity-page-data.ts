import type {
  CountryPagePayload,
  GroupOwnerPagePayload,
} from "@/domain/schemas/entity-pages";
import {
  countryPagePayloadSchema,
  groupOwnerPagePayloadSchema,
} from "@/domain/schemas/entity-pages";
import { loadPrecomputedParsed } from "@/lib/server/load-precomputed-parsed";

export async function loadGroupPagePayload(
  slug: string,
  req?: Request
): Promise<GroupOwnerPagePayload | null> {
  const r = await loadPrecomputedParsed(
    `group/${slug}-page.json`,
    groupOwnerPagePayloadSchema,
    req
  );
  return r.ok ? r.data : null;
}

export async function loadOwnerPagePayload(
  slug: string,
  req?: Request
): Promise<GroupOwnerPagePayload | null> {
  const r = await loadPrecomputedParsed(
    `owner/${slug}-page.json`,
    groupOwnerPagePayloadSchema,
    req
  );
  return r.ok ? r.data : null;
}

export async function loadCountryPagePayload(
  slug: string,
  req?: Request
): Promise<CountryPagePayload | null> {
  const r = await loadPrecomputedParsed(
    `country/${slug}.json`,
    countryPagePayloadSchema,
    req
  );
  return r.ok ? r.data : null;
}
