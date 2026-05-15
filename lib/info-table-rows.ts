/** Narrow JSON / unknown table payloads to row objects for `InfoTable` / charts. */
export function toInfoTableRows(value: unknown): Record<string, unknown>[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.filter(
    (row): row is Record<string, unknown> =>
      typeof row === "object" && row !== null && !Array.isArray(row)
  );
}
