"use client";
import React from "react";
import { useQuery } from "@tanstack/react-query";

interface DataProviderProps<T> {
  dataUrl: string;
  children: (data: T) => React.ReactElement | React.ReactNode;
}
export const DataProvider = <T extends any>({
  dataUrl,
  children,
}: DataProviderProps<T>) => {
  const { data, isLoading, error } = useQuery(["data", dataUrl], async () => {
    return await fetch(dataUrl).then((res) => res.json());
  });
  if (!data) {
    return <p>Loading...</p>;
  }
  return <>{children(data)}</>;
};
