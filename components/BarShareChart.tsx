"use client";
import type React from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface BarShareChartProps {
  bars: {
    dataKey: string;
    label: string;
    stackId?: string;
    fill?: string;
  }[];
  data: Record<string, unknown>[];
  domain?: [number, number];
}

export const BarShareChart: React.FC<BarShareChartProps> = ({
  data,
  bars,
  domain,
}) => {
  const xDomain = domain ?? [0, 100];
  return (
    <ResponsiveContainer height="100%" width="100%">
      <BarChart
        data={data}
        height={300}
        layout="vertical"
        margin={{
          top: 8,
          right: 8,
          left: 8,
          bottom: 8,
        }}
        width={500}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis domain={xDomain} hide type="number" />
        <YAxis dataKey="name" hide type="category" width={1} />
        <Tooltip />
        <Legend />
        {bars.map((bar) => (
          <Bar
            dataKey={bar.dataKey}
            fill={bar.fill}
            key={bar.dataKey}
            stackId={bar.stackId || "a"}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
};
