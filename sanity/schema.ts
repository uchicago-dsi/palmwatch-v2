import type { SchemaTypeDefinition } from "sanity";
import aboutPage from "./schemas/aboutPage";
import brandInfo from "./schemas/brandInfo";
import contactPage from "./schemas/contactPage";
import countryInfo from "./schemas/countryInfo";
import footerInfo from "./schemas/footerInfo";
import groupInfo from "./schemas/groupInfo";
import homePage from "./schemas/homePage";
import landingPageContent from "./schemas/landingPageContent";
import millInfo from "./schemas/millInfo";
import ownerInfo from "./schemas/ownerInfo";

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [
    homePage,
    aboutPage,
    contactPage,
    footerInfo,
    landingPageContent,
    brandInfo,
    countryInfo,
    millInfo,
    ownerInfo,
    groupInfo,
  ],
};
