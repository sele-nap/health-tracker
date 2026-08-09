import { z } from 'zod';

export const createSymptomDefinitionSchema = z.object({
  conditionId: z.string().min(1),
  name: z.string().trim().min(1, 'Name is required').max(100),
  unit: z.string().trim().max(20).optional(),
});

export type CreateSymptomDefinitionInput = z.infer<
  typeof createSymptomDefinitionSchema
>;

export const deleteSymptomDefinitionSchema = z.object({
  definitionId: z.string().min(1),
  conditionId: z.string().min(1),
});

export type DeleteSymptomDefinitionInput = z.infer<
  typeof deleteSymptomDefinitionSchema
>;
