"use client";
import type React from "react";
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { DataProvider } from "@/components/data-provider";
import { toInfoTableRows } from "@/lib/info-table-rows";

export type IqrOverTimeProps = {
  data: Array<Record<string, unknown>> | object[];
  type: "brand" | "mill";
  showMedian?: boolean;
};

export const IqrOverTime: React.FC<IqrOverTimeProps> = ({
  data,
  type,
  showMedian,
}) => (
  <ResponsiveContainer height="100%" width="100%">
    <ComposedChart
      data={data}
      height={300}
      margin={{
        top: 30,
        right: 30,
        left: 20,
        bottom: 5,
      }}
      width={500}
    >
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="year" />
      <YAxis
        label={{
          value: "Square KM of Forest Loss Per Year",
          angle: -90,
          dx: -10,
        }}
      />
      <Tooltip />
      <Legend />
      {showMedian ? (
        <Line
          activeDot={{ r: 4 }}
          dataKey="Overall Median Mill Tree Loss (km2)"
          isAnimationActive={false}
          stroke="darkgray"
          strokeWidth={2}
          type="monotone"
        />
      ) : null}
      {type === "brand" ? (
        <>
          <Area
            dataKey="q0.25"
            fill="rgba(0, 0, 0, 0)"
            isAnimationActive={false}
            name="1st Quartile Mill (lowest 25%)"
            stackId="1"
            stroke="#acacac"
            type="monotone"
          />
          <Area
            dataKey="q0.75"
            fill="#55555555"
            isAnimationActive={false}
            name="3rd Quartile Mill (highest 25%)"
            stackId="1"
            stroke="#acacac"
            type="monotone"
          />

          <Line
            activeDot={{ r: 8 }}
            dataKey="q0.5"
            isAnimationActive={false}
            name="Median Mill"
            stroke="rgb(248, 114, 114)"
            strokeWidth={5}
            type="monotone"
          />
        </>
      ) : (
        <Line
          activeDot={{ r: 8 }}
          dataKey="Mill Tree Loss (km2)"
          isAnimationActive={false}
          stroke="#ff0000"
          strokeWidth={5}
          type="monotone"
        />
      )}
    </ComposedChart>
  </ResponsiveContainer>
);

export const ServerIqr: React.FC<{
  dataUrl: string;
  type: IqrOverTimeProps["type"];
}> = ({ dataUrl, type = "brand" }) => (
  <DataProvider<{ timeseries?: unknown }> dataUrl={dataUrl}>
    {(data) => (
      <IqrOverTime data={toInfoTableRows(data.timeseries)} type={type} />
    )}
  </DataProvider>
);
