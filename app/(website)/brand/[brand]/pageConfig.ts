export const getStats = (
  averageCurrentRisk: number | null,
  uniqueMills: number | null,
  uniqueCountries: number | null,
  uniqueSuppliers: number | null
) => {
  const formatter = new Intl.NumberFormat("en-US", {});
  const stats = [];
  if (averageCurrentRisk !== null) {
    stats.push({
      title: "Average Current Risk Score",
      stat: formatter.format(averageCurrentRisk),
      className: "text-error",
      description: "Mean Risk Score of mills used by this brand (2020-2022)",
    });
  }
  if (uniqueMills !== null) {
    stats.push({
      title: "Mills",
      stat: formatter.format(uniqueMills),
      className: "text-error",
    });
  }
  if (uniqueCountries !== null) {
    stats.push({
      title: "Countries",
      stat: formatter.format(uniqueCountries),
      className: "text-error",
    });
  }
  if (uniqueSuppliers !== null) {
    stats.push({
      title: "Suppliers",
      stat: formatter.format(uniqueSuppliers),
      className: "text-error",
    });
  }
  return stats;
};

export const getDataDownload = (
  brand: string
) => {
  return [
    {
      label: "Geospatial Data (GeoJSON)",
      href: `/api/brand/${brand}?output=geo`,
    },
    {
      label: "Forest Loss Over Time (CSV)",
      href: `/api/brand/${brand}?output=loss`,
    },
    {
      label: "Mills Used (CSV)",
      href: `/api/brand/${brand}?output=mills`,
    },
    {
      label: "Suppliers Used (CSV)",
      href: `/api/brand/${brand}?output=suppliers`,
    }
  ]
}