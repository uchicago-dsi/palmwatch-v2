import { TypedObject } from "sanity";

export type BrandSchema = {
  /*
  * The name of the brand.
  */
  name: string;
  altName?: string;
  /*
  * List of disclosure PDFs by year
  */
  disclosures: {
    year: string;
    filename: string;
  }[];
  description: string | React.ReactNode;
  descriptionAttribution: string | React.ReactNode;
  country: string;
  rspoMemberSince: string;
  externalLink: string;
  content?: TypedObject | TypedObject[];
};