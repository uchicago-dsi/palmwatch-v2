const fs= require('fs')

const old_data = [
  {
    "id": 6,
    "name": "General Mills, Inc",
    "country": "United States",
    "rspo_member_since": "2012-02-03",
    "external_link": "https://www.generalmills.com/en/Responsibility/Sustainability/sustainable-sourcing",
    "description_attribution": "RSPO",
    "description": "General Mills manufactures and markets branded consumer foods worldwide. The company offers cereals, yogurt, soup, dinners, vegetables, dough products, dessert and baking mixes, pizza and pizza snacks, snacks; and a range of organic products, including soup, cereals; ice cream and frozen desserts, and grain snacks. General mills currently uses palm in a number of products. It sells its products through its direct sales personnel to grocery stores and other retailers. The company was founded in 1928 and is based in Minneapolis, Minnesota."
  },
  {
    "id": 7,
    "name": "The Hershey Company",
    "country": "United States",
    "rspo_member_since": "2011-04-21",
    "external_link": "https://www.thehersheycompany.com/en_us/sustainability/shared-business/palm-oil-facts.html",
    "description_attribution": "RSPO",
    "description": "The Hershey Company is headquartered in the United States in Hershey, Pennsylvania and was founded in 1894 by Milton S. Hershey. Hershey is the largest producer of quality chocolate in North America and a global leader in chocolate and sugar confectionery. We market confectionery products in over 50 countries worldwide, employ more than 12,000 people and have revenues of more than $ 5 billion per year. Our mission is to bring sweet moments of Hershey happiness to the world every day. We do this through our values of being open to possibilities, making a difference, growing together and being one Hershey. This mission and these values are at the core of our work in Corporate Social Responsibility (CSR). We are building on Milton Hershey's legacy of commitment to consumers, community and children, by providing high-quality Hershey products while conducting our business in a socially responsible and environmentally sustainable manner. We have organized CSR-related business issues in four areas: environment, community, workplace and marketplace. In each area, we have defined priority statements and measurable targets. Our programs, priorities and targets are found in our CSR Report: www.thehersheycompany.com/social-responsibility/csr-report We will provide updates on our progress in future scorecard updates and CSR Reports. Regarding the Environment, we have identified sustainable sourcing as a priority. We seek to better understand the impacts of our current inputs and to learn how we can meet product requirements with more sustainable sourcing."
  },
  {
    "id": 8,
    "name": "L'Oreal",
    "country": "France",
    "rspo_member_since": "2004-05-17",
    "external_link": "https://www.loreal.com/en/commitments-and-responsibilities/for-our-products/",
    "description_attribution": "RSPO",
    "description": "Founded in 1907, L'Oreal is the first cosmetics company in the world with consolidated sales of 25,84 billion euros in 2016. The group has a global workforce of 89 300 employees and maintains a portfolio of 34 international brands, sold in 140 countries.. L'Oreal is the cosmetics industry's largest investor in research with 3.3% of the Group annual turnover dedicated to R&D."
  },
  {
    "id": 9,
    "name": "The Procter & Gamble Company",
    "country": "United States",
    "rspo_member_since": "2010-09-20",
    "external_link": "https://us.pg.com/environmental-sustainability/",
    "description_attribution": "Wikipedia",
    "description": "The Procter & Gamble Company (P&G) is an American multinational consumer goods corporation headquartered in Cincinnati, Ohio, founded in 1837 by William Procter and James Gamble.  It specializes in a wide range of personal health/consumer health, and personal care and hygiene products; these products are organized into several segments including Beauty; Grooming; Health Care; Fabric & Home Care; and Baby, Feminine, & Family Care. Before the sale of Pringles to Kellogg's, its product portfolio also included foods, snacks, and beverages."
  },
  {
    "id": 11,
    "name": "Nestlé",
    "country": "Switzerland",
    "rspo_member_since": "2009-11-16",
    "external_link": "https://www.nestle.com/csv/impact",
    "description_attribution": "RSPO",
    "description": "Nestlé with headquarters in Vevey, Switzerland was founded in 1866 by Henri Nestlé and is today the world's leading nutrition, health and wellness company. Sales for 2008 were CHF 109.9 bn, with a net profit of CHF 18.0 bn. We employ around 283,000 people and have factories or operations in almost every country in the world. The Company's strategy is guided by several fundamental principles. Nestlé's existing products grow through innovation and renovation while maintaining a balance in geographic activities and product lines. Long-term potential is never sacrificed for short-term performance. The Company's priority is to bring the best and most relevant products to people, wherever they are, whatever their needs, throughout their lives. Today Nestlé is present in different markets in the following product categories: Coffee and Beverages, Waters, Dairy, Ice Cream, Confectionery, Infant Nutrition, Healthcare, Culinary including Frozen Foods, Petcare."
  },
  {
    "id": 12,
    "name": "Mars, Incorporated",
    "country": "United States",
    "rspo_member_since": "2010-12-03",
    "external_link": "https://www.mars.com/sustainability-plan",
    "description_attribution": "RSPO",
    "description": "Mars, Incorporated is a private, family-owned company employing more than 115,000 associates in 80 countries worldwide. Headquartered in McLean, Va., U.S., Mars, Incorporated is one of the world's largest food companies, generating global sales of more than $35 billion annually and operating in four business segments: Confectionery, Petcare, Food, and Drinks. These segments produce some of the world's leading brands: Confectionery: M&M'S®, SNICKERS®, DOVE®, GALAXY®, MARS®, MILKY WAY®, TWIX®, ORBIT®, EXTRA®, STARBURST®, DOUBLEMINT® and SKITTLES®; Petcare PEDIGREE®, WHISKAS®, SHEBA®, CESAR®, NUTRO®, GREENIES® and ROYAL CANIN®; Food UNCLE BEN'S®, DOLMIO®, EBLY®, MASTERFOODS® and SEEDS OF CHANGE®; Drinks KLIX® and FLAVIA®. For more information, please visit www.mars.com. MARS PALM POLICY Mars deals only with those suppliers who have respect for the environment and is committed to working with all stakeholders to make progress towards more sustainable production. We support the environment and the sustainable production of palm oil."
  },
  {
    "id": 13,
    "name": "Unilever",
    "country": "Netherlands",
    "rspo_member_since": "2004-05-18",
    "external_link": "https://www.unilever.com/sustainable-living/",
    "description_attribution": "RSPO",
    "description": "Unilever is an Anglo-Dutch manufacturer of branded fast-moving consumer goods. With Head Offices in London and Rotterdam, Unilever has operations in over 100 countries and sells products in over 150 countries. Unilever's mission is: Our mission is to add vitality to life. We meet everyday needs for hygiene, nutrition and personal care with brands that help people feel good, look good and get more out of life. Well known Unilever brands are Dove, Magnum, Knorr, Hellmann's, Persil, Axe, Lipton, Bertolli, Good Humor Bryer's, Cif, Royco. Unilever employs about 230,000 people worldwide. 2003 Sales was 47.7 B, pre-tax operating profit was 6.8 B. Unilever has three sustainability initiatives: on water, on fish and on agriculture. If you want to read more about our sustainable agriculture programme, please look at the Unilever website at: http://www.unilever.com/environmentsociety/sustainability  Specific documents, protocols, brochures etc can be found at: http://www.growingforthefuture.com"
  },
  {
    "id": 14,
    "name": "Reckitt Benckiser (RB)",
    "country": "United Kingdom",
    "rspo_member_since": "2006-06-12",
    "external_link": "https://www.rb.com/sustainability/",
    "description_attribution": "RSPO",
    "description": "Reckitt Benckiser is a leading manufacturer of household cleaning and health & personal care products. We employ around 23,000 people, with sales in 180 countries and more than 40 manufacturing facilities worldwide. Over and above the benefits of our products in improving hygiene and health, we're intent on delivering them in a sustainable and responsible way. Here our priorities are Environmental Sustainability (climate change, a sustainable supply chain and waste reduction/recycling) and Social and Ethical Responsibility (employee health & safety, a responsible supply chain and local/global community involvement). Our latest Sustainability Report, and information on our management of corporate responsibility issues, is available at: http://www.reckittbenckiser.com/about/corporate.cfm Reckitt Benckiser is headquartered in the United Kingdom and listed on the London stock exchange; with a market capitalization of circa £14bn we rank among the top 30 UK listed companies. In 2005 net revenues were £4.18bn and net income £669m. Our well-known brands include Dettol, Nurofen, Strepsils, Gaviscon, Clearasil, Vanish, Spray 'n Wash, Calgon, Woolite, Lysol, Harpic, Cillit / Easy-Off Bang, Finish, Calgonit, Electrasol, Air Wick and Mortein."
  },
  {
    "id": 15,
    "name": "Mondelez",
    "country": "United States",
    "rspo_member_since": "2011-08-28",
    "external_link": "https://www.mondelezinternational.com/Snacking-Made-Right",
    "description_attribution": "RSPO",
    "description": "Mondelez International, Inc. (NASDAQ:MDLZ) is building the best snacking company in the world, with 2016 net revenues of approximately $26 billion. Creating more moments of joy in approximately 165 countries, Mondelez International is a world leader in biscuits, chocolate, gum, candy and powdered beverages, featuring global Power Brands such as Oreo and belVita biscuits; Cadbury Dairy Milk and Milka chocolate; and Trident gum. Mondelez International is a proud member of the Standard and Poor's 500, NASDAQ 100 and Dow Jones Sustainability Index."
  },
  {
    "id": 16,
    "name": "Neste",
    "country": "Finland",
    "rspo_member_since": "2006-02-21",
    "external_link": "https://www.neste.com/sustainability",
    "description_attribution": "RSPO",
    "description": "Neste (NESTE, Nasdaq Helsinki) creates sustainable solutions for transport, business, and consumer needs. Our wide range of renewable products enable our customers to reduce climate emissions. We are the world's largest producer of renewable diesel refined from waste and residues, introducing renewable solutions also to the aviation and plastics industries. We are also a technologically advanced refiner of high-quality oil products. We want to be a reliable partner with widely valued expertise, research, and sustainable operations. In 2019, Neste's revenue stood at EUR 15.8 billion. In 2020, Neste placed 3rd on the Global 100 list of the most sustainable companies in the world. Read more: neste.com."
  }
]

old_data.forEach((company) => {
  const newData = {
    name: company.name,
    country: company.country,
    rspoMemberSince: company.rspo_member_since,
    externalLink: company.external_link,
    descriptionAttribution: company.description_attribution,
    description: company.description,
    disclosures: []
  }
  const newFile = `./data/${company.name}.ts`
  const stringified = JSON.stringify(newData, null, 2)
  const fileContents = `import { BrandSchema } from "./types";
\n  export const ${company.name}: BrandSchema = ${stringified}`

  fs.writeFileSync(newFile, fileContents)
})