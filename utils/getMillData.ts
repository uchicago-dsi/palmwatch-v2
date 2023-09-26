import companyData from './company_columnar.json';
import umlData from './uml_columnar.json';
import millImpactData from './data_by_mill_columnar.json';
import { all, desc, op, table, escape } from 'arquero';

type JsonData<T extends string> = {
  [key in T]: string;
}

type MillImpactData = JsonData< keyof typeof millImpactData>
type UmlData = JsonData<keyof typeof umlData>
type CompanyData = JsonData<keyof typeof companyData>

class MillDataQuery { 
  companies = table(companyData);
  uml = table(umlData);
  millImpact = table(millImpactData);

  getUml(umlId: string) {
    return this.uml.filter(escape((d: UmlData) => d['UML ID'] === umlId))
      .join(this.millImpact, ['UML ID', 'UML ID'])
  }

  getBrandUsage(umlId: string) {
    const data = this.companies.filter(escape((d: CompanyData) => d['uml_id'] === umlId)).objects() as CompanyData[];
    const results: {[key: string]: number[]} = {}
    for (const d of data) {
      const brand = d['consumer_brand'];
      const year = d['report_year'];
      results[brand] = [...(results[brand] || []), +year];
    }
    const sortedResults = Object.entries(results)
      .sort(([k,v]) => v.length)
      .map(([k, v]) => ({ brand: k, years: v.sort((a,b) => a-b) }))
    return sortedResults;
  }
  
  getMillImpact(millId: string) {
    return this.millImpact.filter(escape((d: MillImpactData) => d['UML ID'] === millId))
  }

  getBrandInfo(brand: string) {
    return this.companies.filter(escape((d: CompanyData) => d['consumer_brand'] === brand))
      .join(this.uml, ['uml_id', 'UML ID'])
      .join(this.millImpact, ['uml_id', 'UML ID'])
  }
  
  getMillsInBbox(minLat: number, minLng: number, maxLat: number, maxLng: number) {
    return this.uml.filter(escape((d: UmlData) => {
      const millLat = +d['Latitude'];
      const millLng = +d['Longitude'];
      return millLat >= minLat && millLat <= maxLat && millLng >= minLng && millLng <= maxLng;
    }))
  }

  getFullMillInfo() {
    return this.uml.join(this.millImpact, ['UML ID', 'UML ID'])
  }

  getSearchList() {
    const brandList = companyData.consumer_brand.filter(this.filterUniqueList).map(f => ({
      label: f,
      href: `/brand/${f}`
    }))
    const millList = umlData['Mill Name'].filter(this.filterUniqueList).map(f => ({
      label: f,
      href: `/mill/${f}`
    }))
    return {
      Brand: brandList,
      Mill: millList
    }
  }

  // utils
  filterUniqueList(v: any, i: number, a: any[]) {
    return a.indexOf(v) === i;
  }
}

const queryClient = new MillDataQuery();
export default queryClient;