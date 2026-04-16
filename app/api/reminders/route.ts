import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendReminderEmail } from "@/lib/email";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    console.error("[reminders] CRON_SECRET is not set — refusing to run");
    return NextResponse.json({ error: "Server misconfiguration" }, { status: 500 });
  }

  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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
    const timeMatches = s.times.some((t) => t.startsWith(`${currentHour}:`));
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
    select: { id: true, email: true, locale: true },
  });
  const userMap = new Map(users.map((u) => [u.id, u]));

  // Deduplicate per medication, then send all in parallel
  const toSend = due.filter((schedule) => {
    const userId = schedule.medication.userId;
    const dedupKey = `${userId}:${schedule.medicationId}`;
    if (dueMedIds.has(dedupKey)) return false;
    dueMedIds.add(dedupKey);
    return true;
  });

  const results = await Promise.allSettled(
    toSend.map(async (schedule) => {
      const user = userMap.get(schedule.medication.userId);
      if (!user?.email) throw new Error("No email");

      await sendReminderEmail({
        to: user.email,
        medicationName: schedule.medication.name,
        dosage: schedule.medication.dosage,
        locale: user.locale,
      });
    })
  );

  const sent = results.filter((r) => r.status === "fulfilled").length;
  const errors = results
    .map((r, i) =>
      r.status === "rejected"
        ? `medication:${toSend[i].medicationId} — ${r.reason instanceof Error ? r.reason.message : "unknown"}`
        : null
    )
    .filter(Boolean) as string[];

  return NextResponse.json({ sent, errors: errors.length ? errors : undefined });
}
