"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { MedicationStatus } from "@/generated/prisma/client";
import { rateLimit } from "@/lib/rate-limit";

export async function logMedicationStatus(
  medicationId: string,
  status: MedicationStatus
) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const rl = rateLimit(`medicationLogs:${session.user.id}`, 60, 60);
  if (rl.limited) throw new Error("Too many requests");

  const medication = await prisma.medication.findUnique({
    where: { id: medicationId },
    select: { userId: true },
  });

  if (!medication || medication.userId !== session.user.id) {
    throw new Error("Not found");
  }

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);

  const existing = await prisma.medicationLog.findFirst({
    where: {
      medicationId,
      scheduledFor: { gte: todayStart, lt: todayEnd },
    },
  });

  if (existing) {
    await prisma.medicationLog.update({
      where: { id: existing.id },
      data: {
        status,
        takenAt: status === MedicationStatus.TAKEN ? now : null,
      },
    });
  } else {
    await prisma.medicationLog.create({
      data: {
        medicationId,
        scheduledFor: now,
        takenAt: status === MedicationStatus.TAKEN ? now : null,
        status,
      },
    });
  }

  revalidatePath("/");
  revalidatePath("/medications");
}
