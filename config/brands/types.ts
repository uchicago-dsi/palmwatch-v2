export type BrandSchema = {
  name: string;
  disclosures: {
    year: string;
    filename: string;
  }[];
  description: string | React.ReactNode;
  descriptionAttribution: string | React.ReactNode;
  country: string;
  rspoMemberSince: string;
  externalLink: string;
};