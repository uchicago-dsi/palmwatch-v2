import { z } from "zod";
import { umlDataRowSchema } from "./uml-data-row";

const brandUsageRowSchema = z.object({
  consumer_brand: z.string(),
  years: z.array(z.union([z.string(), z.number()])),
});

/** `group/<slug>-page.json` and `owner/<slug>-page.json`. */
export const groupOwnerPagePayloadSchema = z
  .object({
    mills: z.array(umlDataRowSchema),
    uniqueCountries: z.number(),
    uniqueMills: z.number(),
    brandUsage: z.array(brandUsageRowSchema),
    averageCurrentRisk: z.number(),
    timeseries: z.array(z.record(z.unknown())),
    totalForestLoss: z.number(),
  })
  .passthrough();

export type GroupOwnerPagePayload = z.infer<typeof groupOwnerPagePayloadSchema>;

/** `country/<slug>.json`. */
export const countryPagePayloadSchema = z
  .object({
    mills: z.array(umlDataRowSchema),
    uniqueMills: z.number(),
    brandUsage: z.array(brandUsageRowSchema),
    averageCurrentRisk: z.number(),
    timeseries: z.array(z.record(z.unknown())),
    totalForestLoss: z.number(),
  })
  .passthrough();

export type CountryPagePayload = z.infer<typeof countryPagePayloadSchema>;
