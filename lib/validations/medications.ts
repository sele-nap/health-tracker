import { z } from "zod";

export const MEDICATION_FORMS = [
  "tablet",
  "capsule",
  "pill",
  "liquid",
  "injection",
  "patch",
  "cream",
  "inhaler",
  "drops",
  "other",
] as const;

export type MedicationForm = (typeof MEDICATION_FORMS)[number];

export const medicationSchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  dosage: z.string().min(1, "Dosage is required").max(100),
  form: z.enum(MEDICATION_FORMS).optional(),
  prescribedBy: z.string().max(200).optional(),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().optional(),
  instructions: z.string().max(2000).optional(),
});

export type MedicationInput = z.infer<typeof medicationSchema>;
