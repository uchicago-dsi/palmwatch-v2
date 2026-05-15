/** CSV / GeoJSON download targets for a consumer brand detail page. */
export function getBrandDataDownloadLinks(brand: string) {
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
      label: "Mill Owners Used (CSV)",
      href: `/api/brand/${brand}?output=owners`,
    },
  ];
}
