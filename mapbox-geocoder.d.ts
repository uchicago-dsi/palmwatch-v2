declare module "@mapbox/mapbox-gl-geocoder" {
  // biome-ignore lint/suspicious/noExplicitAny: minimal third-party module shim
  const MapboxGeocoder: any;
  export type GeocoderOptions = Record<string, unknown>;
  export default MapboxGeocoder;
}
