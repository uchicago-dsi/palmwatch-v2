"use client";
import { useQuery } from "@tanstack/react-query";
import type React from "react";
import { IconLink } from "@/components/icon-link";
import { Preloader } from "@/components/preloader";
import { millInfoColumns } from "@/config/millInfo";
import type { UmlData } from "@/domain";
import { useActiveUmlStore } from "@/hooks/use-active-uml-store";

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
    [`mill-${uml}${dataOverride ? "-data-override" : ""}`],
    async () => {
      if (dataOverride) {
        // @ts-expect-error
        return { info: dataOverride } as InfoData;
      }
      return await fetch(`/api/mill/${encodeURIComponent(uml as string)}`).then(
        (res) => res.json()
      );
    },
    { enabled: !!uml }
  );

  if (!uml) {
    return (
      <div className="prose mt-4 block w-full max-w-none text-center">
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
      <h3 className="inline text-capitalize">
        {info["Mill Name"]}
        {/* @ts-ignore */}
      </h3>
      <IconLink href={`/mill/${uml}`} label={info["Mill Name"]} />
      <div className="card max-h-96 w-full overflow-x-auto bg-base-200 pt-0 shadow-xl">
        <table className="table-pin-rows table">
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
                        // @ts-expect-error
                        href={infoSpec.linkFormat(info[infoSpec.column])}
                        // @ts-expect-error
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
