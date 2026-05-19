"use client";
import type React from "react";
import { toInfoTableRows } from "@/lib/info-table-rows";
import { DataProvider } from "./data-provider";

interface ServerInfoTableProps {
  columnMapping?: Record<string, string>;
  dataAccessor: string;
  endpoint: string;
}

export const ServerInfotable: React.FC<ServerInfoTableProps> = ({
  endpoint,
  dataAccessor,
  columnMapping,
}) => (
  <DataProvider<Record<string, unknown>> dataUrl={endpoint}>
    {(data) => {
      const slice = dataAccessor ? data[dataAccessor] : data;
      const rows = toInfoTableRows(slice);
      return <InfoTable columnMapping={columnMapping} data={rows} />;
    }}
  </DataProvider>
);

export interface InfoTableProps {
  columnMapping?: Record<string, string>;
  data: Record<string, unknown>[];
  fullHeight?: boolean;
}

export const InfoTable: React.FC<InfoTableProps> = ({
  data,
  columnMapping,
  fullHeight,
}) => {
  const rawColumns = Object.keys(columnMapping || data[0] || {});
  const columns = rawColumns.map((key) => columnMapping?.[key] || key);
  return (
    <div className={`overflow-x-auto ${fullHeight ? "h-full" : "h-96"} w-full`}>
      <table className="table-pin-rows table">
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column}>{column}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row) => {
            const rowKey = rawColumns
              .map((key) => `${key}:${String(row[key] ?? "")}`)
              .join("|");
            return (
              <tr key={rowKey}>
                {rawColumns.map((key) => (
                  <td key={`${rowKey}-${key}`}>
                    {row[key] as React.ReactNode}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
