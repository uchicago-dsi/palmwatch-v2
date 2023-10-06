"use client";
import { create } from "zustand";

export type TooltipStore = {
  x: number | null;
  y: number | null;
  id: string | null;
  setData: (x: number | null, y: number | null, id: string | null) => void;
};

export const useTooltipStore = create<TooltipStore>((set) => ({
  x: null,
  y: null,
  id: null,
  setData: (x: number | null, y: number | null, id: string | null) =>
    set({ x, y, id }),
}));
