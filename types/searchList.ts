/** Shape of `public/data/precomputed/search-list.json` (navbar search). */
export type SearchListPayload = {
  Brands: { label: string; href: string; imgPath?: string }[];
  Mills: { label: string; href: string }[];
  "Mill Owners": { label: string; href: string }[];
  "Mill Groups": { label: string; href: string }[];
  Countries: { label: string; href: string }[];
};

export type SearchListSection = keyof SearchListPayload;
