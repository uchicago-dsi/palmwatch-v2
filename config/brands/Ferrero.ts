import { BrandSchema } from "./types";

export const Ferrero: BrandSchema = {
  name: "Ferrero",
  country: "Luxembourg",
  rspoMemberSince: "2005-01-17",
  externalLink: "https://www.ferrerocsr.com/",
  descriptionAttribution: "Wikipedia & RSPO",
  description:
    "Ferrero SpA, more commonly known as Ferrero Group, is an Italian manufacturer of branded chocolate and confectionery products, and the second biggest chocolate producer and confectionery company in the world. It was founded in 1946 in Alba, Piedmont, Italy, by Pietro Ferrero, a confectioner and small-time pastry maker who laid the groundwork for Nutella and famously added hazelnut to save money on chocolate. Family-owned to this day, the company has built itself into an international group with commercial interests in the Americas, Australasia, Asia and Africa, as well as in Western and Eastern Europe. The Group, which is headquartered in Luxembourg, has three R&D centres and twenty production plants.  Thanks to the dedicated commitment of 22,000 employees, brands like Nutella, Ferrero Rocher, Mon Cheri, Tic Tac, Kinder Bueno, Kinder Sorpresa and Raffaello have become worldwide successes.  For Ferrero, respecting nature is so important that the Group considers the objectives of its environmental policy on a par with its production goals. In order to do this, it has set ambitious goals on every impact it could have on the environment.",
  disclosures: [
    // 2017H! 2018H1 2019H1 2020H1 2020H2 2021H1
    {
      year: '2017',
      filename: "disclosures/ferrero/2017H1_ferrero.pdf",
    },
    {
      year: '2018',
      filename: "disclosures/ferrero/2018H1_ferrero.pdf",
    },
    {
      year: '2019',
      filename: "disclosures/ferrero/2019H1_ferrero.pdf",
    },
    {
      year: '2020 (First Half)',
      filename: "disclosures/ferrero/2020H1_ferrero.pdf",
    },
    {
      year: '2020 (Second Half)',
      filename: "disclosures/ferrero/2020H2_ferrero.pdf",
    },
    {
      year: '2021',
      filename: "disclosures/ferrero/2021H1_ferrero.pdf",
    }
  ],
};
