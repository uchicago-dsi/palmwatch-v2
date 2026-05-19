import type { TypedObject } from "sanity";

export interface BrandSchema {
  altName?: string;
  content?: TypedObject | TypedObject[];
  country: string;
  description: string | React.ReactNode;
  descriptionAttribution: string | React.ReactNode;
  /*
   * List of disclosure PDFs by year
   */
  disclosures: {
    year: string;
    filename: string;
  }[];
  externalLink: string;
  /*
   * The name of the brand.
   */
  name: string;
  rspoMemberSince: string;
}
