import type { Metadata } from "next";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { decryptIfPresent } from "@/lib/crypto";
import { notFound, redirect } from "next/navigation";
import { SymptomEditForm } from "@/components/symptoms/SymptomEditForm";
import { getT } from "@/lib/i18n";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const log = await prisma.symptomLog.findUnique({ where: { id }, select: { loggedAt: true } });
  const date = log
    ? log.loggedAt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    : null;
  const title = date ? `Edit entry · ${date}` : "Edit entry";
  return {
    title,
    openGraph: { title: `${title} · Health Tracker` },
  };
}


export default async function EditSymptomLogPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [session, tr] = await Promise.all([
    auth.api.getSession({ headers: await headers() }),
    getT(),
  ]);

  if (!session?.user?.id) {
    redirect("/login");
  }

  const [log, conditions] = await Promise.all([
    prisma.symptomLog.findUnique({
      where: { id },
      select: {
        id: true,
        userId: true,
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
    prisma.userCondition.findMany({
      where: { userId: session.user.id },
      select: {
        name: true,
        symptomDefinitions: { select: { id: true, name: true, unit: true } },
      },
    }),
  ]);

  if (!log || log.userId !== session.user.id) {
    notFound();
  }

  const definitions = conditions.flatMap((c) =>
    c.symptomDefinitions.map((def) => ({ ...def, conditionName: c.name }))
  );

  const defaultCustomEntries: Record<string, number> = {};
  for (const entry of log.entries) {
    defaultCustomEntries[entry.symptomDefinitionId] =
      entry.severity ?? Number(entry.value) ?? 5;
  }

  const defaults = {
    loggedAt: log.loggedAt.toISOString().slice(0, 10),
    mood: log.overallMood ?? 5,
    energy: log.energyLevel ?? 5,
    stress: log.stressLevel ?? 5,
    sleepHours: log.sleepHours,
    sleepQuality: log.sleepQuality ?? 5,
    notes: decryptIfPresent(log.notes) ?? "",
  };

  const formattedDate = log.loggedAt.toLocaleDateString(tr.dateLocale, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="max-w-xl mx-auto space-y-8">
      <div>
        <h1 className="font-heading italic text-3xl text-foreground">
          {tr.symptoms.editTitle} 🌿
        </h1>
        <p className="text-muted-foreground mt-1">{formattedDate}</p>
      </div>

      <SymptomEditForm
        logId={log.id}
        defaults={defaults}
        definitions={definitions}
        defaultCustomEntries={defaultCustomEntries}
      />
    </div>
  );
}
