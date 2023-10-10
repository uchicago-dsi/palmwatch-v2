import { forestLossColorBreaks, riskScoreScheme } from "@/config/mapSchema";

const MISSING_COLOR = [0, 0, 0, 0];

export type ColorStop = {
  value: number;
  color: number[];
  label: string;
  tooltip: string;
};

export const forestLossColorFunction = (value?: number) => {
  if (value === undefined || value === null) return MISSING_COLOR;
  const color = forestLossColorBreaks.find((d) => value < d.value)?.color;
  return color || MISSING_COLOR;
};
export const riskScoreColorFunction = (value?: number) => {
  if (value === undefined || value === null) return MISSING_COLOR;
  const color = riskScoreScheme.find((d) => value <= d.value)?.color;
  return color || MISSING_COLOR;
};

export const colorFunctions = {
  forestLoss: {
    colorFunction: forestLossColorFunction,
    scale: forestLossColorBreaks,
  },
  riskScore: {
    colorFunction: riskScoreColorFunction,
    scale: riskScoreScheme
  }
} as const;
