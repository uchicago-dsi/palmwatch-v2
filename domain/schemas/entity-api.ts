import { z } from "zod";

/** `group/<slug>-api.json` and similar API-only blobs (arbitrary top-level keys). */
export const looseEntityApiDocumentSchema = z.record(z.string(), z.unknown());
