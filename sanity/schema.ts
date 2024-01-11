import { type SchemaTypeDefinition } from 'sanity'
import brandInfo from './schemas/brandInfo'
import millInfo from './schemas/millInfo'

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [
    brandInfo,
    millInfo
  ],
}

