"use client";
import { useQuery } from "@tanstack/react-query";
import type React from "react";
import { Preloader } from "./preloader";

interface DataProviderProps<T> {
  children: (data: T) => React.ReactElement | React.ReactNode;
  dataUrl: string;
}
export const DataProvider = <T,>({
  dataUrl,
  children,
}: DataProviderProps<T>) => {
  const { data } = useQuery<T>(
    ["data", dataUrl],
    async (): Promise<T> => (await fetch(dataUrl)).json() as T
  );
  if (!data) {
    return <Preloader />;
  }
  return <>{children(data)}</>;
};
