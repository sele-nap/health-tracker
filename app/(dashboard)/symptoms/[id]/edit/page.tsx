import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { decryptIfPresent } from "@/lib/crypto";
import { notFound, redirect } from "next/navigation";
import { SymptomEditForm } from "@/components/symptoms/SymptomEditForm";

export default async function EditSymptomLogPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user?.id) {
    redirect("/login");
  }

  const log = await prisma.symptomLog.findUnique({
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
    },
  });

  if (!log || log.userId !== session.user.id) {
    notFound();
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

  return (
    <div className="max-w-xl mx-auto space-y-8">
      <div>
        <h1 className="font-heading italic text-3xl text-foreground">Edit log 🌿</h1>
        <p className="text-muted-foreground mt-1">
          {log.loggedAt.toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
          })}
        </p>
      </div>

      <SymptomEditForm logId={log.id} defaults={defaults} />
    </div>
  );
}
