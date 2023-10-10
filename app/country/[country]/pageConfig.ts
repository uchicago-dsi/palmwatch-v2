export const getStats = (
  uniqueMills: number | string | null,
  averageCurrentRisk: number | string | null,
  totalForestLoss: number | string | null,
) => {
  const formatter = new Intl.NumberFormat("en-US", {});
  const stats = [];
  if (uniqueMills !== null) {
    stats.push({
      title: "Mills",
      stat: formatter.format(+uniqueMills),
      className: "text-error",
    });
  }
  if (averageCurrentRisk !== null) {
    stats.push({
      title: "Average Risk Score",
      stat: formatter.format(+averageCurrentRisk),
      className: "text-error",
    });
  }
  if (totalForestLoss !== null) {
    stats.push({
      title: "Total Forest Loss (km2)",
      stat: formatter.format(+totalForestLoss),
      className: "text-error",
    });
  }
  return stats;
};
