/** Shape of `public/data/precomputed/search-list.json` (navbar search). */
export interface SearchListPayload {
  Brands: { label: string; href: string; imgPath?: string }[];
  Countries: { label: string; href: string }[];
  "Mill Groups": { label: string; href: string }[];
  "Mill Owners": { label: string; href: string }[];
  Mills: { label: string; href: string }[];
}

export type SearchListSection = keyof SearchListPayload;

/** Safe fallback when precomputed search list is missing or invalid. */
export const emptySearchListPayload: SearchListPayload = {
  Brands: [],
  Mills: [],
  "Mill Owners": [],
  "Mill Groups": [],
  Countries: [],
};
