import { z } from "zod";

export const conditionSchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  diagnosedAt: z.string().optional(),
});

export type ConditionInput = z.infer<typeof conditionSchema>;
