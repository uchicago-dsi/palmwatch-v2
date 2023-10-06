import { BrandSchema } from "./types";

export const Mars: BrandSchema = {
  name: "Mars, Incorporated",
  country: "United States",
  rspoMemberSince: "2010-12-03",
  externalLink: "https://www.mars.com/sustainability-plan",
  descriptionAttribution: "RSPO",
  description:
    "Mars, Incorporated is a private, family-owned company employing more than 115,000 associates in 80 countries worldwide. Headquartered in McLean, Va., U.S., Mars, Incorporated is one of the world's largest food companies, generating global sales of more than $35 billion annually and operating in four business segments: Confectionery, Petcare, Food, and Drinks. These segments produce some of the world's leading brands: Confectionery: M&M'S®, SNICKERS®, DOVE®, GALAXY®, MARS®, MILKY WAY®, TWIX®, ORBIT®, EXTRA®, STARBURST®, DOUBLEMINT® and SKITTLES®; Petcare PEDIGREE®, WHISKAS®, SHEBA®, CESAR®, NUTRO®, GREENIES® and ROYAL CANIN®; Food UNCLE BEN'S®, DOLMIO®, EBLY®, MASTERFOODS® and SEEDS OF CHANGE®; Drinks KLIX® and FLAVIA®. For more information, please visit www.mars.com. MARS PALM POLICY Mars deals only with those suppliers who have respect for the environment and is committed to working with all stakeholders to make progress towards more sustainable production. We support the environment and the sustainable production of palm oil.",
  disclosures: [
    {
      year: '2020',
      filename: "disclosures/mars/2020H1_mars.pdf",
    },
    {
      year: '2021',
      filename: "disclosures/mars/2021H1_mars.pdf",
    }
  ],
};
