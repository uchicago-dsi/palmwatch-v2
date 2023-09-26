"use client"
import { create } from "zustand"

export type UmlStore = { 
  currentUml: string | null
  setUml: (uml: string) => void
}

export const useActiveUmlStore = create<UmlStore>((set) => ({
  currentUml: null,
  setUml: (uml: string) => set({ currentUml: uml }),
}))