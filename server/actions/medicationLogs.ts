'use server';

import { MedicationStatus } from '@/generated/prisma/client';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { rateLimit } from '@/lib/rate-limit';
import { revalidatePath } from 'next/cache';
import { headers } from 'next/headers';

export async function logMedicationStatus(
  medicationId: string,
  status: MedicationStatus,
) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }

  const rl = await rateLimit(`medicationLogs:${session.user.id}`, 60, 60);
  if (rl.limited) throw new Error('Too many requests');

  const medication = await prisma.medication.findUnique({
    where: { id: medicationId },
    select: { userId: true },
  });

  if (!medication || medication.userId !== session.user.id) {
    throw new Error('Not found');
  }

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);

  await prisma.$transaction(
    async (tx) => {
      const existing = await tx.medicationLog.findFirst({
        where: {
          medicationId,
          scheduledFor: { gte: todayStart, lt: todayEnd },
        },
      });

      if (existing) {
        await tx.medicationLog.update({
          where: { id: existing.id },
          data: {
            status,
            takenAt: status === MedicationStatus.TAKEN ? now : null,
          },
        });
      } else {
        await tx.medicationLog.create({
          data: {
            medicationId,
            scheduledFor: now,
            takenAt: status === MedicationStatus.TAKEN ? now : null,
            status,
          },
        });
      }
    },
    { isolationLevel: 'Serializable' },
  );

  revalidatePath('/');
  revalidatePath('/medications');
}
