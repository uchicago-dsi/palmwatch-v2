"use client"
import React from "react";

export const ClientComponent: React.FC<{data: Array<Record<string, any>>}> = ({data}) => {
  console.log(data.length)
  return null
}