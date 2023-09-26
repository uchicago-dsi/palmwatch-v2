"use client";
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useActiveUmlStore } from "@/stores/activeUml";
import { yearRange } from "@/config/years";
import { UmlData } from "@/utils/dataTypes";
import { millInfoColumns } from "@/config/millInfo";

type InfoData = {
  info:UmlData
};
export const MillInfo: React.FC = () => {
  const uml = useActiveUmlStore((state) => state.currentUml);
  const { data, isLoading, isError } = useQuery<InfoData>(
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

  return (
    <div className="prose w-full">
      {/* @ts-ignore */}
      <h3 className="text-capitalize">{data.info[0]["Mill Name"]}</h3>
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
                <td className="pl-2">{infoSpec.label}</td>
                {/* @ts-ignore */}
                <td>{data.info[0][infoSpec.column]}</td>
                </>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
