import { load, loadArrow, all, desc, op, table, escape } from "arquero";
import ColumnTable from "arquero/dist/types/table/column-table";
import { CompanyData, UmlData } from "./dataTypes";
import { fullYearRange, fullYearRangeColumns } from "@/config/years";
import Column from "arquero/dist/types/table/column";
import { constants } from "fs/promises";

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
  getBrandUsage(table: ColumnTable) {
    return table
      .orderby("report_year")
      .groupby("consumer_brand")
      .derive({
        years: (d: CompanyData) => op.array_agg_distinct(d["report_year"]),
      })
      .select("consumer_brand", "years")
      .dedupe("consumer_brand");
  }

  getBrandUsageByUml(umlId: string) {
    const data = this.companies!.filter(
      escape((d: CompanyData) => d["UML ID"] === umlId)
    );
    return this.getBrandUsage(data).objects();
  }

  getBrandUsageBySupplier(supplier: string) {
    const data = this.uml!.filter(
      escape((d: UmlData) => d["Parent Company"] === supplier)
    ).join(this.companies!, ["UML ID", "UML ID"]);
    return this.getBrandUsage(data).objects();
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

    const quantileResults = this.getQuantileTimeseries(
      companies,
      cols,
      quantiles
    );
    const suppliers = companies
      .groupby("Parent Company")
      .derive({
        count: () => op.count(),
      })
      .dedupe("Parent Company")
      .select(["Parent Company", "Country", "count"])
      .orderby(desc("count"))
      .objects();
    return {
      umlInfo: companies.objects(),
      timeseries: quantileResults,
      suppliers,
    };
  }

  getSummaryStats(table: ColumnTable) {
    const averageCurrentRisk = table
      .rollup({
        mean: (d: UmlData) => op.mean(d["risk_score_current"]),
      })
      .objects() as { mean: number }[];
    const uniqueMills = table.count().objects() as { count: number }[];
    const uniqueCountries = table.dedupe("Country").count().objects() as {
      count: number;
    }[];
    const uniqueSuppliers = table.dedupe("Group Name").count().objects() as {
      count: number;
    }[];

    return {
      averageCurrentRisk: Math.round(averageCurrentRisk[0].mean * 100) / 100,
      uniqueMills: uniqueMills[0].count,
      uniqueCountries: uniqueCountries[0].count,
      uniqueSuppliers: uniqueSuppliers[0].count,
    };
  }
  getBrandStats(brand: string) {
    const companyMills = this.companies!.select(["consumer_brand", "UML ID"])
      .filter(escape((d: CompanyData) => d["consumer_brand"] === brand))
      .select("UML ID")
      .dedupe("UML ID")
      .join(this.uml!, ["UML ID", "UML ID"]);

    return this.getSummaryStats(companyMills);
  }

  getSupplierStats(supplier: string) {
    const supplierMills = this.uml!.filter(
      escape((d: UmlData) => d["Parent Company"] === supplier)
    ).dedupe("UML ID");
    return this.getSummaryStats(supplierMills);
  }
  getFullData(data: ColumnTable) {
    const joinedData = data
      .select("UML ID")
      .join_right(this.companies!, ["UML ID", "UML ID"]);

    const summaryStats = this.getSummaryStats(data);
    const brandUsage = this.getBrandUsage(joinedData);
    const timeseries = this.getQuantileTimeseries(data);
    const totalForestLoss = data
      .dedupe("UML ID")
      .rollup({
        totlaForestLoss: (d: UmlData) => op.sum(d.sum_of_treeloss_km as any),
      })
      // @ts-ignore
      .objects()[0].totlaForestLoss;
    return {
      ...summaryStats,
      brandUsage: brandUsage.objects(),
      mills: data.objects(),
      timeseries,
      totalForestLoss,
    };
  }
  getSupplierData(supplier: string) {
    const supplierMills = this.uml!.filter(
      escape((d: UmlData) => d["Parent Company"] === supplier)
    ).dedupe("UML ID");
    return this.getFullData(supplierMills);
  }

  getGroupData(group: string) {
    const groupMills = this.uml!.filter(
      escape((d: UmlData) => d["Group Name"] === group)
    ).dedupe("UML ID");
    return this.getFullData(groupMills);
  }
  getCountryData(country: string) {
    const groupMills = this.uml!.filter(
      escape((d: UmlData) => d["Country"] === country)
    ).dedupe("UML ID");
    return this.getFullData(groupMills);
  }

  getQuantileTimeseries(
    data: ColumnTable,
    cols: string[] = fullYearRangeColumns,
    quantiles: number[] = [0.25, 0.5, 0.75]
  ) {
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
    return quantileResults;
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

    const quantileResults = this.getQuantileTimeseries(data, cols, quantiles);
    return {
      umlInfo: data.objects(),
      timeseries: quantileResults,
    };
  }
  getDataInBbox(
    minLat: number,
    minLng: number,
    maxLat: number,
    maxLng: number
  ) {
    const mills = this.getMillsInBbox(minLat, minLng, maxLat, maxLng);
    return this.getFullData(mills);
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

    const groups = this.uml!.select("Group Name")
      .dedupe("Group Name")
      .objects() as UmlData[];
    const groupsList = groups.map((d) => ({
      label: d["Group Name"],
      href: `/group/${d["Group Name"]}`,
    }));

    const companies = this.uml!.select("Parent Company")
      .dedupe("Parent Company")
      .objects() as UmlData[];

    const comapniesList = companies.map((d) => ({
      label: d["Parent Company"] || "",
      href: `/supplier/${d["Parent Company"]}`,
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
      Suppliers: comapniesList,
      Groups: groupsList,
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

  @cache("medianMill")
  getMedianMill() {
    const t0 = performance.now();
    const uml = this.uml!.rollup(this.rollups.medianAllYears);
    return uml.objects();
  }

  @cache("getUniqueCounts")
  getUniqueCounts() {
    const brandCount = this.companies!.select("consumer_brand")
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
    const companyCount = this.uml!.select("Parent Company")
      .dedupe("Parent Company")
      .count()
      .objects()[0];

    return {
      brandCount:
        "count" in brandCount ? (brandCount["count"] as number) : null,
      countryCount:
        "count" in countryCount ? (countryCount["count"] as number) : null,
      millCount: "count" in millCount ? (millCount["count"] as number) : null,
      groupCount:
        "count" in groupCount ? (groupCount["count"] as number) : null,
      companyCount:
        "count" in companyCount ? (companyCount["count"] as number) : null,
    };
  }

  @cache("getMedianBrandImpacts")
  getMedianBrandImpacts() {
    const brandImpacts = this.companies!.join(this.uml!, ["UML ID", "UML ID"]);

    const grouped = brandImpacts
      .dedupe("consumer_brand", "UML ID")
      .groupby(["consumer_brand", "UML ID"])
      .rollup(this.rollups.sumAllYears)
      .rollup(this.rollups.meanAllSums);

    // const ranked = brandImpacts.groupby("consumer_brand")
    //   // .filter
    //   .rollup({
    //     aferageCurrentRisk: (d: any) => op.mean(d.risk_score_current)
    //   })
    // console.log(ranked.objects().slice(0, 10));
  }
  getRankingOfBrandsByCurrentImpactScore() {
    const brandImpacts = this.companies!.join(this.uml!, ["UML ID", "UML ID"]);
    const grouped = brandImpacts
      .dedupe("consumer_brand", "UML ID")
      .groupby("consumer_brand")
      .rollup({
        averageCurrentRisk: (d: UmlData) =>
          op.round(op.mean(d.risk_score_current) * 100) / 100,
        averageFutureRisk: (d: UmlData) =>
          op.round(op.mean(d.risk_score_future) * 100) / 100,
        averagePastRisk: (d: UmlData) =>
          op.round(op.mean(d.risk_score_past) * 100) / 100,
        totalForestLoss: (d: UmlData) =>
          op.round(op.sum(d.sum_of_treeloss_km as any)),
      })
      .orderby(desc("averageCurrentRisk"));
    return grouped.objects();
  }
  @cache("millSummaryStats")
  getMillSummaryStats() {
    const millStats = this.uml!.dedupe("UML ID")
      .rollup({
        count: () => op.count(),
        totalForestLoss: (d: UmlData) => op.sum(d.sum_of_treeloss_km as any),
        totalArea: (d: UmlData) => op.sum(d.km_area as any),
        totalForestArea: (d: UmlData) => op.sum(d.km_forest_area_00 as any),
      })
      .objects()[0] as {
      count: number;
      totalForestLoss: number;
      totalArea: number;
      totalForestArea: number;
    };
    const timeseries = this.getQuantileTimeseries(this.uml!);
    const uniqueCounts = this.getUniqueCounts();

    const notRspoCertified = this.uml!.filter(
      escape((d: UmlData) => d["RSPO Status"] === "Not RSPO Certified")
    )
      .rollup({
        count: () => op.count(),
      })
      .objects()[0] as { count: number };
    // @ts-ignore
    const rspoCertified = uniqueCounts.millCount - notRspoCertified.count;
    return {
      ...millStats,
      ...uniqueCounts,
      notRspoCertified: notRspoCertified.count,
      rspoCertified,
      timeseries,
    };
  }
  getRankingOfMillsCurrentImpactScore() {}

  rollups = {
    sumAllYears: {
      sum2001: (d: any) => op.sum(d.treeloss_km_2001),
      sum2002: (d: any) => op.sum(d.treeloss_km_2002),
      sum2003: (d: any) => op.sum(d.treeloss_km_2003),
      sum2004: (d: any) => op.sum(d.treeloss_km_2004),
      sum2005: (d: any) => op.sum(d.treeloss_km_2005),
      sum2006: (d: any) => op.sum(d.treeloss_km_2006),
      sum2007: (d: any) => op.sum(d.treeloss_km_2007),
      sum2008: (d: any) => op.sum(d.treeloss_km_2008),
      sum2009: (d: any) => op.sum(d.treeloss_km_2009),
      sum2010: (d: any) => op.sum(d.treeloss_km_2010),
      sum2011: (d: any) => op.sum(d.treeloss_km_2011),
      sum2012: (d: any) => op.sum(d.treeloss_km_2012),
      sum2013: (d: any) => op.sum(d.treeloss_km_2013),
      sum2014: (d: any) => op.sum(d.treeloss_km_2014),
      sum2015: (d: any) => op.sum(d.treeloss_km_2015),
      sum2016: (d: any) => op.sum(d.treeloss_km_2016),
      sum2017: (d: any) => op.sum(d.treeloss_km_2017),
      sum2018: (d: any) => op.sum(d.treeloss_km_2018),
      sum2019: (d: any) => op.sum(d.treeloss_km_2019),
      sum2020: (d: any) => op.sum(d.treeloss_km_2020),
      sum2021: (d: any) => op.sum(d.treeloss_km_2021),
      sum2022: (d: any) => op.sum(d.treeloss_km_2022),
    },
    medianAllYears: {
      median2001: (d: any) => op.median(d.treeloss_km_2001),
      median2002: (d: any) => op.median(d.treeloss_km_2002),
      median2003: (d: any) => op.median(d.treeloss_km_2003),
      median2004: (d: any) => op.median(d.treeloss_km_2004),
      median2005: (d: any) => op.median(d.treeloss_km_2005),
      median2006: (d: any) => op.median(d.treeloss_km_2006),
      median2007: (d: any) => op.median(d.treeloss_km_2007),
      median2008: (d: any) => op.median(d.treeloss_km_2008),
      median2009: (d: any) => op.median(d.treeloss_km_2009),
      median2010: (d: any) => op.median(d.treeloss_km_2010),
      median2011: (d: any) => op.median(d.treeloss_km_2011),
      median2012: (d: any) => op.median(d.treeloss_km_2012),
      median2013: (d: any) => op.median(d.treeloss_km_2013),
      median2014: (d: any) => op.median(d.treeloss_km_2014),
      median2015: (d: any) => op.median(d.treeloss_km_2015),
      median2016: (d: any) => op.median(d.treeloss_km_2016),
      median2017: (d: any) => op.median(d.treeloss_km_2017),
      median2018: (d: any) => op.median(d.treeloss_km_2018),
      median2019: (d: any) => op.median(d.treeloss_km_2019),
      median2020: (d: any) => op.median(d.treeloss_km_2020),
      median2021: (d: any) => op.median(d.treeloss_km_2021),
      median2022: (d: any) => op.median(d.treeloss_km_2022),
    },
    meanAllSums: {
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
      mean2022: (d: any) => op.mean(d.sum2022),
    },
  };
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
