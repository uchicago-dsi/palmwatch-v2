import type { SchemaTypeDefinition } from "sanity";
import aboutPage from "./schemas/about-page";
import brandInfo from "./schemas/brand-info";
import contactPage from "./schemas/contact-page";
import countryInfo from "./schemas/country-info";
import footerInfo from "./schemas/footer-info";
import groupInfo from "./schemas/group-info";
import landingPageContent from "./schemas/landing-page-content";
import millInfo from "./schemas/mill-info";
import ownerInfo from "./schemas/owner-info";

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [
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
