import { BrandSchema } from "./types";

export const LOreal: BrandSchema = {
  name: "L'Oreal",
  country: "France",
  rspoMemberSince: "2004-05-17",
  externalLink:
    "https://www.loreal.com/en/commitments-and-responsibilities/for-our-products/",
  descriptionAttribution: "RSPO",
  description:
    "Founded in 1907, L'Oreal is the first cosmetics company in the world with consolidated sales of 25,84 billion euros in 2016. The group has a global workforce of 89 300 employees and maintains a portfolio of 34 international brands, sold in 140 countries.. L'Oreal is the cosmetics industry's largest investor in research with 3.3% of the Group annual turnover dedicated to R&D.",
  disclosures: [
    {
      year: '2017',
      filename: "disclosures/loreal/2017_loreal.pdf",
    },
    {
      year: '2018',
      filename: "disclosures/loreal/2018_loreal.pdf",
    },
    {
      year: '2019',
      filename: "disclosures/loreal/2019_loreal.pdf",
    },
    {
      year: '2021',
      filename: "disclosures/loreal/2021_loreal.pdf",
    },
    {
      year: 'Unkown',
      filename: "disclosures/loreal/unknown_loreal.pdf",
    }
  ],
};
