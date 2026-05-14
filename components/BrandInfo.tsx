import type React from "react";
import { yearRange } from "@/config/years";
import { IconLink } from "./IconLink";

export type BrandData = Array<{
  consumer_brand: string;
  years: Array<string | number>;
}>;

const CircleSvg = () => (
  <svg className="h-3 w-3" viewBox="0 0 24 24">
    <circle cx="12" cy="12" fill="rgb(248, 114, 114)" r="12" />
  </svg>
);

export const BrandInfo: React.FC<{ data: BrandData }> = ({ data }) => (
  <div className="prose w-full">
    <h3>Consumer Brands Sourcing from This Mill</h3>
    <div className="card max-h-96 w-full overflow-x-auto bg-base-200 pt-0 shadow-xl">
      <table className="table-pin-rows table">
        <thead>
          <tr>
            <th className="px-2">Brand</th>
            {yearRange.map((year) => (
              <th key={year}>{year}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((brand) => (
            <tr key={brand.consumer_brand}>
              <>
                <td className="px-2">
                  {brand.consumer_brand}{" "}
                  <IconLink
                    href={`/brand/${brand.consumer_brand}`}
                    label={brand.consumer_brand}
                  />
                </td>
                {yearRange.map((year) => (
                  <td key={year}>
                    {brand.years.includes(year) ? <CircleSvg /> : null}
                  </td>
                ))}
              </>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);
