"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { encryptIfPresent } from "@/lib/crypto";
import { symptomLogSchema } from "@/lib/validations/symptoms";

export type SymptomLogState = {
  errors?: {
    loggedAt?: string[];
    overallMood?: string[];
    energyLevel?: string[];
    sleepHours?: string[];
    sleepQuality?: string[];
    stressLevel?: string[];
    notes?: string[];
    _form?: string[];
  };
};

export async function createSymptomLog(
  _prevState: SymptomLogState,
  formData: FormData
): Promise<SymptomLogState> {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user?.id) {
    return { errors: { _form: ["Unauthorized"] } };
  }

  const raw = {
    loggedAt: formData.get("loggedAt"),
    overallMood: formData.get("overallMood") || undefined,
    energyLevel: formData.get("energyLevel") || undefined,
    sleepHours: formData.get("sleepHours") || undefined,
    sleepQuality: formData.get("sleepQuality") || undefined,
    stressLevel: formData.get("stressLevel") || undefined,
    notes: formData.get("notes") || undefined,
  };

  const parsed = symptomLogSchema.safeParse(raw);

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  const { loggedAt, overallMood, energyLevel, sleepHours, sleepQuality, stressLevel, notes } =
    parsed.data;

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
    },
  });

  redirect("/symptoms");
}

export async function deleteSymptomLog(logId: string) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user?.id) throw new Error("Unauthorized");

  const log = await prisma.symptomLog.findUnique({
    where: { id: logId },
    select: { userId: true },
  });

  if (!log || log.userId !== session.user.id) throw new Error("Not found");

  await prisma.symptomLog.delete({ where: { id: logId } });

  revalidatePath("/symptoms");
  revalidatePath("/");
}
