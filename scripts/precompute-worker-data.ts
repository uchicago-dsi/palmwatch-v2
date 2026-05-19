/**
 * Node-only: loads Arquero + mill data, writes `public/data/precomputed/**` JSON
 * so Cloudflare Workers never execute Arquero at request time.
 */

import { mkdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fullYearRangeColumns } from "../config/years";
import { stringifyForPrecompute } from "../lib/json-big-int";
import { precomputedSlug } from "../lib/precomputed-slug";
import queryClient from "../server/mill-data-query";

const ROOT = process.cwd();
const DATA_DIR = path.join(ROOT, "public", "data");
const OUT = path.join(DATA_DIR, "precomputed");
const ROWS_PER_SHARD = 400;

async function writeJson(rel: string, data: unknown) {
  const fp = path.join(OUT, rel);
  await mkdir(path.dirname(fp), { recursive: true });
  await writeFile(fp, stringifyForPrecompute(data), "utf8");
}

async function main() {
  await rm(OUT, { recursive: true, force: true });
  await mkdir(OUT, { recursive: true });

  await queryClient.init(DATA_DIR);

  const searchList = queryClient.getSearchList();
  await writeJson("search-list.json", searchList);

  await writeJson(
    "aggregates/mill-summary-stats.json",
    queryClient.getMillSummaryStats()
  );
  await writeJson(
    "aggregates/countries-summary.json",
    queryClient.getCountriesSummary()
  );
  await writeJson(
    "aggregates/ranking-brands.json",
    queryClient.getRankingOfBrandsByCurrentImpactScore()
  );
  await writeJson("aggregates/median-mill.json", queryClient.getMedianMill());

  const companies = queryClient.getCompaniesObjects();
  await writeJson("companies.json", companies);

  const fullRows = queryClient.getFullMillInfo().objects() as unknown[];
  const totalRows = fullRows.length;
  const shardCount = Math.ceil(totalRows / ROWS_PER_SHARD) || 1;
  await writeJson("full-manifest.json", {
    shardCount,
    rowsPerShard: ROWS_PER_SHARD,
    totalRows,
  });

  for (let i = 0; i < shardCount; i++) {
    const start = i * ROWS_PER_SHARD;
    const part = fullRows.slice(start, start + ROWS_PER_SHARD);
    const idx = String(i).padStart(5, "0");
    await writeJson(`full/shard-${idx}.json`, part);
  }

  const umlSeen = new Set<string>();
  for (const row of fullRows as { [k: string]: unknown }[]) {
    const id = row["UML ID"];
    if (typeof id !== "string" || umlSeen.has(id)) {
      continue;
    }
    umlSeen.add(id);
    const slug = precomputedSlug(id);
    const info = queryClient.getUml(id)?.objects() ?? [];
    const brands = queryClient.getBrandUsageByUml(id);
    await writeJson(`mill/${slug}.json`, { brands, info });
  }

  const brandLabels = new Set(
    searchList.Brands.map((b) => b.label).filter(Boolean)
  );
  for (const brand of brandLabels) {
    const slug = precomputedSlug(brand);
    const brandInfo = queryClient.getBrandInfo(brand, fullYearRangeColumns);
    const brandStats = queryClient.getBrandStats(brand);
    await writeJson(`brand/${slug}.json`, { ...brandInfo, brandStats });
  }

  const ownerLabels = new Set(
    searchList["Mill Owners"].map((b) => b.label).filter(Boolean)
  );
  for (const owner of ownerLabels) {
    const slug = precomputedSlug(owner);
    await writeJson(`owner/${slug}-page.json`, queryClient.getOwnerData(owner));
    await writeJson(
      `owner/${slug}-api.json`,
      queryClient.getOwnerInfo(owner, fullYearRangeColumns)
    );
  }

  const groupLabels = new Set(
    searchList["Mill Groups"].map((b) => b.label).filter(Boolean)
  );
  for (const group of groupLabels) {
    const slug = precomputedSlug(group);
    await writeJson(`group/${slug}-page.json`, queryClient.getGroupData(group));
    await writeJson(
      `group/${slug}-api.json`,
      queryClient.getGroupInfo(group, fullYearRangeColumns)
    );
  }

  const countryLabels = new Set(
    searchList.Countries.map((b) => b.label).filter(Boolean)
  );
  for (const country of countryLabels) {
    const slug = precomputedSlug(country);
    const data = queryClient.getCountryData(country);
    await writeJson(`country/${slug}.json`, data);
  }

  console.log(
    "precompute-worker-data: wrote",
    OUT,
    "mills",
    umlSeen.size,
    "shards",
    shardCount,
    "rows",
    totalRows
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
