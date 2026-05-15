"use client";
import { create } from "zustand";

export type UmlStore = {
  currentUml: string | null;
  setUml: (uml: string) => void;
};

/** Cross-feature mill selection state for map + mill info panels. */
export const useActiveUmlStore = create<UmlStore>((set) => ({
  currentUml: null,
  setUml: (uml: string) => set({ currentUml: uml }),
}));
