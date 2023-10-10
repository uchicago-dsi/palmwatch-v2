"use client";
import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface BarShareChartProps {
  data: Record<string, unknown>[];
  bars: {
    dataKey: string;
    label: string;
    stackId?: string;
    fill?: string;
  }[];
  domain?: [number, number]
}

export const BarShareChart: React.FC<BarShareChartProps> = ({ data, bars, domain }) => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        layout="vertical"
        width={500}
        height={300}
        data={data}
        margin={{
          top: 0,
          right: 0,
          left: 0,
          bottom: 0,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis type="number" hide />
        <YAxis dataKey="name" type="category" hide  domain={domain}/>
        <Tooltip />
        <Legend />
        {bars.map((bar) => (
          <Bar
            key={bar.dataKey}
            dataKey={bar.dataKey}
            stackId={bar.stackId || "a"}
            fill={bar.fill}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
};
