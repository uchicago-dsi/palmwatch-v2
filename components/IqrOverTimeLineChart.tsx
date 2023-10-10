"use client";
import React, { PureComponent } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  ComposedChart,
} from "recharts";
import { DataProvider } from "./DataProvider";

export type IqrOverTimeProps = {
  data: Array<Record<string, unknown>> | object[];
  type: "brand" | "mill";
  showMedian?: boolean;
};

export const IqrOverTime: React.FC<IqrOverTimeProps> = ({ data, type, showMedian }) => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <ComposedChart
        width={500}
        height={300}
        data={data}
        margin={{
          top: 30,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="year" />
        <YAxis label={{ value: "Square KM of Forest Loss Per Year", angle: -90, dx:-10 }}  />
        <Tooltip />
        <Legend />
        {showMedian ? 
        <Line 
          isAnimationActive={false}
          type="monotone"
          dataKey="Overall Median Mill Tree Loss (km2)"
          stroke="darkgray"
          strokeWidth={2}
          activeDot={{ r: 4 }}
        />
        : null}
        {type === 'brand' ? (<>
        
          <Area
          isAnimationActive={false}
          type="monotone"
          dataKey="q0.25"
          name="1st Quartile Mill (lowest 25%)"
          stackId="1"
          stroke="#acacac"
          fill="rgba(0, 0, 0, 0)"
          />
        <Area
            isAnimationActive={false}
          name="3rd Quartile Mill (highest 25%)"
          type="monotone"
          dataKey="q0.75"
          stackId="1"
          stroke="#acacac"
          fill="#55555555"
          />

        <Line
          isAnimationActive={false}
          name="Median Mill"
          type="monotone"
          dataKey="q0.5"
          stroke="rgb(248, 114, 114)"
          strokeWidth={5}
          activeDot={{ r: 8 }}
        /></>): (
          <Line
          isAnimationActive={false}
          type="monotone"
          dataKey="Mill Tree Loss (km2)"
          stroke="#ff0000"
          strokeWidth={5}
          activeDot={{ r: 8 }}
        />
        )}
      </ComposedChart>
    </ResponsiveContainer>
  );
};

export const ServerIqr: React.FC<{
  dataUrl: string;
  type: IqrOverTimeProps["type"];
}> = ({ dataUrl, type='brand' }) => {
  return (
    <DataProvider<{ timeseries: any }> dataUrl={dataUrl}>
      {(data) => {
        // @ts-ignore
        return <IqrOverTime data={data.timeseries} type={type} />;
      }}
    </DataProvider>
  );
};
