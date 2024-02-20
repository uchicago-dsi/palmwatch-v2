import { unparse } from "papaparse";

const columnMappings = {
  "risk_score_current": "Current Deforestation Score",
  "risk_score_past": "Past Deforestation Score",
  "risk_score_future": "Future Risk Score"
}

export const renameOutputColumns = (data: string) => {
  for (const key in columnMappings) {
    // @ts-ignore
    data = data.replace(new RegExp(key, 'g'), columnMappings[key])
  }
  return data
}
export const cleanUnparse = (data:any) => {
  return renameOutputColumns(unparse(data))
}
export const cleanLossData = (data:any) => (
  data.map((row: any) => ({
    'Year': row.year,
    'First Quartile Score': Math.round(100*row['q0.25'])/100,
    'Median Score': Math.round(100*row['q0.5'])/100,
    'Third Quartile Score': Math.round(100*row['q0.75'])/100,
  }))
)