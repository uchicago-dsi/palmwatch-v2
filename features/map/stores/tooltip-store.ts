"use client";
import { create } from "zustand";
import { cumulativeLossColumn } from "@/config/years";

export type TooltipStore = {
  x: number | null;
  y: number | null;
  id: string | null;
  /** Matches PalmwatchMap coloring (year column or risk_score_*). */
  choroplethColumn: string;
  setData: (x: number | null, y: number | null, id: string | null) => void;
  setChoroplethColumn: (column: string) => void;
};

export const useTooltipStore = create<TooltipStore>((set) => ({
  x: null,
  y: null,
  id: null,
  choroplethColumn: cumulativeLossColumn,
  setData: (x: number | null, y: number | null, id: string | null) =>
    set({ x, y, id }),
  setChoroplethColumn: (column: string) => set({ choroplethColumn: column }),
}));
