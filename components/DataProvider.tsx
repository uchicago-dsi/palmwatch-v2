"use client";
import { useQuery } from "@tanstack/react-query";
import type React from "react";
import { Preloader } from "./Preloader";

interface DataProviderProps<T> {
  children: (data: T) => React.ReactElement | React.ReactNode;
  dataUrl: string;
}
export const DataProvider = <T,>({
  dataUrl,
  children,
}: DataProviderProps<T>) => {
  const { data, isLoading, error } = useQuery(
    ["data", dataUrl],
    async () => await fetch(dataUrl).then((res) => res.json())
  );
  if (!data) {
    return <Preloader />;
  }
  return <>{children(data)}</>;
};
