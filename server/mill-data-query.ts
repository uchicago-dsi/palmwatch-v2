import path from "node:path";
import { all, escape as aqEscape, desc, loadArrow, op } from "arquero";
import type ColumnTable from "arquero/dist/types/table/column-table";
import { fullYearRangeColumns, maxYear } from "@/config/years";
import type { CompanyData, UmlData } from "@/domain";
import type { BrandUsageRow } from "@/domain/brand-usage";
import type {
  CountryStatRow,
  ForestLossYearPoint,
} from "@/domain/schemas/aggregates";
import { arqueroObjects, umlRowNumber } from "@/lib/data-row";
import type { LossTimeseriesRow } from "@/lib/rename-output-columns";
import type {
  BrandInfoPayload,
  BrandOwnerRollup,
  CountriesSummaryPayload,
  GroupInfoPayload,
  MedianMillRow,
  MillSummaryStats,
  MillSummaryStatsPayload,
  OwnerBrandRollup,
  OwnerInfoPayload,
  RankingBrandRow,
  RollupEntityPayload,
  SearchListPayload,
  UniqueCounts,
} from "./mill-data-query-types";
import { buildTreelossRollups } from "./treeloss-rollups.generated";

export type {
  BrandInfoPayload,
  BrandOwnerRollup,
  CountriesSummaryPayload,
  GroupInfoPayload,
  MedianMillRow,
  MillSummaryStats,
  MillSummaryStatsPayload,
  OwnerBrandRollup,
  OwnerInfoPayload,
  RankingBrandRow,
  RollupEntityPayload,
  SearchListPayload,
  UniqueCounts,
} from "./mill-data-query-types";

const TRAILING_SLASH_REGEX = /\/$/;
const TREELOSS_KM_YEAR_REGEX = /^treeloss_km_\d{4}$/;

/** Arquero `op.sum` can yield null when a column is missing or all-null. */
function asFiniteNumber(value: unknown): number {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

class MillDataQuery {
  companies?: ColumnTable;
  uml?: ColumnTable;
  initialized = false;
  cache: Record<string, unknown> = {};

  private requireUml(): ColumnTable {
    if (!this.uml) {
      throw new Error(
        "MillDataQuery.init() must be called before accessing UML data"
      );
    }
    return this.uml;
  }

  private requireCompanies(): ColumnTable {
    if (!this.companies) {
      throw new Error(
        "MillDataQuery.init() must be called before accessing company data"
      );
    }
    return this.companies;
  }

  async init(basePath: string = path.join(process.cwd(), "public", "data")) {
    if (this.initialized) {
      return;
    }
    const root = basePath.replace(TRAILING_SLASH_REGEX, "");
    const [uml, companies] = await Promise.all([
      loadArrow(`${root}/uml.arrow`, { columns: all() }),
      loadArrow(`${root}/companies.arrow`, { columns: all() }),
    ]);

    this.uml = uml;
    this.companies = companies;
    this.initialized = true;
  }

  getMillName(name: string) {
    return this.uml?.filter(aqEscape((d: UmlData) => d["Mill Name"] === name));
  }

  getUml(umlId: string) {
    return this.uml?.filter(aqEscape((d: UmlData) => d["UML ID"] === umlId));
  }
  getBrandUsage(table: ColumnTable) {
    return table
      .orderby("report_year")
      .groupby("consumer_brand")
      .derive({
        years: (d: CompanyData) => op.array_agg_distinct(d.report_year),
      })
      .select("consumer_brand", "years")
      .dedupe("consumer_brand");
  }

  getBrandUsageByUml(umlId: string): BrandUsageRow[] {
    const data = this.requireCompanies().filter(
      aqEscape((d: CompanyData) => d["UML ID"] === umlId)
    );
    return arqueroObjects<BrandUsageRow>(this.getBrandUsage(data));
  }

  getBrandUsageByOwner(owner: string): BrandUsageRow[] {
    const data = this.requireUml()
      .filter(aqEscape((d: UmlData) => d["Parent Company"] === owner))
      .join(this.requireCompanies(), ["UML ID", "UML ID"]);
    return arqueroObjects<BrandUsageRow>(this.getBrandUsage(data));
  }

  getBrandInfo(
    brand: string,
    cols: string[],
    quantiles: number[] = [0.25, 0.5, 0.75]
  ): BrandInfoPayload {
    const companies = this.requireCompanies()
      .filter(aqEscape((d: CompanyData) => d.consumer_brand === brand))
      .groupby("UML ID")
      .derive({
        years: (d: CompanyData) => op.array_agg_distinct(d.report_year),
      })
      .select("UML ID", "years")
      .dedupe("UML ID")
      .join(this.requireUml(), ["UML ID", "UML ID"]);

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
      .orderby(desc("count"));
    return {
      umlInfo: arqueroObjects<UmlData>(companies),
      timeseries: quantileResults,
      owners: arqueroObjects<BrandOwnerRollup>(owners),
    };
  }

  getSummaryStats(table: ColumnTable): MillSummaryStats {
    const averageCurrentRisk = table
      .rollup({
        mean: (d: UmlData) => op.mean(d.risk_score_current),
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
  getBrandStats(brand: string): MillSummaryStats {
    const companyMills = this.requireCompanies()
      .select(["consumer_brand", "UML ID"])
      .filter(aqEscape((d: CompanyData) => d.consumer_brand === brand))
      .select("UML ID")
      .dedupe("UML ID")
      .join(this.requireUml(), ["UML ID", "UML ID"]);

    return this.getSummaryStats(companyMills);
  }

  getOwnerStats(owner: string): MillSummaryStats {
    const ownerMills = this.requireUml()
      .filter(aqEscape((d: UmlData) => d["Parent Company"] === owner))
      .dedupe("UML ID");
    return this.getSummaryStats(ownerMills);
  }
  getFullData(data: ColumnTable): RollupEntityPayload {
    const joinedData = data
      .select("UML ID")
      .join_right(this.requireCompanies(), ["UML ID", "UML ID"]);

    const summaryStats = this.getSummaryStats(data);
    const brandUsage = this.getBrandUsage(joinedData);
    const timeseries = this.getQuantileTimeseries(data);
    const forestLossRows = arqueroObjects<{ totlaForestLoss: number }>(
      data.dedupe("UML ID").rollup({
        totlaForestLoss: () => op.sum("sum_of_treeloss_km"),
      })
    );
    const totlaForestLoss = asFiniteNumber(forestLossRows[0]?.totlaForestLoss);
    return {
      ...summaryStats,
      brandUsage: arqueroObjects<BrandUsageRow>(brandUsage),
      mills: arqueroObjects<UmlData>(data),
      timeseries,
      totalForestLoss: totlaForestLoss,
    };
  }
  getOwnerData(owner: string): RollupEntityPayload {
    const ownerMills = this.requireUml()
      .filter(aqEscape((d: UmlData) => d["Parent Company"] === owner))
      .dedupe("UML ID");
    return this.getFullData(ownerMills);
  }

  getGroupData(group: string): RollupEntityPayload {
    const groupMills = this.requireUml()
      .filter(aqEscape((d: UmlData) => d["Group Name"] === group))
      .dedupe("UML ID");
    return this.getFullData(groupMills);
  }
  getCountryData(country: string): RollupEntityPayload {
    const groupMills = this.requireUml()
      .filter(aqEscape((d: UmlData) => d.Country === country))
      .dedupe("UML ID");
    return this.getFullData(groupMills);
  }

  getQuantileTimeseries(
    data: ColumnTable,
    cols: string[] = fullYearRangeColumns,
    quantiles: number[] = [0.25, 0.5, 0.75]
  ): LossTimeseriesRow[] {
    const quantileResults: LossTimeseriesRow[] = [];
    for (const col of cols) {
      const colParts = col.split("_");
      const year = Number.parseInt(colParts.at(-1) || "0", 10);
      const quantileRollup: Record<string, ReturnType<typeof op.quantile>> = {};
      for (const q of quantiles) {
        quantileRollup[`q${q}`] = op.quantile(col, q);
      }
      const rollupRow = arqueroObjects<Record<string, number>>(
        data.select(col).rollup(quantileRollup)
      )[0];
      quantileResults.push({
        ...(rollupRow as Pick<LossTimeseriesRow, "q0.25" | "q0.5" | "q0.75">),
        year,
      });
    }
    return quantileResults;
  }

  /** Per-year sum of `treeloss_km_*` across deduped mills, plus running cumulative. */
  getForestLossByYear(): ForestLossYearPoint[] {
    const mills = arqueroObjects<UmlData>(this.requireUml().dedupe("UML ID"));
    if (mills.length === 0) {
      return [];
    }

    const years = Object.keys(mills[0])
      .filter((key) => TREELOSS_KM_YEAR_REGEX.test(key))
      .map((key) => Number.parseInt(key.replace("treeloss_km_", ""), 10))
      .sort((a, b) => a - b);

    let cumulativeKm2 = 0;
    return years.map((year) => {
      const column = `treeloss_km_${year}` as keyof UmlData;
      const annualKm2 = mills.reduce(
        (sum, mill) => sum + (Number(mill[column]) || 0),
        0
      );
      cumulativeKm2 += annualKm2;
      return {
        year,
        annualKm2: Math.round(annualKm2 * 100) / 100,
        cumulativeKm2: Math.round(cumulativeKm2 * 100) / 100,
      };
    });
  }

  getOwnerInfo(
    owner: string,
    cols: string[],
    quantiles: number[] = [0.25, 0.5, 0.75]
  ): OwnerInfoPayload {
    const ownerMills = this.requireUml()
      .filter(aqEscape((d: UmlData) => d["Parent Company"] === owner))
      .groupby("UML ID")
      .dedupe("UML ID");

    const quantileResults = this.getQuantileTimeseries(
      ownerMills,
      cols,
      quantiles
    );
    const brands = ownerMills
      .join(this.requireCompanies(), ["UML ID", "UML ID"])
      .groupby("consumer_brand")
      .derive({
        count: () => op.count(),
      })
      .dedupe("consumer_brand")
      .select(["consumer_brand", "count"])
      .orderby(desc("count"));
    return {
      umlInfo: arqueroObjects<UmlData>(ownerMills),
      timeseries: quantileResults,
      brands: arqueroObjects<OwnerBrandRollup>(brands),
    };
  }

  getGroupInfo(
    group: string,
    cols: string[],
    quantiles: number[] = [0.25, 0.5, 0.75]
  ): GroupInfoPayload {
    const data = this.requireUml()
      .filter(aqEscape((d: UmlData) => d["Group Name"] === group))
      .groupby("UML ID")
      .dedupe("UML ID");

    const quantileResults = this.getQuantileTimeseries(data, cols, quantiles);
    return {
      umlInfo: arqueroObjects<UmlData>(data),
      timeseries: quantileResults,
    };
  }
  getDataInBbox(
    minLat: number,
    minLng: number,
    maxLat: number,
    maxLng: number
  ): RollupEntityPayload {
    const mills = this.getMillsInBbox(minLat, minLng, maxLat, maxLng);
    return this.getFullData(mills);
  }
  getMillsInBbox(
    minLat: number,
    minLng: number,
    maxLat: number,
    maxLng: number
  ) {
    return this.requireUml().filter(
      aqEscape((d: UmlData) => {
        const millLat = +d.Latitude;
        const millLng = +d.Longitude;
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
    return this.requireUml();
  }

  /** Build-time export for precomputed JSON (Node only). */
  getCompaniesObjects(): CompanyData[] {
    if (!this.companies) {
      return [];
    }
    return arqueroObjects<CompanyData>(this.companies);
  }

  @cache("searchList")
  getSearchList(): SearchListPayload {
    const companyData = this.companies
      ? arqueroObjects<CompanyData>(
          this.companies.select("consumer_brand").dedupe("consumer_brand")
        )
      : [];
    const brandList: { label: string; href: string; imgPath?: string }[] =
      companyData.map((d) => ({
        label: d.consumer_brand,
        href: `/brand/${encodeURIComponent(d.consumer_brand)}`,
      }));

    const umlData = this.uml
      ? arqueroObjects<UmlData>(
          this.uml.select(["UML ID", "Mill Name"]).dedupe("UML ID")
        )
      : [];
    const millList: { label: string; href: string }[] = umlData.map((d) => ({
      label: d["Mill Name"],
      href: `/mill/${d["UML ID"]}`,
    }));

    const groups = this.uml
      ? arqueroObjects<UmlData>(
          this.uml.select("Group Name").dedupe("Group Name")
        )
      : [];
    const groupsList = groups.map((d) => ({
      label: d["Group Name"],
      href: `/group/${encodeURIComponent(d["Group Name"])}`,
    }));

    const companies = this.uml
      ? arqueroObjects<UmlData>(
          this.uml.select("Parent Company").dedupe("Parent Company")
        )
      : [];

    const comapniesList = companies
      .filter((d) => d["Parent Company"]?.trim())
      .map((d) => ({
        label: d["Parent Company"] || "",
        href: `/owner/${encodeURIComponent(d["Parent Company"] || "")}`,
      }));

    const countries = this.uml
      ? arqueroObjects<UmlData>(this.uml.select("Country").dedupe("Country"))
      : [];

    const countryList = countries.map((d) => ({
      label: d.Country,
      href: `/country/${encodeURIComponent(d.Country)}`,
    }));

    const result: SearchListPayload = {
      Brands: brandList,
      Mills: millList,
      "Mill Owners": comapniesList,
      "Mill Groups": groupsList,
      Countries: countryList,
    };

    this.cache.searchList = result;

    return result;
  }

  // utils
  filterUniqueList<T>(v: T, i: number, a: T[]) {
    return a.indexOf(v) === i;
  }
  filterUniqueByKey =
    (key: string) =>
    (v: Record<string, unknown>, i: number, a: Record<string, unknown>[]) =>
      a.findIndex((d) => d[key] === v[key]) === i;
  sortObject(data: { [key: string]: number[] }, key: string) {
    return Object.entries(data)
      .sort(([_k, v]) => v.length)
      .map(([k, v]) => ({ [key]: k, years: v.sort((a, b) => a - b) }));
  }
  stringifyBigInts(obj: object | object[]) {
    return JSON.parse(
      JSON.stringify(obj, (_key, value) => {
        if (typeof value === "bigint") {
          return value.toString();
        }
        return value;
      })
    );
  }

  @cache("medianMill")
  getMedianMill(): MedianMillRow[] {
    const uml = this.requireUml().rollup(this.rollups.medianAllYears);
    return arqueroObjects<MedianMillRow>(uml);
  }

  @cache("getUniqueCounts")
  getUniqueCounts(): UniqueCounts {
    const brandCount = this.requireCompanies()
      .select("consumer_brand")
      .dedupe("consumer_brand")
      .count()
      .objects()[0];
    const countryCount = this.requireUml()
      .select("Country")
      .dedupe("Country")
      .count()
      .objects()[0];
    const millCount = this.requireUml().count().objects()[0];
    const groupCount = this.requireUml()
      .select("Group Name")
      .dedupe("Group Name")
      .count()
      .objects()[0];
    const companyCount = this.requireUml()
      .select("Parent Company")
      .dedupe("Parent Company")
      .count()
      .objects()[0];

    return {
      brandCount:
        brandCount && "count" in brandCount
          ? (brandCount.count as number)
          : null,
      countryCount:
        countryCount && "count" in countryCount
          ? (countryCount.count as number)
          : null,
      millCount:
        millCount && "count" in millCount ? (millCount.count as number) : null,
      groupCount:
        groupCount && "count" in groupCount
          ? (groupCount.count as number)
          : null,
      companyCount:
        companyCount && "count" in companyCount
          ? (companyCount.count as number)
          : null,
    };
  }

  @cache("getMedianBrandImpacts")
  getMedianBrandImpacts() {
    const brandImpacts = this.requireCompanies().join(this.requireUml(), [
      "UML ID",
      "UML ID",
    ]);

    const _grouped = brandImpacts
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
  getRankingOfBrandsByCurrentImpactScore(): RankingBrandRow[] {
    const brandImpacts = this.requireCompanies().join(this.requireUml(), [
      "UML ID",
      "UML ID",
    ]);
    const grouped = brandImpacts
      .derive({
        _treelossMinToMax: aqEscape((d: UmlData) =>
          fullYearRangeColumns.reduce(
            (s: number, col: string) => s + umlRowNumber(d, col),
            0
          )
        ),
      })
      .dedupe("consumer_brand", "UML ID")
      .groupby("consumer_brand")
      .rollup({
        averageCurrentRisk: (d: UmlData) =>
          op.round(op.mean(d.risk_score_current) * 100) / 100,
        averageFutureRisk: (d: UmlData) =>
          op.round(op.mean(d.risk_score_future) * 100) / 100,
        averagePastRisk: (d: UmlData) =>
          op.round(op.mean(d.risk_score_past) * 100) / 100,
        totalForestLoss: () => op.round(op.sum("_treelossMinToMax")),
        millCount: () => op.count(),
      })
      .orderby(desc("averageCurrentRisk"));
    return arqueroObjects<RankingBrandRow>(grouped).map((row) => ({
      ...row,
      totalForestLoss: asFiniteNumber(row.totalForestLoss),
    }));
  }
  @cache("millSummaryStats")
  getMillSummaryStats(): MillSummaryStatsPayload {
    const millStatsRaw = this.requireUml()
      .dedupe("UML ID")
      .rollup({
        count: () => op.count(),
        totalForestLoss: () => op.sum("sum_of_treeloss_km"),
        totalArea: () => op.sum("km_area"),
        totalForestArea: () => op.sum("km_forest_area_00"),
      })
      .objects()[0] as {
      count: number;
      totalForestLoss: number | null;
      totalArea: number | null;
      totalForestArea: number | null;
    };
    const millStats = {
      count: millStatsRaw.count,
      totalForestLoss: asFiniteNumber(millStatsRaw.totalForestLoss),
      totalArea: asFiniteNumber(millStatsRaw.totalArea),
      totalForestArea: asFiniteNumber(millStatsRaw.totalForestArea),
    };
    const timeseries = this.getQuantileTimeseries(this.requireUml());
    const forestLossByYear = this.getForestLossByYear();
    const uniqueCounts = this.getUniqueCounts();

    const notRspoCertified = this.requireUml()
      .filter(
        aqEscape((d: UmlData) => d["RSPO Status"] === "Not RSPO Certified")
      )
      .rollup({
        count: () => op.count(),
      })
      .objects()[0] as { count: number };
    const rspoCertified =
      (uniqueCounts.millCount ?? 0) - notRspoCertified.count;
    return {
      ...millStats,
      ...uniqueCounts,
      notRspoCertified: notRspoCertified.count,
      rspoCertified,
      timeseries,
      forestLossByYear,
    };
  }

  @cache("countrySummaryStats")
  getCountriesSummary(): CountriesSummaryPayload {
    const allYearColumns = Array.from(
      { length: maxYear - 2001 + 1 },
      (_, i) => `treeloss_km_${2001 + i}`
    );

    const countryStats = this.requireUml()
      .derive({
        _treeloss2001ToMax: aqEscape((d: UmlData) =>
          allYearColumns.reduce(
            (s: number, col: string) => s + umlRowNumber(d, col),
            0
          )
        ),
      })
      .groupby("Country")
      .rollup({
        count: () => op.count(),
        totalForestLoss: () =>
          op.round(op.sum("_treeloss2001ToMax") * 100) / 100,
        totalArea: () => op.round(op.sum("km_area") * 100) / 100,
        totalForestArea: () =>
          op.round(op.sum("km_forest_area_00") * 100) / 100,
        pctForestLoss: () =>
          op.round(
            (op.sum("_treeloss2001ToMax") / op.sum("km_forest_area_00")) * 1000
          ) / 10,
        pctForestLossString: () =>
          `${op.round((op.sum("_treeloss2001ToMax") / op.sum("km_forest_area_00")) * 1000) / 10} %`,
        currentRisk: (d: UmlData) =>
          op.round(op.mean(d.risk_score_current) * 100) / 100,
        futureRisk: (d: UmlData) =>
          op.round(op.mean(d.risk_score_future) * 100) / 100,
        pastRisk: (d: UmlData) =>
          op.round(op.mean(d.risk_score_past) * 100) / 100,
      })
      .orderby(desc("count"));
    return {
      countryStats: arqueroObjects<CountryStatRow>(countryStats).map((row) => ({
        ...row,
        totalForestLoss: asFiniteNumber(row.totalForestLoss),
        totalArea: asFiniteNumber(row.totalArea),
        totalForestArea: asFiniteNumber(row.totalForestArea),
        pctForestLoss: asFiniteNumber(row.pctForestLoss),
      })),
    };
  }

  getRankingOfMillsCurrentImpactScore() {
    /* Reserved for future mill ranking API. */
  }

  rollups = buildTreelossRollups();
}

const queryClient = new MillDataQuery();
export default queryClient;

function cache(key: string) {
  return (
    _target: object,
    _propertyKey: string,
    descriptor: PropertyDescriptor
  ) => {
    const originalMethod = descriptor.value as (...args: unknown[]) => unknown;
    descriptor.value = function (this: MillDataQuery, ...args: unknown[]) {
      if ((this as MillDataQuery).cache?.[key]) {
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
