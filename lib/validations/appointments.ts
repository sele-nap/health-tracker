import { z } from 'zod';

export const SPECIALTIES = [
  'general practice',
  'rheumatology',
  'dermatology',
  'cardiology',
  'neurology',
  'psychiatry',
  'psychology',
  'endocrinology',
  'gastroenterology',
  'pulmonology',
  'nephrology',
  'ophthalmology',
  'gynecology',
  'immunology',
  'hematology',
  'other',
] as const;

export type Specialty = (typeof SPECIALTIES)[number];

export const appointmentSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  doctorName: z.string().max(200).optional(),
  specialty: z.enum(SPECIALTIES).optional(),
  location: z.string().max(300).optional(),
  scheduledAt: z
    .string()
    .min(1, 'Date and time are required')
    .refine((v) => !isNaN(Date.parse(v)), 'Invalid date'),
  durationMin: z.coerce.number().int().min(1).max(480).optional(),
  purpose: z.string().max(1000).optional(),
});

export type AppointmentInput = z.infer<typeof appointmentSchema>;
