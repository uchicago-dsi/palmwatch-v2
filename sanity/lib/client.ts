import { createClient } from 'next-sanity'
import { brandInfoQuery, aboutPageQuery, contactPageQuery, footerInfoQuery, umlInfoQuery, homePageQuery, countyInfoQuery, groupInfoQuery, landingPageContentQuery } from "./groq";
import { BrandSchema } from "@/config/brands/types";

import { apiVersion, dataset, projectId, useCdn } from '../env'
import { AboutPageContent, ContactPageContent, HomePageContent } from './types';
import { SanityClient } from 'sanity';
class CmsClient {
  client: SanityClient;
  brandData: Record<string, BrandSchema> = {}
  umlData: Record<string, Partial<BrandSchema>> = {}
  
  constructor() {
    this.client = createClient({
      apiVersion,
      dataset,
      projectId,
      useCdn,
    }) as SanityClient;
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
    const data = await this.client.fetch<Partial<BrandSchema>>(umlInfoQuery, { uml });
    this.umlData[uml] = data;
    return data;
  }

  async getCountryInfo(country: string) {
    return await this.client.fetch<Partial<BrandSchema>>(countyInfoQuery, { country });
  }
  async getGroupInfo(group: string) {
    return await this.client.fetch<Partial<BrandSchema>>(groupInfoQuery, { group });
  }
  async getLandingPageContent(page: string) {
    return await this.client.fetch<{content?: any[]; disclaimer?:any[]}>(landingPageContentQuery, { page });
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
  async getHomeContent() {
    return await this.client.fetch<HomePageContent>(homePageQuery)
  }
}

const client =  new CmsClient();

export default client;