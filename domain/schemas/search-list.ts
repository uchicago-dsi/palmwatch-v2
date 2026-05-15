import { z } from "zod";

const searchListItem = z.object({
  label: z.string(),
  href: z.string(),
  imgPath: z.string().optional(),
});

const searchListItemNoImg = z.object({
  label: z.string(),
  href: z.string(),
});

/** Validates `public/data/precomputed/search-list.json`. */
export const searchListPayloadSchema = z.object({
  Brands: z.array(searchListItem),
  Mills: z.array(searchListItemNoImg),
  "Mill Owners": z.array(searchListItemNoImg),
  "Mill Groups": z.array(searchListItemNoImg),
  Countries: z.array(searchListItemNoImg),
});

export type SearchListPayloadValidated = z.infer<
  typeof searchListPayloadSchema
>;
