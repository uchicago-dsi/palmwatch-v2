import {
  cumulativeLossColorBreaks,
  cumulativeLossPctColorBreaks,
  forestLossColorBreaks,
  riskScoreScheme,
} from "@/config/map-schema";

const MISSING_COLOR = [0, 0, 0, 0];

export interface ColorStop {
  color: number[];
  label: string;
  tooltip: string;
  value: number;
}

export const forestLossColorFunction = (value?: number) => {
  if (value === undefined || value === null) {
    return MISSING_COLOR;
  }
  const color = forestLossColorBreaks.find((d) => value < d.value)?.color;
  return color || MISSING_COLOR;
};
export const riskScoreColorFunction = (value?: number) => {
  if (value === undefined || value === null) {
    return MISSING_COLOR;
  }
  const color = riskScoreScheme.find((d) => value <= d.value)?.color;
  return color || MISSING_COLOR;
};

export const cumulativeLossColorFunction = (value?: number) => {
  if (value === undefined || value === null) {
    return MISSING_COLOR;
  }
  const color = cumulativeLossColorBreaks.find((d) => value < d.value)?.color;
  return color || MISSING_COLOR;
};

export const cumulativeLossPctColorFunction = (value?: number) => {
  if (value === undefined || value === null) {
    return MISSING_COLOR;
  }
  const color = cumulativeLossPctColorBreaks.find(
    (d) => value < d.value
  )?.color;
  return color || MISSING_COLOR;
};

export const colorFunctions = {
  forestLoss: {
    colorFunction: forestLossColorFunction,
    scale: forestLossColorBreaks,
  },
  cumulativeLoss: {
    colorFunction: cumulativeLossColorFunction,
    scale: cumulativeLossColorBreaks,
  },
  cumulativeLossPct: {
    colorFunction: cumulativeLossPctColorFunction,
    scale: cumulativeLossPctColorBreaks,
  },
  riskScore: {
    colorFunction: riskScoreColorFunction,
    scale: riskScoreScheme,
  },
} as const;
