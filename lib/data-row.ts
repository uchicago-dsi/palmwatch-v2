import type { UmlData } from "@/domain";

/** Dynamic column lookup on a typed UML row (e.g. `treeloss_km_YYYY`). */
export function umlRowField(row: UmlData, key: string): unknown {
  return (row as unknown as Record<string, unknown>)[key];
}

export function umlRowNumber(row: UmlData, key: string): number {
  return Number(umlRowField(row, key)) || 0;
}

/** Arquero `.objects()` and other untyped row batches at boundaries. */
export function castRows<T>(rows: Record<string, unknown>[]): T[] {
  return rows as unknown as T[];
}

/** Typed rows from an Arquero table `.objects()` call. */
export function arqueroObjects<T>(table: { objects(): object[] }): T[] {
  return castRows<T>(table.objects() as Record<string, unknown>[]);
}
