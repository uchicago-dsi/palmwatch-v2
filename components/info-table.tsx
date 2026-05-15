"use client";
import type React from "react";
import { DataProvider } from "./DataProvider";

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
  <DataProvider<{ [key: string]: any }> dataUrl={endpoint}>
    {(data) => (
      <InfoTable
        columnMapping={columnMapping}
        data={dataAccessor ? data[dataAccessor] : data}
      />
    )}
  </DataProvider>
);

interface InfoTable {
  columnMapping?: Record<string, string>;
  data: Record<string, any>[];
  fullHeight?: boolean;
}

export const InfoTable: React.FC<InfoTable> = ({
  data,
  columnMapping,
  fullHeight,
}) => {
  const rawColumns = Object.keys(columnMapping || data[0]);
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
          {data.map((row, i) => (
            <tr key={i}>
              {rawColumns.map((key) => (
                <td key={`${i}${key}`}>{row[key]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
