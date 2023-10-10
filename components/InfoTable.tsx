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
  fullHeight?: boolean;
}

export const InfoTable: React.FC<InfoTable> = ({ data, columnMapping, fullHeight }) => {
  const rawColumns = Object.keys(columnMapping || data[0]);
  const columns = rawColumns.map((key) => columnMapping?.[key] || key);
  return (
    <div className={`overflow-x-auto ${fullHeight ? 'h-full' : 'h-96'} w-full`}>
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
