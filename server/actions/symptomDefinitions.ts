'use server';

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { rateLimit } from '@/lib/rate-limit';
import { revalidatePath } from 'next/cache';
import { headers } from 'next/headers';

export async function createSymptomDefinition(
  conditionId: string,
  name: string,
  unit?: string,
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) throw new Error('Unauthorized');

  const rl = await rateLimit(`symptomDefs:write:${session.user.id}`, 20, 60);
  if (rl.limited) throw new Error('Too many requests');

  const condition = await prisma.userCondition.findUnique({
    where: { id: conditionId },
    select: { userId: true },
  });
  if (!condition || condition.userId !== session.user.id)
    throw new Error('Not found');

  const trimmedName = name.trim().slice(0, 100);
  if (!trimmedName) throw new Error('Name is required');

  await prisma.symptomDefinition.create({
    data: {
      conditionId,
      name: trimmedName,
      unit: unit?.trim().slice(0, 20) || null,
    },
  });

  revalidatePath(`/conditions/${conditionId}`);
  revalidatePath('/conditions');
}

export async function deleteSymptomDefinition(
  definitionId: string,
  conditionId: string,
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) throw new Error('Unauthorized');

  const rl = await rateLimit(`symptomDefs:delete:${session.user.id}`, 10, 60);
  if (rl.limited) throw new Error('Too many requests');

  const def = await prisma.symptomDefinition.findUnique({
    where: { id: definitionId },
    include: { condition: { select: { userId: true } } },
  });
  if (!def || def.condition.userId !== session.user.id)
    throw new Error('Not found');

  await prisma.symptomDefinition.delete({ where: { id: definitionId } });
  revalidatePath(`/conditions/${conditionId}`);
  revalidatePath('/conditions');
}
