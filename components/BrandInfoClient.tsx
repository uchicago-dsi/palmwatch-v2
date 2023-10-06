"use client";
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useActiveUmlStore } from "@/stores/activeUml";
import { maxYear, minYear, yearRange } from "@/config/years";
import { BrandData, BrandInfo } from "./BrandInfo";


export const BrandInfoClient: React.FC = () => {
  const uml = useActiveUmlStore((state) => state.currentUml);
  const { data, isLoading, isError } = useQuery<{brands: BrandData}>(
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

  return <BrandInfo data={data.brands} />;
};
