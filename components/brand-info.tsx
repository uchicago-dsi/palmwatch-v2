import type { BrandData } from "@/domain";

export type { BrandData } from "@/domain";

import Link from "next/link";
import type React from "react";
import { yearRange } from "@/config/years";

const CircleSvg = () => (
  <svg aria-hidden="true" className="h-3 w-3" viewBox="0 0 24 24">
    <circle cx="12" cy="12" fill="rgb(248, 114, 114)" r="12" />
  </svg>
);

export const BRAND_INFO_SECTION_TITLE =
  "Consumer Brands Sourcing from This Mill";

const brandNameLinkClass =
  "capitalize font-medium text-[var(--site-nav-accent)] underline underline-offset-2 hover:opacity-90";

export const BrandInfo: React.FC<{ data: BrandData }> = ({ data }) => (
  <div className="prose w-full max-w-none [&_h3]:mt-0 [&_h3]:mb-3">
    <h3>{BRAND_INFO_SECTION_TITLE}</h3>
    <div className="card not-prose max-h-96 w-full overflow-x-auto bg-base-200 pt-0 shadow-xl">
      <table className="table-pin-rows table">
        <thead>
          <tr>
            <th className="pl-2">Brand</th>
            {yearRange.map((year) => (
              <th key={year}>{year}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((brand) => (
            <tr key={brand.consumer_brand}>
              <td className="pl-2">
                <Link
                  className={brandNameLinkClass}
                  href={`/brand/${encodeURIComponent(brand.consumer_brand)}`}
                >
                  {brand.consumer_brand}
                </Link>
              </td>
              {yearRange.map((year) => (
                <td key={year}>
                  {brand.years.includes(year) ? <CircleSvg /> : null}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);
