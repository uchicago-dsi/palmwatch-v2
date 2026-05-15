"use client";
import { useQuery } from "@tanstack/react-query";
import type React from "react";
import { Preloader } from "@/components/preloader";
import { maxYear, minYear } from "@/config/years";
import { useActiveUmlStore } from "@/hooks/use-active-uml-store";
import { type BrandData, BrandInfo } from "./brand-info";

export const BrandInfoClient: React.FC = () => {
  const uml = useActiveUmlStore((state) => state.currentUml);
  const { data, isLoading, isError } = useQuery<{ brands: BrandData }>(
    [`mill-${uml}`],
    async () =>
      await fetch(`/api/mill/${encodeURIComponent(uml!)}`).then((res) =>
        res.json()
      ),
    { enabled: !!uml }
  );

  if (!uml) {
    return null;
  }

  if (isLoading || isError) {
    return <Preloader />;
  }
  if (!data?.brands?.length) {
    return (
      <p>
        No brand usage found for this mill from {minYear} to {maxYear}.
      </p>
    );
  }

  return <BrandInfo data={data.brands} />;
};
