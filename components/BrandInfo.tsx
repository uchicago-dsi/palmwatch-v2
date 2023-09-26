"use client";
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useActiveUmlStore } from "@/stores/activeUml";
import { maxYear, minYear, yearRange } from "@/config/years";

type BrandData = {
  brands: Array<{
    brand: string;
    years: number[];
  }>;
};
export const BrandInfo: React.FC = () => {
  const uml = useActiveUmlStore((state) => state.currentUml);
  const { data, isLoading, isError } = useQuery<BrandData>(
    [`mill-${uml}`],
    async () => {
      return await fetch(`/api/mill/${uml}`).then((res) => res.json());
    }
  );

  if (!uml) {
    return null;
  }

  if (isLoading || isError) {
    return <p>Loading...</p>;
  }
  if (!data.brands.length) {
    return (
      <p>
        No brand usage found for this mill from {minYear} to {maxYear}.
      </p>
    );
  }

  return (
    <div className="prose w-full">
      <h3>Consumer Brand Usage</h3>
      <div className="overflow-x-auto max-h-96 card pt-0 shadow-xl bg-base-200 w-full">
        <table className="table table-pin-rows">
          <thead>
            <tr>
              <th className="px-2">Brand</th>
              {yearRange.map((year) => (
                <th key={year}>{year}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.brands.map((brand) => (
              <tr key={brand.brand}>
                <>
                  <td className="px-2">{brand.brand}</td>
                  {yearRange.map((year) => (
                    <td key={year}>{brand.years.includes(year) ? "x" : ""}</td>
                  ))}
                </>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
