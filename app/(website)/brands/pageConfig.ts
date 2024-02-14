export const getStatConfig = (
  brandCount: number | null,
  countryCount: number | null,
  millCount: number | null,
  companyCount: number | null
) => {
  const formatter = new Intl.NumberFormat("en-US", {});
  const stats = [];
  if (brandCount !== null) {
    stats.push({
      title: "Brands",
      stat: formatter.format(brandCount),
      className: "text-error",
    });
  }
  if (millCount !== null) {
    stats.push({
      title: "Mills",
      stat: formatter.format(millCount),
      className: "text-error",
    });
  }
  if (countryCount !== null) {
    stats.push({
      title: "Countries",
      stat: formatter.format(countryCount),
      className: "text-error",
    });
  }
  if (companyCount !== null) {
    stats.push({
      title: "Mill Owners",
      stat: formatter.format(companyCount),
      className: "text-error",
    });
  }
  return stats;
};