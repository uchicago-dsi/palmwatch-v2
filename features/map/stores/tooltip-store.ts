"use client";
import { create } from "zustand";
import { cumulativeLossColumn } from "@/config/years";

export interface TooltipStore {
  /** Matches PalmwatchMap coloring (year column or risk_score_*). */
  choroplethColumn: string;
  freeze: () => void;
  frozen: boolean;
  id: string | null;
  setChoroplethColumn: (column: string) => void;
  setData: (x: number | null, y: number | null, id: string | null) => void;
  unfreeze: () => void;
  x: number | null;
  y: number | null;
}

export const useTooltipStore = create<TooltipStore>((set) => ({
  x: null,
  y: null,
  id: null,
  frozen: false,
  choroplethColumn: cumulativeLossColumn,
  setData: (x: number | null, y: number | null, id: string | null) =>
    set({ x, y, id }),
  setChoroplethColumn: (column: string) => set({ choroplethColumn: column }),
  freeze: () => set({ frozen: true }),
  unfreeze: () => set({ frozen: false, x: null, y: null, id: null }),
}));
