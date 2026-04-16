import { z } from "zod";

export const conditionSchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  diagnosedAt: z.string().refine((v) => !v || !isNaN(Date.parse(v)), "Invalid date").optional(),
});

export type ConditionInput = z.infer<typeof conditionSchema>;
