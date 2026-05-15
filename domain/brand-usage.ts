/** Consumer brands linked to a mill in precomputed mill JSON. */
export type BrandUsageRow = {
  consumer_brand: string;
  years: Array<string | number>;
};

export type BrandData = BrandUsageRow[];
