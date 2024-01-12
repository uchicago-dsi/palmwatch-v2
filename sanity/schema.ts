import { type SchemaTypeDefinition } from 'sanity'
import brandInfo from './schemas/brandInfo'
import millInfo from './schemas/millInfo'
import supplierInfo from './schemas/supplierInfo'
import countryInfo from './schemas/countryInfo'

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [
    brandInfo,
    millInfo,
    supplierInfo,
    countryInfo,
  ],
}

