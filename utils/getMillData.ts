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
      // .join(this.millImpact, ['UML ID', 'UML ID'],undefined,{ suffix: ["_","_2"]})
  }

  getBrandUsage(umlId: string) {
    const data = this.companies.filter(escape((d: CompanyData) => d['uml_id'] === umlId)).objects() as CompanyData[];
    const results: {[key: string]: number[]} = {}
    for (const d of data) {
      const brand = d['consumer_brand'];
      const year = d['report_year'];
      results[brand] = [...(results[brand] || []), +year];
    }
    return this.sortObject;
  }
  
  getMillImpact(millId: string) {
    return this.millImpact.filter(escape((d: MillImpactData) => d['UML ID'] === millId))
  }

  getBrandInfo(brand: string, cols: string[], quantiles: number[] = [0.25, 0.5, 0.75]) {
    const companies = this.companies.filter(escape((d: CompanyData) => d['consumer_brand'] === brand)).objects() as CompanyData[];
    const results: {[key: string]: number[]} = {}
    for (const d of companies) {
      const umlId = d['uml_id'];
      const year = d['report_year'];
      results[umlId] = [...(results[umlId] || []), +year];
    }
    const sortedResults = this.sortObject(results, 'uml');
    const umls = sortedResults.map(f => f.uml)
    const years = sortedResults.map(f => f.years)
    const filteredTable = table({
      uml: umls,
      years: years
    })
    const umlResult = filteredTable.join(this.uml, ['uml', 'UML ID'])
    const timeseries: Record<string, number|string> = {}
    const columnRollup = cols.reduce((acc, cur) => {
      quantiles.forEach(q => {
        const colName = `${cur}-${q}`
        acc[colName] = op.quantile(cur, q)
      })
      return acc
    }, {} as Record<string, any>)
    const rollup = umlResult.rollup(columnRollup).objects()
    const output = cols.map((col,i) => {
      const yearText = col.split('_')[1]
      const year = parseInt(`20${yearText.length === 1 ? `0${yearText}` : yearText}}`)
      const data = {
        year,
        col
      }
      quantiles.forEach(q => {
        const colName = `${col}-${q}`
        // @ts-ignore
        data[`q${q}`] = rollup[0][colName]
      })
      return data
    })
        
    return {
      umlInfo: umlResult.objects(),
      timeseries: output
    }
  }
  
  getMillsInBbox(minLat: number, minLng: number, maxLat: number, maxLng: number) {
    return this.uml.filter(escape((d: UmlData) => {
      const millLat = +d['Latitude'];
      const millLng = +d['Longitude'];
      return millLat >= minLat && millLat <= maxLat && millLng >= minLng && millLng <= maxLng;
    }))
  }

  getFullMillInfo() {
    return this.uml
    // .join(this.millImpact, ['UML ID', 'UML ID'])
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
  sortObject(data: {[key: string]: number[]}, key: string){
    return Object.entries(data)
      .sort(([k,v]) => v.length)
      .map(([k, v]) => ({ [key]: k, years: v.sort((a,b) => a-b) }))
  }
}

const queryClient = new MillDataQuery();
export default queryClient;