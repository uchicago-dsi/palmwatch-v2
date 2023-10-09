import { SearchableListLayout } from "@/components/SearchableListLayout";
import { StatsBlock } from "@/components/StatsBlock";
import queryClient from "@/utils/getMillData";
import { query } from "arquero";
import React from "react";

const getStatConfig = (
  companyCount: number | null,
  countryCount: number | null,
  millCount: number | null,
  groupCount: number | null
) => {
  const formatter = new Intl.NumberFormat("en-US", {});
  const stats = [];
  if (companyCount !== null) {
    stats.push({
      title: "Brands",
      stat: formatter.format(companyCount),
      className: "text-error",
    });
  }
  if (millCount !== null) {
    stats.push({
      title: "Mills",
      stat: formatter.format(millCount),
      className: "text-error",
    });
  }
  if (countryCount !== null) {
    stats.push({
      title: "Countries",
      stat: formatter.format(countryCount),
      className: "text-error",
    });
  }
  if (groupCount !== null) {
    stats.push({
      title: "Suppliers",
      stat: formatter.format(groupCount),
      className: "text-error",
    });
  }
  return stats;
};
export default async function Page() {
  await queryClient.init();
  const options = queryClient.getSearchList().Brands;
  const { companyCount, countryCount, millCount, groupCount } =
    queryClient.getUniqueCounts();
  const statConfig = getStatConfig(
    companyCount,
    countryCount,
    millCount,
    groupCount
  );

  queryClient.getMedianBrandImpacts()

  return (
    <main className="max-w-3xl mx-auto">
      <section className="prose flex flex-col py-4">
        <h1 className="p-0 m-0">Consumer Brands</h1>
        <div className="stats shadow">
          <StatsBlock stats={statConfig} />
        </div>
        <h3>Brand Search</h3>
        <p>
          Search below for consumer brands, and learn more about the Palm Oil
          mill utilization of each.
        </p>
      </section>
      <div>
        <SearchableListLayout
          options={options}
          label="Brands"
          columns={2}
          rows={20}
        />
      </div>
    </main>
  );
}
