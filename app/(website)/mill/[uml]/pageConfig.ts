import { maxYear } from "@/config/years";

export const getStats = (
  latestYearForestLossKm2: number | string | null,
  currentRisk: number | string | null,
  pastRisk: number | string | null,
  futureRisk: number | string | null
) => {
  const formatter = new Intl.NumberFormat("en-US", {});
  const stats = [];
  if (latestYearForestLossKm2 !== null) {
    stats.push({
      title: `Forest Loss KM2 (${maxYear})`,
      stat: formatter.format(+latestYearForestLossKm2),
      className: "text-error",
    });
  }
  if (currentRisk !== null) {
    stats.push({
      title: "Recent Deforestation Score",
      stat: formatter.format(+currentRisk),
      className: "text-error",
    });
  }
  if (pastRisk !== null) {
    stats.push({
      title: "Past Deforestation Score",
      stat: formatter.format(+pastRisk),
      className: "text-error",
    });
  }
  if (futureRisk !== null) {
    stats.push({
      title: "Future Deforestation Score",
      stat: formatter.format(+futureRisk),
      className: "text-error",
    });
  }
  return stats;
};
