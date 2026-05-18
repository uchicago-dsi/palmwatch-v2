import { create } from "zustand";
import type { MapViewport } from "../palmwatch-map";

type HomeViewportStore = {
  viewport: MapViewport | null;
  setViewport: (v: MapViewport) => void;
};

export const useHomeViewportStore = create<HomeViewportStore>((set) => ({
  viewport: null,
  setViewport: (viewport) => set({ viewport }),
}));
