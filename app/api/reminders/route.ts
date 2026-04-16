import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendReminderEmail } from "@/lib/email";

export const runtime = "nodejs";

function getLocalHHMM(timezone: string): string {
  const now = new Date();
  try {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).formatToParts(now);
    const hour = parts.find((p) => p.type === "hour")?.value ?? "00";
    const minute = parts.find((p) => p.type === "minute")?.value ?? "00";
    // Intl can return "24" for midnight on some platforms — normalise to "00"
    return `${hour === "24" ? "00" : hour}:${minute}`;
  } catch {
    const h = now.getUTCHours().toString().padStart(2, "0");
    const m = now.getUTCMinutes().toString().padStart(2, "0");
    return `${h}:${m}`;
  }
}

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
  const currentDay = now.getUTCDay();

  const schedules = await prisma.reminderSchedule.findMany({
    where: { reminderEnabled: true },
    include: {
      medication: {
        select: { name: true, dosage: true, userId: true, isActive: true },
      },
    },
  });

  if (schedules.length === 0) return NextResponse.json({ sent: 0 });

  const userIds = [...new Set(schedules.map((s) => s.medication.userId))];
  const users = await prisma.user.findMany({
    where: { id: { in: userIds } },
    select: { id: true, email: true, locale: true, timezone: true },
  });
  const userMap = new Map(users.map((u) => [u.id, u]));

  const userLocalTime = new Map<string, string>();
  for (const user of users) {
    userLocalTime.set(user.id, getLocalHHMM(user.timezone));
  }

  const dueMedIds = new Set<string>();
  const due = schedules.filter((s) => {
    if (!s.medication.isActive) return false;
    const userId = s.medication.userId;
    const localHHMM = userLocalTime.get(userId);
    if (!localHHMM) return false;

    const timeMatches = s.times.includes(localHHMM);
    if (!timeMatches) return false;

    if (s.frequency === "weekly") {
      const user = userMap.get(userId);
      const localDay = user
        ? new Intl.DateTimeFormat("en-US", {
            timeZone: user.timezone,
            weekday: "short",
          })
            .formatToParts(now)
            .find((p) => p.type === "weekday")
            ? new Date(
                new Intl.DateTimeFormat("en-US", { timeZone: user.timezone }).format(now)
              ).getDay()
            : currentDay
        : currentDay;
      if (!s.daysOfWeek.includes(localDay)) return false;
    }

    return true;
  });

  if (due.length === 0) return NextResponse.json({ sent: 0 });

  const toSend = due.filter((schedule) => {
    const dedupKey = `${schedule.medication.userId}:${schedule.medicationId}`;
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
