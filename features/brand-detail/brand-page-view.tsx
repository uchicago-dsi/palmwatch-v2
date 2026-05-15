import type { ReactNode } from "react";
import { ServerInfotable } from "@/components/info-table";
import pageStyles from "@/components/page-layout.module.css";
import { QueryProvider } from "@/components/query-provider";
import { StatsBlock } from "@/components/stats-block";
import { getBrandDataDownloadLinks } from "@/config/brand-data-download-links";
import { buildBrandRollupStatTiles } from "@/domain/stat-tiles";
import type { BrandPageModel } from "@/lib/server/brand-page-data";
import { PortableText } from "@/sanity/lib/components";

export type BrandPageViewProps = {
  model: BrandPageModel;
  /** Server map figure only (route composes `ServerMap` from `features/map`). */
  brandMapFigure: ReactNode;
  /** Server IQR chart (route composes `ServerIqr` from shared chart component). */
  brandIqrFigure: ReactNode;
};

export function BrandPageView({
  model,
  brandMapFigure,
  brandIqrFigure,
}: BrandPageViewProps) {
  const { brand, brandPre, brandInfo } = model;
  const {
    averageCurrentRisk,
    uniqueMills,
    uniqueCountries,
    uniqueOwners,
    uniqueGroups,
  } = brandPre.brandStats;
  const stats = buildBrandRollupStatTiles(
    averageCurrentRisk,
    uniqueMills,
    uniqueCountries,
    uniqueOwners,
    uniqueGroups
  );
  const downloads = getBrandDataDownloadLinks(brand);
  const { disclosures, description, descriptionAttribution, altName } =
    brandInfo;

  return (
    <main className={pageStyles.pageShell}>
      <div className={pageStyles.pageInner}>
        <header className="w-full pb-8">
          <div className="flex w-full flex-col">
            <div className="flex-1">
              <h2 className="text-xl">Palm Oil Impact</h2>
              <h1 className="font-bold text-4xl">
                {brand}
                {altName ? ` (${altName})` : null}
              </h1>
            </div>
            <hr className="mt-4 block" />

            <StatsBlock stats={stats} />
          </div>
        </header>
        <QueryProvider>
          <div className="flex w-full flex-col space-y-4 lg:flex-row lg:space-x-4 lg:space-y-0">
            <div className="m-0 w-full rounded-lg bg-base-100 shadow-xl ring-1 ring-gray-900/5 backdrop-blur-lg">
              <h3 className="m-4 font-bold text-2xl">
                Mill Deforestation (KM<sup>2</sup> of Forest Loss)
              </h3>
              <div className="relative h-[60vh] w-full">{brandMapFigure}</div>
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
              <div className="relative h-[60vh] w-full">{brandIqrFigure}</div>
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
            amount of palm oil each brand sources from an individual mill,
            because this data is not disclosed. For more information on
            potential limitations, please visit our{" "}
            <a href="/about">about page.</a>
          </i>
        </p>
      </div>
    </main>
  );
}
