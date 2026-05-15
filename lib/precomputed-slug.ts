import { Buffer } from "node:buffer";

/** Stable filesystem-safe slug for arbitrary entity ids (brand, UML, country, …). */
export function precomputedSlug(id: string): string {
  return Buffer.from(id, "utf8").toString("base64url");
}
