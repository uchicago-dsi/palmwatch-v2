"use client"
import React, { PureComponent } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, ComposedChart } from 'recharts';

export type IqrOverTimeProps = {
  data: Array<Record<string, unknown>> | object[];
};

export const IqrOverTime: React.FC<IqrOverTimeProps> = ({data}) => { 
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
          <YAxis />
          <Tooltip />
          <Legend />
          <Area type="monotone" dataKey="q0.25" stackId="1" stroke="#acacac" fill="rgba(0, 0, 0, 0)" />
          <Area type="monotone" dataKey="q0.75" stackId="1" stroke="#acacac" fill="#55555555" />
          <Line type="monotone" dataKey="q0.5" stroke="#8884d8" strokeWidth={5} activeDot={{ r: 8 }} />
        </ComposedChart>
      </ResponsiveContainer>
    );
  }
