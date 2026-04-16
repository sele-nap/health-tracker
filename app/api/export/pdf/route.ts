import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { decryptIfPresent } from "@/lib/crypto";
import { getT } from "@/lib/i18n";
import { rateLimit } from "@/lib/rate-limit";
import { renderToBuffer } from "@react-pdf/renderer";
import { HealthReportDocument } from "@/components/pdf/HealthReportDocument";
import React from "react";

export async function GET() {
  const [session, tr] = await Promise.all([
    auth.api.getSession({ headers: await headers() }),
    getT(),
  ]);

  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 });
  }

  const rl = await rateLimit(`pdf:${session.user.id}`, 5, 60);
  if (rl.limited) {
    return new Response("Too many requests", {
      status: 429,
      headers: { "Retry-After": String(rl.retryAfter) },
    });
  }

  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const [medications, symptomLogs, upcomingAppointments] = await Promise.all([
    prisma.medication.findMany({
      where: { userId: session.user.id, isActive: true },
      orderBy: { name: "asc" },
      select: {
        name: true,
        dosage: true,
        form: true,
        prescribedBy: true,
        startDate: true,
        instructions: true,
      },
    }),
    prisma.symptomLog.findMany({
      where: {
        userId: session.user.id,
        loggedAt: { gte: thirtyDaysAgo },
      },
      orderBy: { loggedAt: "desc" },
      select: {
        loggedAt: true,
        overallMood: true,
        energyLevel: true,
        stressLevel: true,
        sleepHours: true,
        notes: true,
      },
    }),
    prisma.appointment.findMany({
      where: {
        userId: session.user.id,
        status: "UPCOMING",
        scheduledAt: { gte: now },
      },
      orderBy: { scheduledAt: "asc" },
      select: {
        title: true,
        doctorName: true,
        specialty: true,
        scheduledAt: true,
        purpose: true,
      },
    }),
  ]);

  const decryptedMeds = medications.map((m) => ({
    ...m,
    prescribedBy: decryptIfPresent(m.prescribedBy),
    instructions: decryptIfPresent(m.instructions),
  }));

  const decryptedLogs = symptomLogs.map((l) => ({
    ...l,
    notes: decryptIfPresent(l.notes),
  }));

  const decryptedAppts = upcomingAppointments.map((a) => ({
    ...a,
    doctorName: decryptIfPresent(a.doctorName),
  }));

  const element = React.createElement(HealthReportDocument, {
    generatedAt: now,
    userName: session.user.name ?? null,
    medications: decryptedMeds,
    symptomLogs: decryptedLogs,
    upcomingAppointments: decryptedAppts,
    tr,
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const buffer = await renderToBuffer(element as any);

  const filename = `health-report-${now.toISOString().slice(0, 10)}.pdf`;

  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
