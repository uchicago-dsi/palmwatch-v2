import { load, loadArrow, all, desc, op, table, escape } from "arquero";
import ColumnTable from "arquero/dist/types/table/column-table";
import { CompanyData, UmlData } from "./dataTypes";
class MillDataQuery {
  companies?: ColumnTable;
  uml?: ColumnTable;
  initialized: boolean = false;
  cache: Record<string, any> = {};

  async init(basePath: string = "./public/data/") {
    if (this.initialized) return;
    const [uml, companies] = await Promise.all([
      loadArrow(`${basePath}/uml.arrow`, { columns: all() }),
      loadArrow(`${basePath}/companies.arrow`, { columns: all() }),
    ]);

    this.uml = uml;
    this.companies = companies;
    this.initialized = true;
  }
  getMillName(name: string) {
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

    return this.stringifyBigInts(
      data.objects().filter(this.filterUniqueByKey("consumer_brand"))
    );
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
      const year = parseInt(colParts.at(-1) || "0");
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
  getGroupInfo(
    group: string,
    cols: string[],
    quantiles: number[] = [0.25, 0.5, 0.75]
  ) {
    const data = this.uml!.filter(
      escape((d: UmlData) => d["Group Name"] === group)
    )
      .groupby("UML ID")
      .dedupe("UML ID");

    const quantileResults: Record<string, any>[] = [];
    for (const col of cols) {
      const colParts = col.split("_");
      const year = parseInt(colParts.at(-1) || "0");
      const quantileRollup = quantiles.reduce(
        (acc, q) => ({
          ...acc,
          [`q${q}`]: op.quantile(col, q),
        }),
        {}
      );
      const _d = data.select(col).rollup(quantileRollup);
      quantileResults.push({
        ..._d.objects()[0],
        year,
      });
    }
    return {
      umlInfo: this.stringifyBigInts(data.objects()),
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

  @cache("searchList")
  getSearchList() {
    const companyData = this.companies!.select("consumer_brand")
      .dedupe("consumer_brand")
      .objects() as CompanyData[];
    const brandList: { label: string; href: string; imgPath?: string }[] =
      companyData.map((d) => ({
        label: d["consumer_brand"],
        href: `/brand/${d["consumer_brand"]}`,
      }));

    const umlData = this.uml!.select(["UML ID", "Mill Name"])
      .dedupe("UML ID")
      .objects() as UmlData[];
    const millList: { label: string; href: string }[] = umlData.map((d) => ({
      label: d["Mill Name"],
      href: `/mill/${d["UML ID"]}`,
    }));

    const suppliers = this.uml!.select("Group Name")
      .dedupe("Group Name")
      .objects() as UmlData[];
    const suppliersList = suppliers.map((d) => ({
      label: d["Group Name"],
      href: `/supplier/${d["Group Name"]}`,
    }));

    const companies = this.uml!.select("Parent Company")
      .dedupe("Parent Company")
      .objects() as UmlData[];

    const comapniesList = companies.map((d) => ({
      label: d["Parent Company"] || "",
      href: `/company/${d["Parent Company"]}`,
    }));

    const countries = this.uml!.select("Country")
      .dedupe("Country")
      .objects() as UmlData[];

    const countryList = countries.map((d) => ({
      label: d["Country"],
      href: `/country/${d["Country"]}`,
    }));

    const result = {
      Brands: brandList,
      Mills: millList,
      Suppliers: suppliersList,
      Companies: comapniesList,
      Countries: countryList,
    } as const;

    this.cache["searchList"] = result;

    return result;
  }

  // utils
  filterUniqueList(v: any, i: number, a: any[]) {
    return a.indexOf(v) === i;
  }
  filterUniqueByKey = (key: string) => (v: any, i: number, a: any[]) => {
    return a.findIndex((d) => d[key] === v[key]) === i;
  };
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
  @cache("getUniqueCounts")
  getUniqueCounts() {
    const companyCount = this.companies!.select("consumer_brand")
      .dedupe("consumer_brand")
      .count()
      .objects()[0];
    const countryCount = this.uml!.select("Country")
      .dedupe("Country")
      .count()
      .objects()[0];
    const millCount = this.uml!.count().objects()[0];
    const groupCount = this.uml!.select("Group Name")
      .dedupe("Group Name")
      .count()
      .objects()[0];
    return {
      companyCount:
        "count" in companyCount ? (companyCount["count"] as number) : null,
      countryCount:
        "count" in countryCount ? (countryCount["count"] as number) : null,
      millCount: "count" in millCount ? (millCount["count"] as number) : null,
      groupCount:
        "count" in groupCount ? (groupCount["count"] as number) : null,
    };
  }
  
  @cache("getMedianBrandImpacts")
  getMedianBrandImpacts() {
    const t0 = performance.now();
    const brandImpacts = this.companies!.join(this.uml!, ["UML ID", "UML ID"]);

    const grouped = brandImpacts
      .dedupe("consumer_brand", "UML ID")
      .groupby(["consumer_brand", "UML ID"])
      .rollup({
        sum2001: (d: UmlData) =>
          op.sum(d.treeloss_km_2001 as unknown as string),
        sum2002: (d: UmlData) =>
          op.sum(d.treeloss_km_2002 as unknown as string),
        sum2003: (d: UmlData) =>
          op.sum(d.treeloss_km_2003 as unknown as string),
        sum2004: (d: UmlData) =>
          op.sum(d.treeloss_km_2004 as unknown as string),
        sum2005: (d: UmlData) =>
          op.sum(d.treeloss_km_2005 as unknown as string),
        sum2006: (d: UmlData) =>
          op.sum(d.treeloss_km_2006 as unknown as string),
        sum2007: (d: UmlData) =>
          op.sum(d.treeloss_km_2007 as unknown as string),
        sum2008: (d: UmlData) =>
          op.sum(d.treeloss_km_2008 as unknown as string),
        sum2009: (d: UmlData) =>
          op.sum(d.treeloss_km_2009 as unknown as string),
        sum2010: (d: UmlData) =>
          op.sum(d.treeloss_km_2010 as unknown as string),
        sum2011: (d: UmlData) =>
          op.sum(d.treeloss_km_2011 as unknown as string),
        sum2012: (d: UmlData) =>
          op.sum(d.treeloss_km_2012 as unknown as string),
        sum2013: (d: UmlData) =>
          op.sum(d.treeloss_km_2013 as unknown as string),
        sum2014: (d: UmlData) =>
          op.sum(d.treeloss_km_2014 as unknown as string),
        sum2015: (d: UmlData) =>
          op.sum(d.treeloss_km_2015 as unknown as string),
        sum2016: (d: UmlData) =>
          op.sum(d.treeloss_km_2016 as unknown as string),
        sum2017: (d: UmlData) =>
          op.sum(d.treeloss_km_2017 as unknown as string),
        sum2018: (d: UmlData) =>
          op.sum(d.treeloss_km_2018 as unknown as string),
        sum2019: (d: UmlData) =>
          op.sum(d.treeloss_km_2019 as unknown as string),
        sum2020: (d: UmlData) =>
          op.sum(d.treeloss_km_2020 as unknown as string),
        sum2021: (d: UmlData) =>
          op.sum(d.treeloss_km_2021 as unknown as string),
      })
      .rollup({
        mean2001: (d: any) => op.mean(d.sum2001),
        mean2002: (d: any) => op.mean(d.sum2002),
        mean2003: (d: any) => op.mean(d.sum2003),
        mean2004: (d: any) => op.mean(d.sum2004),
        mean2005: (d: any) => op.mean(d.sum2005),
        mean2006: (d: any) => op.mean(d.sum2006),
        mean2007: (d: any) => op.mean(d.sum2007),
        mean2008: (d: any) => op.mean(d.sum2008),
        mean2009: (d: any) => op.mean(d.sum2009),
        mean2010: (d: any) => op.mean(d.sum2010),
        mean2011: (d: any) => op.mean(d.sum2011),
        mean2012: (d: any) => op.mean(d.sum2012),
        mean2013: (d: any) => op.mean(d.sum2013),
        mean2014: (d: any) => op.mean(d.sum2014),
        mean2015: (d: any) => op.mean(d.sum2015),
        mean2016: (d: any) => op.mean(d.sum2016),
        mean2017: (d: any) => op.mean(d.sum2017),
        mean2018: (d: any) => op.mean(d.sum2018),
        mean2019: (d: any) => op.mean(d.sum2019),
        mean2020: (d: any) => op.mean(d.sum2020),
        mean2021: (d: any) => op.mean(d.sum2021),
      });

    // const ranked = brandImpacts.groupby("consumer_brand")
    //   // .filter
    //   .rollup({
    //     aferageCurrentRisk: (d: any) => op.mean(d.risk_score_current)
    //   })
    // console.log(ranked.objects().slice(0, 10));
    const t1 = performance.now();
    console.log(`Call to doSomething took ${t1 - t0} milliseconds.`);
  }
  // getCountOfMillsPerBrand(){
  //   const companies = this.companies!
  //     .join(this.uml!, ["UML ID", "UML ID"])
  //     .select
  //   .groupby("consumer_brand").count();
  // }
  getRankingOfMillsCurrentImpactScore() {}
}

const queryClient = new MillDataQuery();
export default queryClient;

function cache(key: string) {
  return function (
    _target: any,
    _propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;
    descriptor.value = function (...args: any[]) {
      if ((this as MillDataQuery).cache && (this as MillDataQuery).cache[key]) {
        return (this as MillDataQuery).cache[key];
      }

      const result = originalMethod.apply(this, args);

      if (!(this as MillDataQuery).cache) {
        (this as MillDataQuery).cache = {};
      }

      (this as MillDataQuery).cache[key] = result;

      return result;
    };

    return descriptor;
  };
}
