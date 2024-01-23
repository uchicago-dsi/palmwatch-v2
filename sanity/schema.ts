import { type SchemaTypeDefinition } from 'sanity'
import brandInfo from './schemas/brandInfo'
import millInfo from './schemas/millInfo'
import supplierInfo from './schemas/supplierInfo'
import countryInfo from './schemas/countryInfo'
import aboutPage from './schemas/aboutPage'
import contactPage from './schemas/contactPage'
import footerInfo from './schemas/footerInfo'
export const schema: { types: SchemaTypeDefinition[] } = {
  types: [
    brandInfo,
    millInfo,
    supplierInfo,
    countryInfo,
    aboutPage,
    contactPage,
    footerInfo
  ],
}

