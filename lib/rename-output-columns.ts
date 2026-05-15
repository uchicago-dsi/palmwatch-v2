import { unparse } from "papaparse";

export type LossTimeseriesRow = {
  year: number;
  "q0.25": number;
  "q0.5": number;
  "q0.75": number;
};

const columnMappings: Record<string, string> = {
  risk_score_current: "Current Deforestation Score",
  risk_score_past: "Past Deforestation Score",
  risk_score_future: "Future Risk Score",
};

export const renameOutputColumns = (data: string) => {
  let out = data;
  for (const key of Object.keys(columnMappings)) {
    const label = columnMappings[key];
    out = out.replace(new RegExp(key, "g"), label);
  }
  return out;
};
export const cleanUnparse = (data: unknown) =>
  renameOutputColumns(unparse(data as never));
export const cleanLossData = (data: LossTimeseriesRow[]) =>
  data.map((row) => ({
    Year: row.year,
    "First Quartile Score": Math.round(100 * row["q0.25"]) / 100,
    "Median Score": Math.round(100 * row["q0.5"]) / 100,
    "Third Quartile Score": Math.round(100 * row["q0.75"]) / 100,
  }));
