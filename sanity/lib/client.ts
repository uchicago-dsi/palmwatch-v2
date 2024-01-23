import { createClient } from 'next-sanity'
import { brandInfoQuery, aboutPageQuery, contactPageQuery, footerInfoQuery } from "./groq";
import { BrandSchema } from "@/config/brands/types";

import { apiVersion, dataset, projectId, useCdn } from '../env'
import { AboutPageContent, ContactPageContent } from './types';
class CmsClient {
  client: ReturnType<typeof createClient>;
  brandData: Record<string, BrandSchema> = {}
  umlData: Record<string, Partial<BrandSchema>> = {}
  
  constructor() {
    this.client = createClient({
      apiVersion,
      dataset,
      projectId,
      useCdn,
    });
  }

  async getBrandInfo(name: string) {
    if (this.brandData[name]) {
      return this.brandData[name];
    }
    const data = await this.client.fetch<BrandSchema>(brandInfoQuery, { name });
    this.brandData[name] = data;
    return data;
  }

  async getUmlInfo(uml: string) {
    if (this.umlData[uml]) {
      return this.umlData[uml];
    }
    const data = await this.client.fetch<Partial<BrandSchema>>(brandInfoQuery, { uml });
    this.umlData[uml] = data;
    return data;
  }

  async getAboutPage() {
    return await this.client.fetch<AboutPageContent>(aboutPageQuery);
  }

  async getContactPage(){
    return await this.client.fetch<ContactPageContent>(contactPageQuery);
  }
  async getFooterContent() {
    return await this.client.fetch(footerInfoQuery);
  }
}

export default new CmsClient();