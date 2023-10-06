import { load, loadArrow, all, desc, op, table, escape } from "arquero";
import ColumnTable from "arquero/dist/types/table/column-table";

type UmlData = any;
type CompanyData = any;

const umlColumns = [
  "UML ID",
  "Group Name",
  "Parent Company",
  "Mill Name",
  "RSPO Status",
  "RSPO Type",
  "Date RSPO Certification Status",
  "Latitude",
  "Longitude",
  "GPS coordinates",
  "ISO",
  "Country",
  "Province",
  "District",
  "Confidence level",
  "Alternative name",
  "km_forest_area_00",
  "ha_forest_area_00",
  "km_0",
  "ha_0",
  "km_1",
  "ha_1",
  "km_2",
  "ha_2",
  "km_3",
  "ha_3",
  "km_4",
  "ha_4",
  "km_5",
  "ha_5",
  "km_6",
  "ha_6",
  "km_7",
  "ha_7",
  "km_8",
  "ha_8",
  "km_9",
  "ha_9",
  "km_10",
  "ha_10",
  "km_11",
  "ha_11",
  "km_12",
  "ha_12",
  "km_13",
  "ha_13",
  "km_14",
  "ha_14",
  "km_15",
  "ha_15",
  "km_16",
  "ha_16",
  "km_17",
  "ha_17",
  "km_18",
  "ha_18",
  "km_19",
  "ha_19",
  "km_20",
  "ha_20",
  "km_21",
  "ha_21",
  "km_22",
  "ha_22",
];

const companiesColumns = ["consumer_brand", "report_year", "UML ID"];
class MillDataQuery {
  companies?: ColumnTable;
  uml?: ColumnTable;
  initialized: boolean = false;

  async init() {
    if (this.initialized) return;
    const [uml, companies] = await Promise.all([
      loadArrow("./public/data/uml.arrow", { columns: all() }),
      loadArrow("./public/data/companies.arrow", { columns: all() }),
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
    const t0 = performance.now();
    const companies = this.companies!.filter(
      escape((d: CompanyData) => d["consumer_brand"] === brand)
    )
      .groupby("UML ID")
      .derive({
        years: (d: CompanyData) => op.array_agg_distinct(d["report_year"]),
      })
      .select("UML ID", "years")
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
queryClient.init();
export default queryClient;
