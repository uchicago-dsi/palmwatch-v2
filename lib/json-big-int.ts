/** JSON.stringify that preserves numbers but stringifies bigint (Arquero edge cases). */
export function stringifyForPrecompute(value: unknown): string {
  return JSON.stringify(value, (_k, v) =>
    typeof v === "bigint" ? v.toString() : v
  );
}
