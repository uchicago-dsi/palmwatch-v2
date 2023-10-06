import { BrandSchema } from "./types";

export const PepsiCo: BrandSchema = {
  name: "PepsiCo",
  country: "United States",
  rspoMemberSince: "2009-05-06",
  externalLink: "https://www.pepsico.com/sustainability/esg-topics-a-z",
  descriptionAttribution: "Wikipedia",
  description:
    "PepsiCo, Inc. is an American multinational food, snack and beverage corporation headquartered in Harrison, New York, in the hamlet of Purchase. PepsiCo has interests in the manufacturing, marketing, and distribution of grain-based snack foods, beverages, and other products. PepsiCo was formed in 1965 with the merger of the Pepsi-Cola Company and Frito-Lay, Inc. PepsiCo has since expanded from its namesake product Pepsi to a broader range of food and beverage brands, the largest of which included an acquisition of Tropicana Products in 1998 and the Quaker Oats Company in 2001, which added the Gatorade brand to its portfolio.",
  disclosures: [
    {
      year: '2017',
      filename: "disclosures/pepsico/2017_pepsico.pdf",
    },
    {
      year: '2019',
      filename: "disclosures/pepsico/2019_pepsico.pdf",
    },
    {
      year: '2020',
      filename: "disclosures/pepsico/2020_pepsico.pdf",
    },
    {
      year: '2021',
      filename: "disclosures/pepsico/2021_pepsico.pdf",
    }
  ],
};
