import React from "react";
import { ServerIqr } from "@/components/IqrOverTimeLineChart";
import { ServerMap } from "@/components/Map";
import { QueryProvider } from "@/components/QueryProvider";
import queryClient from "@/utils/getMillData";
import { StatsBlock } from "@/components/StatsBlock";
import { ServerInfotable } from "@/components/InfoTable";
import { getDataDownload, getStats } from "./pageConfig";
import { getBrandInfo } from "@/sanity/lib/client";
import { PortableText } from "@portabletext/react";
import brands from "@/config/brands";
import { BrandSchema } from "@/config/brands/types";

export default async function Page({ params }: { params: { brand: string } }) {
  const brand = params.brand ? decodeURIComponent(params.brand) : "";
  const [_, _brandInfo] = await Promise.all([
    queryClient.init(),
    getBrandInfo(brand),
  ]);
  const brandInfo = (_brandInfo || brands[brand]) as BrandSchema
  
  const { averageCurrentRisk, uniqueMills, uniqueCountries, uniqueSuppliers } =
    queryClient.getBrandStats(brand);
  const stats = getStats(
    averageCurrentRisk,
    uniqueMills,
    uniqueCountries,
    uniqueSuppliers
  );
  const downloads = getDataDownload(brand);
  if (!brandInfo) {
    return (
      <div>
        Could not find brand {`"${brand}"`}. Please contact administrator.
      </div>
    );
  }

  const { disclosures, description, descriptionAttribution } = brandInfo;
  return (
    <main className="relative flex flex-col items-center justify-center w-[90%] mx-auto max-w-[90vw] 2xl:max-w-[1400px]">
      <div className="flex flex-col space-y-4 my-8 w-full shadow-xl align-center justify-center prose max-w-none">
        <div className="p-4">
          <h1 className="p-0 m-0">{brand}</h1>
          <h2 className="p-0 m-0">Palm Oil Usage</h2>
        </div>
        <StatsBlock stats={stats} />
      </div>
      <QueryProvider>
        <div className="flex flex-col space-y-4 w-full lg:flex-row lg:space-x-4 lg:space-y-0">
          <div className="bg-white/30 shadow-xl ring-1 ring-gray-900/5 rounded-lg backdrop-blur-lg m-0 w-full">
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
          <div className="bg-white/30 shadow-xl ring-1 ring-gray-900/5 rounded-lg backdrop-blur-lg m-0 w-full">
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
              "Parent Company": "Supplier",
              Country: "Country",
              count: "No. Mills for Brand",
            }}
          />
        </div>

        <div className="bg-white/30 shadow-xl my-4 ring-1 ring-gray-900/5 rounded-lg backdrop-blur-lg mx-auto w-full">
          <ServerInfotable
            endpoint={`/api/brand/${brand}`}
            dataAccessor="umlInfo"
            columnMapping={{
              "Mill Name": "Name",
              risk_score_current: "Current Risk",
              Country: "Country",
              Province: "Province",
              District: "District",
              "Parent Company": "Parent Company",
            }}
          />
        </div>
      </QueryProvider>
      <div className="bg-neutral-50 m-0  px-4 flex flex-col lg:flex-row lg:space-x-4 lg:space-y-0 space-y-4 prose max-w-none shadow-xl">
        <div className="flex-1 basis-2/3">
          <h2 className="my-4">About {brand}</h2>
          <p>
            {description} <i>(description via {descriptionAttribution})</i>
          </p>
        </div>
        <div className="flex-1 basis-1/3 border-l-2 border-l-neutral-200 pl-6">
          {disclosures && (
            <>
              <h2 className="my-4">Disclosure PDFs</h2>
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
            </>
          )}
          <h2>Data Download</h2>
          <ul>
            {downloads.map((download, i) => (
              <li key={i}>
                <a
                  className="link-primary"
                  href={`${download.href}`}
                  target="_blank"
                  rel="noreferrer"
                  download
                >
                  {download.label}
                </a>
              </li>
            ))}
          </ul>

          <p></p>
        </div>
      </div>
      {brandInfo.content && (
        <div className="prose bg-neutral-50 p-4 my-4 w-full shadow-xl max-w-none">
          <PortableText value={brandInfo.content} />
        </div>
      )}
    </main>
  );
}
