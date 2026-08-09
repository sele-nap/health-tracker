'use server';

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { rateLimit } from '@/lib/rate-limit';
import {
  createSymptomDefinitionSchema,
  deleteSymptomDefinitionSchema,
} from '@/lib/validations/symptomDefinitions';
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

  const parsed = createSymptomDefinitionSchema.safeParse({
    conditionId,
    name,
    unit,
  });
  if (!parsed.success)
    throw new Error(parsed.error.issues[0]?.message ?? 'Invalid input');

  const condition = await prisma.userCondition.findUnique({
    where: { id: parsed.data.conditionId },
    select: { userId: true },
  });
  if (!condition || condition.userId !== session.user.id)
    throw new Error('Not found');

  await prisma.symptomDefinition.create({
    data: {
      conditionId: parsed.data.conditionId,
      name: parsed.data.name,
      unit: parsed.data.unit || null,
    },
  });

  revalidatePath(`/conditions/${parsed.data.conditionId}`);
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

  const parsed = deleteSymptomDefinitionSchema.safeParse({
    definitionId,
    conditionId,
  });
  if (!parsed.success) throw new Error('Invalid input');

  const def = await prisma.symptomDefinition.findUnique({
    where: { id: parsed.data.definitionId },
    include: { condition: { select: { userId: true } } },
  });
  if (!def || def.condition.userId !== session.user.id)
    throw new Error('Not found');

  await prisma.symptomDefinition.delete({
    where: { id: parsed.data.definitionId },
  });
  revalidatePath(`/conditions/${parsed.data.conditionId}`);
  revalidatePath('/conditions');
}
