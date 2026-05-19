"use client";
import { useQuery } from "@tanstack/react-query";
import type React from "react";
import { Preloader } from "@/components/preloader";
import { maxYear, minYear } from "@/config/years";
import { useActiveUmlStore } from "@/hooks/use-active-uml-store";
import {
  BRAND_INFO_SECTION_TITLE,
  type BrandData,
  BrandInfo,
} from "./brand-info";

export const BrandInfoClient: React.FC = () => {
  const uml = useActiveUmlStore((state) => state.currentUml);
  const millId = uml ?? "";
  const { data, isLoading, isError } = useQuery<{ brands: BrandData }>(
    [`mill-${millId}`],
    async () =>
      await fetch(`/api/mill/${encodeURIComponent(millId)}`).then((res) =>
        res.json()
      ),
    { enabled: Boolean(uml) }
  );

  if (!uml) {
    return null;
  }

  if (isLoading || isError) {
    return (
      <div className="prose w-full max-w-none [&_h3]:mt-0 [&_h3]:mb-3">
        <h3>{BRAND_INFO_SECTION_TITLE}</h3>
        <Preloader />
      </div>
    );
  }
  if (!data?.brands?.length) {
    return (
      <div className="prose w-full max-w-none [&_h3]:mt-0 [&_h3]:mb-3">
        <h3>{BRAND_INFO_SECTION_TITLE}</h3>
        <p>
          No brand usage found for this mill from {minYear} to {maxYear}.
        </p>
      </div>
    );
  }

  return <BrandInfo data={data.brands} />;
};
