import { fullYearRange } from "@/config/years";
import type { UmlData } from "@/domain";

export const sumForestLoss = (data: UmlData) => {
  const sum = fullYearRange.reduce((acc, year) => {
    const key = `treeloss_km_${year}` as keyof UmlData;
    const loss = data[key];
    if (typeof loss === "number" && loss) {
      return acc + loss;
    }
    return acc;
  }, 0);
  return sum;
};
