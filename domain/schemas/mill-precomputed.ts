import { z } from "zod";

const brandUsageRowSchema = z.object({
  consumer_brand: z.string(),
  years: z.array(z.union([z.string(), z.number()])),
});

/** Minimal envelope for `mill/<slug>.json` — row shape validated at runtime elsewhere. */
export const millPrecomputedEnvelopeSchema = z.object({
  info: z.array(z.unknown()).min(1),
  brands: z.array(brandUsageRowSchema),
});

export type MillPrecomputedEnvelope = z.infer<
  typeof millPrecomputedEnvelopeSchema
>;
