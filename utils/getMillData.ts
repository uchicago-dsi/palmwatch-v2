import path from "node:path";
import { all, desc, escape, loadArrow, op } from "arquero";
import type ColumnTable from "arquero/dist/types/table/column-table";
import { fullYearRangeColumns } from "@/config/years";
import type { CompanyData, UmlData } from "./dataTypes";
import { buildTreelossRollups } from "./treelossRollups.generated";

class MillDataQuery {
  companies?: ColumnTable;
  uml?: ColumnTable;
  initialized = false;
  cache: Record<string, any> = {};

  async init(basePath: string = path.join(process.cwd(), "public", "data")) {
    if (this.initialized) {
      return;
    }
    const root = basePath.replace(/\/$/, "");
    const [uml, companies] = await Promise.all([
      loadArrow(`${root}/uml.arrow`, { columns: all() }),
      loadArrow(`${root}/companies.arrow`, { columns: all() }),
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

  getBrandUsageByOwner(owner: string) {
    const data = this.uml!.filter(
      escape((d: UmlData) => d["Parent Company"] === owner)
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
    const owners = companies
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
      owners,
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
    const uniqueOwners = table.dedupe("Parent Company").count().objects() as {
      count: number;
    }[];
    const uniqueGroups = table.dedupe("Group Name").count().objects() as {
      count: number;
    }[];

    return {
      averageCurrentRisk: Math.round(averageCurrentRisk[0].mean * 100) / 100,
      uniqueMills: uniqueMills[0].count,
      uniqueCountries: uniqueCountries[0].count,
      uniqueOwners: uniqueOwners[0].count,
      uniqueGroups: uniqueGroups[0].count,
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

  getOwnerStats(owner: string) {
    const ownerMills = this.uml!.filter(
      escape((d: UmlData) => d["Parent Company"] === owner)
    ).dedupe("UML ID");
    return this.getSummaryStats(ownerMills);
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
      // @ts-expect-error
      .objects()[0].totlaForestLoss;
    return {
      ...summaryStats,
      brandUsage: brandUsage.objects(),
      mills: data.objects(),
      timeseries,
      totalForestLoss,
    };
  }
  getOwnerData(owner: string) {
    const ownerMills = this.uml!.filter(
      escape((d: UmlData) => d["Parent Company"] === owner)
    ).dedupe("UML ID");
    return this.getFullData(ownerMills);
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
      const year = Number.parseInt(colParts.at(-1) || "0");
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
  getOwnerInfo(
    owner: string,
    cols: string[],
    quantiles: number[] = [0.25, 0.5, 0.75]
  ) {
    const ownerMills = this.uml!.filter(
      escape((d: UmlData) => d["Parent Company"] === owner)
    )
      .groupby("UML ID")
      .dedupe("UML ID");

    const quantileResults = this.getQuantileTimeseries(
      ownerMills,
      cols,
      quantiles
    );
    const brands = ownerMills
      .join(this.companies!, ["UML ID", "UML ID"])
      .groupby("consumer_brand")
      .derive({
        count: () => op.count(),
      })
      .dedupe("consumer_brand")
      .select(["consumer_brand", "count"])
      .orderby(desc("count"))
      .objects();
    return {
      umlInfo: ownerMills.objects(),
      timeseries: quantileResults,
      brands,
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

  /** Build-time export for precomputed JSON (Node only). */
  getCompaniesObjects() {
    return this.companies!.objects() as CompanyData[];
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
      href: `/owner/${d["Parent Company"]}`,
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
      "Mill Owners": comapniesList,
      "Mill Groups": groupsList,
      Countries: countryList,
    } as const;

    this.cache["searchList"] = result;

    return result;
  }

  // utils
  filterUniqueList(v: any, i: number, a: any[]) {
    return a.indexOf(v) === i;
  }
  filterUniqueByKey = (key: string) => (v: any, i: number, a: any[]) =>
    a.findIndex((d) => d[key] === v[key]) === i;
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
    // @ts-expect-error
    const rspoCertified = uniqueCounts.millCount - notRspoCertified.count;
    return {
      ...millStats,
      ...uniqueCounts,
      notRspoCertified: notRspoCertified.count,
      rspoCertified,
      timeseries,
    };
  }

  @cache("countrySummaryStats")
  getCountriesSummary() {
    const countryStats = this.uml!.groupby("Country")
      .rollup({
        count: () => op.count(),
        totalForestLoss: (d: UmlData) =>
          op.round(op.sum(d.sum_of_treeloss_km as any) * 100) / 100,
        totalArea: (d: UmlData) =>
          op.round(op.sum(d.km_area as any) * 100) / 100,
        totalForestArea: (d: UmlData) =>
          op.round(op.sum(d.km_forest_area_00 as any) * 100) / 100,
        pctForestLoss: (d: UmlData) =>
          op.round(
            (op.sum(d.sum_of_treeloss_km as any) /
              op.sum(d.km_forest_area_00 as any)) *
              1000
          ) / 10,
        pctForestLossString: (d: UmlData) =>
          `${op.round((op.sum(d.sum_of_treeloss_km as any) / op.sum(d.km_forest_area_00 as any)) * 1000) / 10} %`,
        currentRisk: (d: UmlData) =>
          op.round(op.mean(d.risk_score_current) * 100) / 100,
        futureRisk: (d: UmlData) =>
          op.round(op.mean(d.risk_score_future) * 100) / 100,
        pastRisk: (d: UmlData) =>
          op.round(op.mean(d.risk_score_past) * 100) / 100,
      })
      .orderby(desc("count"))
      .objects();
    return {
      countryStats,
    };
  }

  getRankingOfMillsCurrentImpactScore() {}

  rollups = buildTreelossRollups();
}

const queryClient = new MillDataQuery();
export default queryClient;

function cache(key: string) {
  return (
    _target: any,
    _propertyKey: string,
    descriptor: PropertyDescriptor
  ) => {
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
