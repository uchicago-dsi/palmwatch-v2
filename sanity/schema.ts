import { type SchemaTypeDefinition } from 'sanity'
import brandInfo from './schemas/brandInfo'
import millInfo from './schemas/millInfo'
import ownerInfo from './schemas/ownerInfo'
import countryInfo from './schemas/countryInfo'
import aboutPage from './schemas/aboutPage'
import contactPage from './schemas/contactPage'
import footerInfo from './schemas/footerInfo'
import homePage from './schemas/homePage'
import groupInfo from './schemas/groupInfo'

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [
    homePage,
    aboutPage,
    contactPage,
    footerInfo,
    brandInfo,
    countryInfo,
    millInfo,
    ownerInfo,
    groupInfo
  ],
}

