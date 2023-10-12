import { createClient } from 'next-sanity'
import { brandInfoQuery } from "./groq";

import { apiVersion, dataset, projectId, useCdn } from '../env'

export const client = createClient({
  apiVersion,
  dataset,
  projectId,
  useCdn,
})

export async function getBrandInfo(name: string) {
  const data = await client.fetch(brandInfoQuery, { name });
  return data;
}