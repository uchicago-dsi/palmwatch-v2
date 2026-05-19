/** Consumer brands linked to a mill in precomputed mill JSON. */
export interface BrandUsageRow {
  consumer_brand: string;
  years: Array<string | number>;
}

export type BrandData = BrandUsageRow[];
