import { forestLossColorBreaks } from "@/config/mapSchema";

const MISSING_COLOR = [0, 0, 0, 0];

export type ColorStop = {
  value: number;
  color: number[];
  label: string;
  tooltip: string;
};

export const forestLossColorFunction = (value?: number) => {
  if (!value) return MISSING_COLOR;
  const color = forestLossColorBreaks.find((d) => value < d.value)?.color;
  return color || MISSING_COLOR;
};

export const colorFunctions = {
  forestLoss: {
    colorFunction: forestLossColorFunction,
    scale: forestLossColorBreaks,
  },
} as const;
