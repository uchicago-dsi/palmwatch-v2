import { fullYearRange } from "@/config/years";
import { UmlData } from "./dataTypes";

export const sumForestLoss = (data: UmlData) => {
  const sum = fullYearRange.reduce((acc, year) => {
    // @ts-ignore
    const loss = data[`treeloss_km_${year}`];
    if (loss) {
      return acc + loss;
    }
    return acc;
  }, 0);
  return sum;
}