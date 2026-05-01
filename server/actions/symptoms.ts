'use server';

import { auth } from '@/lib/auth';
import { encryptIfPresent } from '@/lib/crypto';
import { prisma } from '@/lib/prisma';
import { rateLimit } from '@/lib/rate-limit';
import { symptomLogSchema } from '@/lib/validations/symptoms';
import type { SymptomLogState } from '@/types/actions';
import { revalidatePath } from 'next/cache';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

export type { SymptomLogState };

function extractCustomEntries(
  formData: FormData,
  allowedDefinitionIds: Set<string>,
) {
  const entries: {
    symptomDefinitionId: string;
    severity: number;
    value: string;
  }[] = [];
  for (const [key, val] of formData.entries()) {
    if (key.startsWith('custom_') && typeof val === 'string' && val !== '') {
      const definitionId = key.slice('custom_'.length);
      if (!allowedDefinitionIds.has(definitionId)) continue;
      const severity = Math.min(10, Math.max(1, Math.round(Number(val))));
      if (!isNaN(severity)) {
        entries.push({
          symptomDefinitionId: definitionId,
          severity,
          value: String(severity),
        });
      }
    }
  }
  return entries;
}

async function getAllowedDefinitionIds(userId: string): Promise<Set<string>> {
  const definitions = await prisma.symptomDefinition.findMany({
    where: { condition: { userId } },
    select: { id: true },
  });
  return new Set(definitions.map((d) => d.id));
}

export async function createSymptomLog(
  _prevState: SymptomLogState,
  formData: FormData,
): Promise<SymptomLogState> {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user?.id) {
    return { errors: { _form: ['Unauthorized'] } };
  }

  const rl = await rateLimit(`symptoms:write:${session.user.id}`, 20, 60);
  if (rl.limited) {
    return {
      errors: { _form: ['Too many requests. Please try again shortly.'] },
    };
  }

  const raw = {
    loggedAt: formData.get('loggedAt'),
    overallMood: formData.get('overallMood') || undefined,
    energyLevel: formData.get('energyLevel') || undefined,
    sleepHours: formData.get('sleepHours') || undefined,
    sleepQuality: formData.get('sleepQuality') || undefined,
    stressLevel: formData.get('stressLevel') || undefined,
    notes: formData.get('notes') || undefined,
  };

  const parsed = symptomLogSchema.safeParse(raw);

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  const {
    loggedAt,
    overallMood,
    energyLevel,
    sleepHours,
    sleepQuality,
    stressLevel,
    notes,
  } = parsed.data;

  const allowedDefinitionIds = await getAllowedDefinitionIds(session.user.id);
  const customEntries = extractCustomEntries(formData, allowedDefinitionIds);

  await prisma.symptomLog.create({
    data: {
      userId: session.user.id,
      loggedAt: new Date(loggedAt),
      overallMood: overallMood ?? null,
      energyLevel: energyLevel ?? null,
      sleepHours: sleepHours ?? null,
      sleepQuality: sleepQuality ?? null,
      stressLevel: stressLevel ?? null,
      notes: encryptIfPresent(notes ?? null),
      entries: {
        create: customEntries,
      },
    },
  });

  redirect('/symptoms');
}

export async function updateSymptomLog(
  logId: string,
  _prevState: SymptomLogState,
  formData: FormData,
): Promise<SymptomLogState> {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user?.id) {
    return { errors: { _form: ['Unauthorized'] } };
  }

  const rl = await rateLimit(`symptoms:write:${session.user.id}`, 20, 60);
  if (rl.limited) {
    return {
      errors: { _form: ['Too many requests. Please try again shortly.'] },
    };
  }

  const existing = await prisma.symptomLog.findUnique({
    where: { id: logId },
    select: { userId: true },
  });

  if (!existing || existing.userId !== session.user.id) {
    return { errors: { _form: ['Not found'] } };
  }

  const raw = {
    loggedAt: formData.get('loggedAt'),
    overallMood: formData.get('overallMood') || undefined,
    energyLevel: formData.get('energyLevel') || undefined,
    sleepHours: formData.get('sleepHours') || undefined,
    sleepQuality: formData.get('sleepQuality') || undefined,
    stressLevel: formData.get('stressLevel') || undefined,
    notes: formData.get('notes') || undefined,
  };

  const parsed = symptomLogSchema.safeParse(raw);

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  const {
    loggedAt,
    overallMood,
    energyLevel,
    sleepHours,
    sleepQuality,
    stressLevel,
    notes,
  } = parsed.data;

  const allowedDefinitionIds = await getAllowedDefinitionIds(session.user.id);
  const customEntries = extractCustomEntries(formData, allowedDefinitionIds);

  await prisma.$transaction(async (tx) => {
    await tx.symptomLogEntry.deleteMany({ where: { symptomLogId: logId } });
    await tx.symptomLog.update({
      where: { id: logId },
      data: {
        loggedAt: new Date(loggedAt),
        overallMood: overallMood ?? null,
        energyLevel: energyLevel ?? null,
        sleepHours: sleepHours ?? null,
        sleepQuality: sleepQuality ?? null,
        stressLevel: stressLevel ?? null,
        notes: encryptIfPresent(notes ?? null),
      },
    });
    if (customEntries.length > 0) {
      await tx.symptomLogEntry.createMany({
        data: customEntries.map((e) => ({ ...e, symptomLogId: logId })),
      });
    }
  });

  revalidatePath('/symptoms');
  redirect('/symptoms');
}

export async function deleteSymptomLog(logId: string) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user?.id) throw new Error('Unauthorized');

  const rl = await rateLimit(`symptoms:delete:${session.user.id}`, 10, 60);
  if (rl.limited) throw new Error('Too many requests');

  const log = await prisma.symptomLog.findUnique({
    where: { id: logId },
    select: { userId: true },
  });

  if (!log || log.userId !== session.user.id) throw new Error('Not found');

  await prisma.symptomLog.delete({ where: { id: logId } });

  revalidatePath('/symptoms');
  revalidatePath('/');
}
