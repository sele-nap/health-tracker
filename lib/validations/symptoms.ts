import { z } from "zod";

export const symptomLogSchema = z.object({
  loggedAt: z.string().min(1, "Date is required"),
  overallMood: z.coerce.number().int().min(1).max(10).optional(),
  energyLevel: z.coerce.number().int().min(1).max(10).optional(),
  sleepHours: z.coerce.number().min(0).max(24).optional(),
  sleepQuality: z.coerce.number().int().min(1).max(10).optional(),
  stressLevel: z.coerce.number().int().min(1).max(10).optional(),
  notes: z.string().max(2000).optional(),
});

export type SymptomLogInput = z.infer<typeof symptomLogSchema>;
