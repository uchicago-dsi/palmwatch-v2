import { z } from "zod";

/** Minimal shape for `GET /api/mill/:uml` JSON. */
export const millApiPayloadSchema = z.object({
  info: z.array(z.unknown()),
  brands: z.array(z.unknown()),
});

export type MillApiPayload = z.infer<typeof millApiPayloadSchema>;
