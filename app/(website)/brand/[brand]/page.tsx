import { ServerInfotable } from "@/components/InfoTable";
import { ServerIqr } from "@/components/IqrOverTimeLineChart";
import { ServerMap } from "@/components/Map";
import { QueryProvider } from "@/components/QueryProvider";
import { StatsBlock } from "@/components/StatsBlock";
import brands from "@/config/brands";
import type { BrandSchema } from "@/config/brands/types";
import { latestTreelossKmColumn } from "@/config/years";
import cmsClient from "@/sanity/lib/client";
import { PortableText } from "@/sanity/lib/components";
import { loadPrecomputedJson } from "@/utils/loadPrecomputed";
import { precomputedSlug } from "@/utils/precomputedSlug";
import { getDataDownload, getStats } from "./pageConfig";
export const revalidate = 60;

export default async function Page({
  params,
}: {
  params: Promise<{ brand: string }>;
}) {
  const { brand: _brand } = await params;
  const brand = decodeURIComponent(_brand);
  const [brandPre, _brandInfo] = await Promise.all([
    loadPrecomputedJson<{
      brandStats: {
        averageCurrentRisk: number;
        uniqueMills: number;
        uniqueCountries: number;
        uniqueOwners: number;
        uniqueGroups: number;
      };
    }>(`brand/${precomputedSlug(brand)}.json`),
    cmsClient.getBrandInfo(brand),
  ]);
  const brandInfo = (_brandInfo || brands[brand]) as BrandSchema;

  const {
    averageCurrentRisk,
    uniqueMills,
    uniqueCountries,
    uniqueOwners,
    uniqueGroups,
  } = brandPre.brandStats;
  const stats = getStats(
    averageCurrentRisk,
    uniqueMills,
    uniqueCountries,
    uniqueOwners,
    uniqueGroups
  );

  const downloads = getDataDownload(brand);
  if (!brandInfo) {
    return (
      <div>
        Could not find brand {`"${brand}"`}. Please contact administrator.
      </div>
    );
  }

  const { disclosures, description, descriptionAttribution, altName } =
    brandInfo;
  return (
    <main className="relative mx-auto flex w-[90%] max-w-[90vw] flex-col items-center justify-center 2xl:max-w-[1400px]">
      <div className="prose my-8 flex w-full max-w-none flex-col justify-center space-y-4 align-center shadow-xl">
        <div className="p-4">
          <h1 className="m-0 p-0">
            {brand} {altName ? `(${altName})` : null}
          </h1>
          <h2 className="m-0 p-0">Palm Oil Usage</h2>
        </div>
        <StatsBlock stats={stats} />
      </div>
      <QueryProvider>
        <div className="flex w-full flex-col space-y-4 lg:flex-row lg:space-x-4 lg:space-y-0">
          <div className="m-0 w-full rounded-lg bg-base-100 shadow-xl ring-1 ring-gray-900/5 backdrop-blur-lg">
            <h3 className="m-4 font-bold text-2xl">
              Mill Deforestation (KM<sup>2</sup> of Forest Loss)
            </h3>
            <div className="relative h-[60vh] w-full">
              <ServerMap
                choroplethColumn={latestTreelossKmColumn}
                choroplethScheme="forestLoss"
                dataIdColumn="UML ID"
                dataTable={[]}
                dataUrl={`/api/brand/${brand}`}
                geoDataUrl="/data/mill-catchment.geojson"
                geoIdColumn="UML ID"
              />
            </div>
          </div>
          <div className="m-0 w-full rounded-lg bg-base-100 shadow-xl ring-1 ring-gray-900/5 backdrop-blur-lg">
            <div className="flex flex-row items-center align-center">
              <h3 className="m-4 font-bold text-2xl">
                Forest Loss over time (KM<sup>2</sup>)
              </h3>
              <div
                className="tooltip"
                data-tip="1st Quartile Mill represents the square kilometers of forest loss per year that 25% of the mills used by this brand fall under. Median Mill represents this value at which 50% of the mills used by this brand fall under. 3rd Quartile Mill represents the square kilometers of forest loss per year that 75% of the mills used by this brand fall under."
              >
                <button
                  className="btn btn-sm btn-outline btn-circle ml-2"
                  data-tooltip-target="tooltip-default"
                  type="button"
                >
                  ?
                </button>
              </div>
            </div>
            <div className="relative h-[60vh] w-full">
              <ServerIqr dataUrl={`/api/brand/${brand}`} type="brand" />
            </div>
          </div>
        </div>
        <div className="mx-auto my-4 w-full rounded-lg bg-base-100 shadow-xl ring-1 ring-gray-900/5 backdrop-blur-lg">
          <ServerInfotable
            columnMapping={{
              "Parent Company": "Mill Owner",
              Country: "Country",
              count: "No. Mills for Brand",
            }}
            dataAccessor="owners"
            endpoint={`/api/brand/${brand}`}
          />
        </div>

        <div className="mx-auto my-4 w-full rounded-lg bg-base-100 shadow-xl ring-1 ring-gray-900/5 backdrop-blur-lg">
          <ServerInfotable
            columnMapping={{
              "Mill Name": "Name",
              risk_score_current: "Recent Deforestation Score",
              Country: "Country",
              Province: "Province",
              District: "District",
              "Parent Company": "Parent Company",
            }}
            dataAccessor="umlInfo"
            endpoint={`/api/brand/${brand}`}
          />
        </div>
      </QueryProvider>
      <div className="prose m-0 flex max-w-none flex-col space-y-4 bg-base-100 px-4 shadow-xl lg:flex-row lg:space-x-4 lg:space-y-0">
        <div className="flex-1 basis-2/3">
          <h2 className="my-4">About {brand}</h2>
          <p>
            {description} <i>(description via {descriptionAttribution})</i>
          </p>
        </div>
        <div className="flex-1 basis-1/3 border-l-2 border-l-base-200 pl-6">
          {disclosures && (
            <>
              <h2 className="my-4">Disclosure PDFs</h2>
              <p>Source PDFs for data</p>
              <ul>
                {disclosures.map((pdf) => (
                  <li key={pdf.filename}>
                    <a
                      className="link-primary"
                      download
                      href={`${pdf.filename}`}
                      rel="noreferrer"
                      target="_blank"
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
                  download
                  href={`${download.href}`}
                  rel="noreferrer"
                  target="_blank"
                >
                  {download.label}
                </a>
              </li>
            ))}
          </ul>

          <p />
        </div>
      </div>
      {!!brandInfo.content && (
        <div className="prose my-4 w-full max-w-none bg-base-100 p-4 shadow-xl">
          <PortableText value={brandInfo.content} />
        </div>
      )}
      <p className="prose my-4">
        <i>
          Note: Many brands source palm oil from the same mills. The total
          deforestation loss for each brand is not disaggregated based on the
          amount of palm oil each brand sources from an individual mill, because
          this data is not disclosed. For more information on potential
          limitations, please visit our <a href="/about">about page.</a>
        </i>
      </p>
    </main>
  );
}
