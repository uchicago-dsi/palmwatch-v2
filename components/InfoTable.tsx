"use client"
import React from "react";
import { DataProvider } from "./DataProvider";

interface ServerInfoTableProps {
  endpoint: string;
  dataAccessor: string;
  columnMapping?: Record<string, string>;
}

export const ServerInfotable: React.FC<ServerInfoTableProps> = ({
  endpoint,
  dataAccessor,
  columnMapping,
}) => {
  return (
    <DataProvider<{ [key: string]: any }> dataUrl={endpoint}>
      {(data) => {
        return (
          <InfoTable
            data={dataAccessor ? data[dataAccessor] : data}
            columnMapping={columnMapping}
          />
        );
      }}
    </DataProvider>
  );
};

interface InfoTable {
  data: Record<string, any>[];
  columnMapping?: Record<string, string>;
}

export const InfoTable: React.FC<InfoTable> = ({ data, columnMapping }) => {
  const rawColumns = Object.keys(data[0]);
  const columns = rawColumns.map((key) => columnMapping?.[key] || key);

  return (
    <div className="overflow-x-auto h-96">
      <table className="table table-pin-rows">
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
