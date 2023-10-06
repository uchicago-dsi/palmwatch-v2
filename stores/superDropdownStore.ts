"use client"
import { create } from "zustand"

export type DropdownStore = { 
  currentDropdown: string | null
  setcurrentDropdown: (dropdown: string) => void
}

export const useDropdownStore = create<DropdownStore>((set) => ({
  currentDropdown: null,
  setcurrentDropdown: (dropdown: string) => set({ currentDropdown: dropdown }),
}))