export const getStats = (
  deforestation2022: number | string | null,
  currentRisk: number | string | null,
  pastRisk: number | string | null,
  futureRisk: number | string | null,
) => {
  const formatter = new Intl.NumberFormat("en-US", {});
  const stats = [];
  if (deforestation2022 !== null) {
    stats.push({
      title: "Forest Loss KM2 (2022)",
      stat: formatter.format(+deforestation2022),
      className: "text-error",
    });
  }
  if (currentRisk !== null) {
    stats.push({
      title: "Risk Score",
      stat: formatter.format(+currentRisk),
      className: "text-error",
    });
  }
  if (pastRisk !== null) {
    stats.push({
      title: "Past Risk Score",
      stat: formatter.format(+pastRisk),
      className: "text-error",
    });
  }
  if (futureRisk !== null) {
    stats.push({
      title: "Future Risk Score",
      stat: formatter.format(+futureRisk),
      className: "text-error",
    });
  }
  return stats;
};
