import { z } from "zod";

/** One row in `public/data/precomputed/companies.json`. */
export const companyJsonRowSchema = z
  .object({
    consumer_brand: z.string(),
    report_year: z.number(),
    "UML ID": z.string(),
  })
  .passthrough();

export const companiesFileSchema = z.array(companyJsonRowSchema);

/** One `full/shard-xxxxx.json` file — validated as object rows; mapped to UmlData at boundary. */
export const umlShardFileSchema = z.array(z.record(z.unknown()));
