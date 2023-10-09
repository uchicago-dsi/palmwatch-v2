"use client";
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useActiveUmlStore } from "@/stores/activeUml";
import { yearRange } from "@/config/years";
import { UmlData } from "@/utils/dataTypes";
import { millInfoColumns } from "@/config/millInfo";
import { Preloader } from "./Preloader";
import { IconLink } from "./IconLink";

type InfoData = {
  info: UmlData;
};
export const MillInfo: React.FC<{
  millOverride?: string;
  dataOverride?: Array<Record<string, unknown>>;
}> = ({ millOverride, dataOverride }) => {
  const _uml = useActiveUmlStore((state) => state.currentUml);
  const uml = millOverride || _uml;
  const { data, isLoading, isError } = useQuery<InfoData>(
    [`mill-${uml}${dataOverride ? "-data-override" : ""}}`],
    async () => {
      if (dataOverride) {
        // @ts-ignore
        return { info: dataOverride } as InfoData;
      }
      return await fetch(`/api/mill/${uml}`).then((res) => res.json());
    }
  );

  if (!uml) {
    return (
      <div className="prose mt-4 max-w-none block text-center w-full">
        <p>Click a mill on the map to learn more.</p>
      </div>
    );
  }

  if (isLoading || isError) {
    return <Preloader />;
  }
  const info = ((data as any).info?.[0] as UmlData) || null;

  if (!info) {
    return null;
  }
  return (
    <div className="prose w-full max-w-none">
      <h3 className="text-capitalize inline">
        {info["Mill Name"]}
        {/* @ts-ignore */}
      </h3>
      <IconLink href={`/mill/${uml}`} label={info["Mill Name"]} />
      <div className="overflow-x-auto max-h-96 card pt-0 shadow-xl bg-base-200 w-full">
        <table className="table table-pin-rows">
          <thead>
            <tr>
              <th>Mill Property</th>
              <th>Value</th>
            </tr>
          </thead>
          <tbody>
            {millInfoColumns.map((infoSpec) => (
              <tr key={infoSpec.column}>
                <>
                  <td className="pl-2">
                    {infoSpec.label}
                    {infoSpec.linkFormat ? (
                      <IconLink
                        // @ts-ignore
                        href={infoSpec.linkFormat(info[infoSpec.column])}
                        // @ts-ignore
                        label={info[infoSpec.column]}
                      />
                    ) : null}
                  </td>
                  {/* @ts-ignore */}
                  <td>{info[infoSpec.column]}</td>
                </>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
