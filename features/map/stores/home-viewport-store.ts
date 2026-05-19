import { create } from "zustand";
import type { MapViewport } from "../palmwatch-map";

interface HomeViewportStore {
  setViewport: (v: MapViewport) => void;
  viewport: MapViewport | null;
}

export const useHomeViewportStore = create<HomeViewportStore>((set) => ({
  viewport: null,
  setViewport: (viewport) => set({ viewport }),
}));
