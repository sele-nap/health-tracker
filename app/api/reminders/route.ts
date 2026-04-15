import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendReminderEmail } from "@/lib/email";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = req.headers.get("authorization");
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const now = new Date();
  const currentHour = now.getUTCHours().toString().padStart(2, "0");
  const currentDay = now.getUTCDay();

  const schedules = await prisma.reminderSchedule.findMany({
    where: { reminderEnabled: true },
    include: {
      medication: {
        select: { name: true, dosage: true, userId: true, isActive: true },
      },
    },
  });

  const dueMedIds = new Set<string>();
  const due = schedules.filter((s) => {
    if (!s.medication.isActive) return false;
    const timeMatches = s.times.some((t) => t.startsWith(currentHour));
    if (!timeMatches) return false;
    if (s.frequency === "weekly" && !s.daysOfWeek.includes(currentDay)) return false;
    return true;
  });

  if (due.length === 0) {
    return NextResponse.json({ sent: 0 });
  }

  const userIds = [...new Set(due.map((s) => s.medication.userId))];
  const users = await prisma.user.findMany({
    where: { id: { in: userIds } },
    select: { id: true, email: true },
  });
  const userMap = new Map(users.map((u) => [u.id, u]));

  let sent = 0;
  const errors: string[] = [];

  for (const schedule of due) {
    const userId = schedule.medication.userId;
    if (dueMedIds.has(`${userId}:${schedule.medicationId}`)) continue;
    dueMedIds.add(`${userId}:${schedule.medicationId}`);

    const user = userMap.get(userId);
    if (!user?.email) continue;

    try {
      await sendReminderEmail({
        to: user.email,
        medicationName: schedule.medication.name,
        dosage: schedule.medication.dosage,
      });
      sent++;
    } catch (err) {
      errors.push(`${user.email}: ${err instanceof Error ? err.message : "unknown"}`);
    }
  }

  return NextResponse.json({ sent, errors: errors.length ? errors : undefined });
}
