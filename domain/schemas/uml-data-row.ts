import { z } from "zod";
import type { UmlData } from "@/domain/uml-data";

function isUmlDataRow(val: unknown): val is UmlData {
  if (typeof val !== "object" || val === null) {
    return false;
  }
  const row = val as Record<string, unknown>;
  return typeof row["UML ID"] === "string" && typeof row.Country === "string";
}

/** Minimal runtime check for mill rows at JSON boundaries. */
export const umlDataRowSchema = z.custom<UmlData>(isUmlDataRow);
