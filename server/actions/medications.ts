'use server';

import { auth } from '@/lib/auth';
import { encryptIfPresent } from '@/lib/crypto';
import { prisma } from '@/lib/prisma';
import { rateLimit } from '@/lib/rate-limit';
import { medicationSchema } from '@/lib/validations/medications';
import type { MedicationState } from '@/types/actions';
import { revalidatePath } from 'next/cache';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

export type { MedicationState };

export async function createMedication(
  _prevState: MedicationState,
  formData: FormData,
): Promise<MedicationState> {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user?.id) {
    return { errors: { _form: ['Unauthorized'] } };
  }

  const rl = await rateLimit(`medications:write:${session.user.id}`, 20, 60);
  if (rl.limited) {
    return {
      errors: { _form: ['Too many requests. Please try again shortly.'] },
    };
  }

  const raw = {
    name: formData.get('name'),
    dosage: formData.get('dosage'),
    form: formData.get('form') || undefined,
    prescribedBy: formData.get('prescribedBy') || undefined,
    startDate: formData.get('startDate'),
    endDate: formData.get('endDate') || undefined,
    instructions: formData.get('instructions') || undefined,
  };

  const parsed = medicationSchema.safeParse(raw);

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  const { name, dosage, form, prescribedBy, startDate, endDate, instructions } =
    parsed.data;

  if (endDate && new Date(endDate) < new Date(startDate)) {
    return { errors: { endDate: ['End date must be after start date'] } };
  }

  await prisma.medication.create({
    data: {
      userId: session.user.id,
      name,
      dosage,
      form: form ?? null,
      prescribedBy: encryptIfPresent(prescribedBy ?? null),
      startDate: new Date(startDate),
      endDate: endDate ? new Date(endDate) : null,
      instructions: encryptIfPresent(instructions ?? null),
      isActive: true,
    },
  });

  redirect('/medications');
}

export async function toggleMedicationActive(medicationId: string) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }

  const rl = await rateLimit(`medications:toggle:${session.user.id}`, 30, 60);
  if (rl.limited) throw new Error('Too many requests');

  const medication = await prisma.medication.findUnique({
    where: { id: medicationId },
    select: { userId: true, isActive: true },
  });

  if (!medication || medication.userId !== session.user.id) {
    throw new Error('Not found');
  }

  await prisma.medication.update({
    where: { id: medicationId },
    data: { isActive: !medication.isActive },
  });
}

export async function updateMedication(
  medicationId: string,
  _prevState: MedicationState,
  formData: FormData,
): Promise<MedicationState> {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user?.id) {
    return { errors: { _form: ['Unauthorized'] } };
  }

  const rl = await rateLimit(`medications:write:${session.user.id}`, 20, 60);
  if (rl.limited) {
    return {
      errors: { _form: ['Too many requests. Please try again shortly.'] },
    };
  }

  const existing = await prisma.medication.findUnique({
    where: { id: medicationId },
    select: { userId: true },
  });

  if (!existing || existing.userId !== session.user.id) {
    return { errors: { _form: ['Not found'] } };
  }

  const raw = {
    name: formData.get('name'),
    dosage: formData.get('dosage'),
    form: formData.get('form') || undefined,
    prescribedBy: formData.get('prescribedBy') || undefined,
    startDate: formData.get('startDate'),
    endDate: formData.get('endDate') || undefined,
    instructions: formData.get('instructions') || undefined,
  };

  const parsed = medicationSchema.safeParse(raw);

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  const { name, dosage, form, prescribedBy, startDate, endDate, instructions } =
    parsed.data;

  if (endDate && new Date(endDate) < new Date(startDate)) {
    return { errors: { endDate: ['End date must be after start date'] } };
  }

  await prisma.medication.update({
    where: { id: medicationId },
    data: {
      name,
      dosage,
      form: form ?? null,
      prescribedBy: encryptIfPresent(prescribedBy ?? null),
      startDate: new Date(startDate),
      endDate: endDate ? new Date(endDate) : null,
      instructions: encryptIfPresent(instructions ?? null),
    },
  });

  revalidatePath('/medications');
  redirect('/medications');
}

export async function deleteMedication(medicationId: string) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user?.id) throw new Error('Unauthorized');

  const rl = await rateLimit(`medications:delete:${session.user.id}`, 10, 60);
  if (rl.limited) throw new Error('Too many requests');

  const medication = await prisma.medication.findUnique({
    where: { id: medicationId },
    select: { userId: true },
  });

  if (!medication || medication.userId !== session.user.id)
    throw new Error('Not found');

  await prisma.medication.delete({ where: { id: medicationId } });

  revalidatePath('/medications');
  revalidatePath('/');
}
