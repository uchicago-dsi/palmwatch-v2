import { load, loadArrow, all, desc, op, table, escape } from "arquero";
import ColumnTable from "arquero/dist/types/table/column-table";

type UmlData = any;
type CompanyData = any;
class MillDataQuery {
  companies?: ColumnTable;
  uml?: ColumnTable;
  initialized: boolean = false;

  async init(basePath:string = "./public/data/") {
    console.log(basePath)
    if (this.initialized) return;
    const [uml, companies] = await Promise.all([
      loadArrow(`${basePath}/uml.arrow`, { columns: all() }),
      loadArrow(`${basePath}/companies.arrow`, { columns: all() }),
    ]);

    this.uml = uml;
    this.companies = companies;
    this.initialized = true;
  }
  getMillName(name: string){
    return this.uml!.filter(escape((d: UmlData) => d["Mill Name"] === name));
  }
  getUml(umlId: string) {
    return this.uml!.filter(escape((d: UmlData) => d["UML ID"] === umlId));
  }

  getBrandUsage(umlId: string) {
    const data = this.companies!.filter(
      escape((d: CompanyData) => d["UML ID"] === umlId)
    )
      .orderby("report_year")
      .groupby("consumer_brand")
      .derive({
        years: (d: CompanyData) => op.array_agg_distinct(d["report_year"]),
      })
      .select("consumer_brand", "years");

    return this.stringifyBigInts(data.objects().filter(this.filterUniqueByKey("consumer_brand")));
  }

  getBrandInfo(
    brand: string,
    cols: string[],
    quantiles: number[] = [0.25, 0.5, 0.75]
  ) {
    const companies = this.companies!.filter(
      escape((d: CompanyData) => d["consumer_brand"] === brand)
    )
      .groupby("UML ID")
      .derive({
        years: (d: CompanyData) => op.array_agg_distinct(d["report_year"]),
      })
      .select("UML ID", "years")
      .dedupe("UML ID")
      .join(this.uml!, ["UML ID", "UML ID"]);

    const quantileResults: Record<string, any>[] = [];
    for (const col of cols) {
      const colParts = col.split("_");
      const year = parseInt(colParts.at(-1) || '0');
      const quantileRollup = quantiles.reduce(
        (acc, q) => ({
          ...acc,
          [`q${q}`]: op.quantile(col, q),
        }),
        {}
      );
      const _d = companies.select(col).rollup(quantileRollup);
      quantileResults.push({
        ..._d.objects()[0],
        year,
      });
    }
    return {
      umlInfo: this.stringifyBigInts(companies.objects()),
      timeseries: quantileResults,
    };
  }

  getMillsInBbox(
    minLat: number,
    minLng: number,
    maxLat: number,
    maxLng: number
  ) {
    return this.uml!.filter(
      escape((d: UmlData) => {
        const millLat = +d["Latitude"];
        const millLng = +d["Longitude"];
        return (
          millLat >= minLat &&
          millLat <= maxLat &&
          millLng >= minLng &&
          millLng <= maxLng
        );
      })
    );
  }

  getFullMillInfo() {
    return this.uml!;
  }

  getSearchList() {
    const brandList: { label: string; href: string, imgPath?: string }[] = [];
    const usedBrands: { [key: string]: boolean } = {};
    const companyData = this.companies!.objects() as CompanyData[];
    for (const d of companyData) {
      const brand = d["consumer_brand"];
      if (!usedBrands[brand]) {
        brandList.push({
          label: brand,
          href: `/brand/${brand}`,
          // imgPath: `/img/brands/${brand}.png`,
        });
        usedBrands[brand] = true;
      }
    }
    const umlData = this.uml!.objects() as UmlData[];
    const millList: { label: string; href: string }[] = [];
    const usedMills: { [key: string]: boolean } = {};
    for (const d of umlData) {
      const mill = d["Mill Name"];
      if (!usedMills[mill]) {
        millList.push({
          label: mill,
          href: `/mill/${mill}`,
        });
        usedMills[mill] = true;
      }
    }

    return {
      Brands: brandList,
      Mills: millList,
      Suppliers: [],
      Groups: []
    } as const
  }

  // utils
  filterUniqueList(v: any, i: number, a: any[]) {
    return a.indexOf(v) === i;
  }
  filterUniqueByKey = (key:string) => (
    v: any,
    i: number,
    a: any[]
  ) => {
    return a.findIndex((d) => d[key] === v[key]) === i;
  }
  sortObject(data: { [key: string]: number[] }, key: string) {
    return Object.entries(data)
      .sort(([k, v]) => v.length)
      .map(([k, v]) => ({ [key]: k, years: v.sort((a, b) => a - b) }));
  }
  stringifyBigInts(obj: object | object[]) {
    return JSON.parse(
      JSON.stringify(obj, (key, value) => {
        if (typeof value === "bigint") {
          return value.toString();
        }
        return value;
      })
    );
  }
}

const queryClient = new MillDataQuery();
export default queryClient;
