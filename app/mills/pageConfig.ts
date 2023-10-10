export const basicStatsConfig = (
  millCount: number | null,
  brandCount: number | null,
  countryCount: number | null,
  companyCount: number | null
) => {
  const formatter = new Intl.NumberFormat("en-US", {});
  const stats = [];
  if (brandCount !== null) {
    stats.push({
      title: "Brands",
      stat: formatter.format(brandCount),
      className: "",
    });
  }
  if (millCount !== null) {
    stats.push({
      title: "Mills",
      stat: formatter.format(millCount),
      className: "",
    });
  }
  if (countryCount !== null) {
    stats.push({
      title: "Countries",
      stat: formatter.format(countryCount),
      className: "",
    });
  }
  if (companyCount !== null) {
    stats.push({
      title: "Suppliers",
      stat: formatter.format(companyCount),
      className: "",
    });
  }
  return stats;
};

export const forestStatsConfig = (
  totalForestArea: number | null,
  totalForestLoss: number | null,
  totalArea: number | null,
) => {
  const formatter = new Intl.NumberFormat("en-US", {});
  const stats = [];
  if (totalArea !== null) {
    stats.push({
      title: "Total Area (km2)",
      stat: formatter.format(totalArea),
      className: "",
    });
  if (totalForestArea !== null) {
    stats.push({
      title: "Total Forest Area (km2)",
      stat: formatter.format(totalForestArea),
      className: "",
    });
  }
  if (totalForestLoss !== null) {
    stats.push({
      title: "Total Forest Los (km2)",
      stat: formatter.format(totalForestLoss),
      className: "text-error",
    });
    if (totalForestArea !== null) {
      stats.push({
        title: "Percent Forest Loss",
        stat: formatter.format((totalArea - totalForestArea)/totalForestArea*100) + "%",
        className: "",
      });
    }
  }
  }
  return stats;
}

export const rspoStatsConfig = (
  rspoCertified: number | null,
  notRspoCertified: number | null,
) => {
  const formatter = new Intl.NumberFormat("en-US", {});
  const stats = [];
  if (rspoCertified !== null) {
    stats.push({
      title: "RSPO Certified",
      stat: formatter.format(rspoCertified),
      className: "text-success",
    });
  }
  if (notRspoCertified !== null) {
    stats.push({
      title: "Not RSPO Certified",
      stat: formatter.format(notRspoCertified),
      className: "text-error",
    });
  }
  return stats;
}