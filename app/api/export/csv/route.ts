import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { decryptIfPresent } from "@/lib/crypto";
import { rateLimit } from "@/lib/rate-limit";
import { toCsv } from "@/lib/csv";

export async function GET(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 });
  }

  const rl = rateLimit(`csv:${session.user.id}`, 10, 60);
  if (rl.limited) {
    return new Response("Too many requests", {
      status: 429,
      headers: { "Retry-After": String(rl.retryAfter) },
    });
  }

  const { searchParams } = new URL(request.url);
  const sheet = searchParams.get("sheet");
  const date = new Date().toISOString().slice(0, 10);

  const csvResponse = (csv: string, filename: string) =>
    new Response(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    });

  switch (sheet) {
    case "symptoms": {
      const [definitions, logs] = await Promise.all([
        prisma.symptomDefinition.findMany({
          where: { condition: { userId: session.user.id } },
          select: { id: true, name: true, unit: true },
          orderBy: { name: "asc" },
        }),
        prisma.symptomLog.findMany({
          where: { userId: session.user.id },
          orderBy: { loggedAt: "desc" },
          select: {
            loggedAt: true,
            overallMood: true,
            energyLevel: true,
            stressLevel: true,
            sleepHours: true,
            sleepQuality: true,
            notes: true,
            entries: {
              select: { symptomDefinitionId: true, severity: true, value: true },
            },
          },
        }),
      ]);

      const defColumns = definitions.map((d) =>
        d.name.toLowerCase().replace(/\s+/g, "_") +
        (d.unit ? `_${d.unit.toLowerCase().replace(/\s+/g, "_")}` : "_severity")
      );

      const csv = toCsv(
        ["date", "mood", "energy", "stress", "sleep_hours", "sleep_quality", "notes", ...defColumns],
        logs.map((l) => {
          const entryMap = new Map(l.entries.map((e) => [e.symptomDefinitionId, e.severity ?? Number(e.value)]));
          return [
            l.loggedAt.toISOString(),
            l.overallMood,
            l.energyLevel,
            l.stressLevel,
            l.sleepHours,
            l.sleepQuality,
            decryptIfPresent(l.notes),
            ...definitions.map((d) => entryMap.get(d.id) ?? null),
          ];
        })
      );

      return csvResponse(csv, `health-symptoms-${date}.csv`);
    }

    case "medications": {
      const meds = await prisma.medication.findMany({
        where: { userId: session.user.id },
        orderBy: { name: "asc" },
        select: {
          name: true,
          dosage: true,
          form: true,
          prescribedBy: true,
          startDate: true,
          endDate: true,
          isActive: true,
          instructions: true,
        },
      });

      const csv = toCsv(
        ["name", "dosage", "form", "prescribed_by", "start_date", "end_date", "active", "instructions"],
        meds.map((m) => [
          m.name,
          m.dosage,
          m.form,
          decryptIfPresent(m.prescribedBy),
          m.startDate.toISOString().slice(0, 10),
          m.endDate ? m.endDate.toISOString().slice(0, 10) : null,
          m.isActive ? "yes" : "no",
          decryptIfPresent(m.instructions),
        ])
      );

      return csvResponse(csv, `health-medications-${date}.csv`);
    }

    case "appointments": {
      const appts = await prisma.appointment.findMany({
        where: { userId: session.user.id },
        orderBy: { scheduledAt: "desc" },
        select: {
          scheduledAt: true,
          title: true,
          doctorName: true,
          specialty: true,
          location: true,
          durationMin: true,
          purpose: true,
          status: true,
          summary: true,
        },
      });

      const csv = toCsv(
        ["date", "title", "doctor", "specialty", "location", "duration_min", "purpose", "status", "summary"],
        appts.map((a) => [
          a.scheduledAt.toISOString(),
          a.title,
          decryptIfPresent(a.doctorName),
          a.specialty,
          decryptIfPresent(a.location),
          a.durationMin,
          a.purpose,
          a.status,
          decryptIfPresent(a.summary),
        ])
      );

      return csvResponse(csv, `health-appointments-${date}.csv`);
    }

    case "adherence": {
      const logs = await prisma.medicationLog.findMany({
        where: { medication: { userId: session.user.id } },
        orderBy: { scheduledFor: "desc" },
        select: {
          scheduledFor: true,
          takenAt: true,
          status: true,
          medication: { select: { name: true, dosage: true } },
        },
      });

      const csv = toCsv(
        ["date", "medication", "dosage", "status", "taken_at"],
        logs.map((l) => [
          l.scheduledFor.toISOString(),
          l.medication.name,
          l.medication.dosage,
          l.status,
          l.takenAt ? l.takenAt.toISOString() : null,
        ])
      );

      return csvResponse(csv, `health-adherence-${date}.csv`);
    }

    default:
      return new Response("Invalid sheet parameter. Use: symptoms, medications, appointments, adherence", {
        status: 400,
      });
  }
}
