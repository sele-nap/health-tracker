"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";

export async function createReminderSchedule(
  medicationId: string,
  frequency: "daily" | "weekly",
  times: string[],
  daysOfWeek: number[]
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) throw new Error("Unauthorized");

  const rl = rateLimit(`reminders:write:${session.user.id}`, 20, 60);
  if (rl.limited) throw new Error("Too many requests");

  const med = await prisma.medication.findUnique({
    where: { id: medicationId },
    select: { userId: true },
  });
  if (!med || med.userId !== session.user.id) throw new Error("Not found");

  const validTimes = times
    .map((t) => t.trim())
    .filter((t) => /^\d{2}:\d{2}$/.test(t))
    .slice(0, 6);

  if (validTimes.length === 0) throw new Error("At least one time is required");

  const validDays =
    frequency === "weekly"
      ? daysOfWeek.filter((d) => d >= 0 && d <= 6)
      : [];

  await prisma.reminderSchedule.create({
    data: {
      medicationId,
      frequency,
      times: validTimes,
      daysOfWeek: validDays,
      reminderEnabled: true,
    },
  });

  revalidatePath(`/medications/${medicationId}`);
}

export async function deleteReminderSchedule(scheduleId: string, medicationId: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) throw new Error("Unauthorized");

  const rl = rateLimit(`reminders:delete:${session.user.id}`, 10, 60);
  if (rl.limited) throw new Error("Too many requests");

  const schedule = await prisma.reminderSchedule.findUnique({
    where: { id: scheduleId },
    include: { medication: { select: { userId: true } } },
  });
  if (!schedule || schedule.medication.userId !== session.user.id)
    throw new Error("Not found");

  await prisma.reminderSchedule.delete({ where: { id: scheduleId } });
  revalidatePath(`/medications/${medicationId}`);
}

export async function toggleReminderEnabled(scheduleId: string, medicationId: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) throw new Error("Unauthorized");

  const rl = rateLimit(`reminders:write:${session.user.id}`, 30, 60);
  if (rl.limited) throw new Error("Too many requests");

  const schedule = await prisma.reminderSchedule.findUnique({
    where: { id: scheduleId },
    include: { medication: { select: { userId: true } } },
  });
  if (!schedule || schedule.medication.userId !== session.user.id)
    throw new Error("Not found");

  await prisma.reminderSchedule.update({
    where: { id: scheduleId },
    data: { reminderEnabled: !schedule.reminderEnabled },
  });
  revalidatePath(`/medications/${medicationId}`);
}
