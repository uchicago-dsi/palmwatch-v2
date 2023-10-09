import React from "react";
import { ServerIqr } from "@/components/IqrOverTimeLineChart";
import { ServerMap } from "@/components/Map";
import { QueryProvider } from "@/components/QueryProvider";
import brands from "@/config/brands";
import queryClient from "@/utils/getMillData";
import { StatsBlock } from "@/components/StatsBlock";
import { ServerInfotable } from "@/components/InfoTable";

const getStats = (
  averageCurrentRisk: number | null,
  uniqueMills: number | null,
  uniqueCountries: number | null,
  uniqueSuppliers: number | null
) => {
  const formatter = new Intl.NumberFormat("en-US", {});
  const stats = [];
  if (averageCurrentRisk !== null) {
    stats.push({
      title: "Average Current Risk Score",
      stat: formatter.format(averageCurrentRisk),
      className: "text-error",
      description: "Mean Risk Score of mills used by this brand (2020-2022)",
    });
  }
  if (uniqueMills !== null) {
    stats.push({
      title: "Mills",
      stat: formatter.format(uniqueMills),
      className: "text-error",
    });
  }
  if (uniqueCountries !== null) {
    stats.push({
      title: "Countries",
      stat: formatter.format(uniqueCountries),
      className: "text-error",
    });
  }
  if (uniqueSuppliers !== null) {
    stats.push({
      title: "Suppliers",
      stat: formatter.format(uniqueSuppliers),
      className: "text-error",
    });
  }
  return stats;
};

export default async function Page({ params }: { params: { brand: string } }) {
  await queryClient.init();
  const brand = params.brand;
  const { averageCurrentRisk, uniqueMills, uniqueCountries, uniqueSuppliers } =
    queryClient.getBrandStats(brand);
  const stats = getStats(
    averageCurrentRisk,
    uniqueMills,
    uniqueCountries,
    uniqueSuppliers
  );
  const brandInfo = brands[brand as keyof typeof brands];
  const { disclosures, description, descriptionAttribution } = brandInfo;

  return (
    <main className="relative flex flex-col items-center justify-center w-[90%] max-w-[1400px] mx-auto">
      <div className="p-4 flex flex-col space-y-4 my-8 w-full shadow-xl align-center justify-center prose max-w-none">
        <div>
          <h1 className="p-0 m-0">{brand}</h1>
          <h2 className="p-0 m-0">Palm Oil Usage</h2>
        </div>
        <StatsBlock stats={stats} />
        <div>
          <h2>About {brand}</h2>
          <p>
            {description} <i>(description via {descriptionAttribution})</i>
          </p>
        </div>
      </div>
      <QueryProvider>
        <div className="flex flex-row space-x-4 w-full">
          <div className="bg-white/30 shadow-xl ring-1 ring-gray-900/5 rounded-lg backdrop-blur-lg mx-auto  w-full">
            <h3 className="text-2xl m-4 font-bold">
              2022 Mill Impact (KM<sup>2</sup> of Forest Loss)
            </h3>
            <div className="h-[60vh] relative w-full">
              <ServerMap
                dataUrl={`/api/brand/${brand}`}
                geoDataUrl="/data/mill-catchment.geojson"
                dataTable={[]}
                geoIdColumn="UML ID"
                dataIdColumn="UML ID"
                choroplethColumn="treeloss_km_2022"
                choroplethScheme="forestLoss"
              />
            </div>
          </div>
          <div className="bg-white/30 shadow-xl ring-1 ring-gray-900/5 rounded-lg backdrop-blur-lg mx-auto w-full">
            <h3 className="text-2xl m-4 font-bold">
              Forest Loss over time (KM<sup>2</sup>)
            </h3>
            <div className="h-[60vh] relative w-full">
              <ServerIqr dataUrl={`/api/brand/${brand}`} type="brand" />
            </div>
          </div>
        </div>
        <div className="bg-white/30 shadow-xl my-4 ring-1 ring-gray-900/5 rounded-lg backdrop-blur-lg mx-auto w-full">
          <ServerInfotable
            endpoint={`/api/brand/${brand}`}
            dataAccessor="suppliers"
            columnMapping={{
              "Name": "Name",
              "Country": "Country",
              "count": "No. Mills for Brand"
            }}
          />
        </div>

        <div className="bg-white/30 shadow-xl my-4 ring-1 ring-gray-900/5 rounded-lg backdrop-blur-lg mx-auto w-full">
          <ServerInfotable
            endpoint={`/api/brand/${brand}`}
            dataAccessor="umlInfo"
            columnMapping={{
              "Mill Name": "Name",
              "risk_score_current": "Current Risk",
              "Country": "Country",
              "Province":"Province",
              "District":"District",
              "Parent Company": "Parent Company"
            }}
          />
        </div>
      </QueryProvider>
      {disclosures && (
        <div className="p-4 card shadow-xl bg-base-200 my-4">
          <h2 className="text-2xl font-bold">Disclosure PDFs</h2>
          <p>Source PDFs for data</p>
          <ul>
            {disclosures.map((pdf) => (
              <li key={pdf.filename}>
                <a
                  className="link-primary"
                  href={`${pdf.filename}`}
                  target="_blank"
                  rel="noreferrer"
                  download
                >
                  {pdf.year}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </main>
  );
}
