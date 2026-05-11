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

export const BarShareChart: React.FC<BarShareChartProps> = ({
  data,
  bars,
  domain,
}) => {
  const xDomain = domain ?? [0, 100];
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        layout="vertical"
        width={500}
        height={300}
        data={data}
        margin={{
          top: 8,
          right: 8,
          left: 8,
          bottom: 8,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis type="number" domain={xDomain} hide />
        <YAxis dataKey="name" type="category" hide width={1} />
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
