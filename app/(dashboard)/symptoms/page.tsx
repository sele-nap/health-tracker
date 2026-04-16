import type { Metadata } from "next";
import Link from "next/link";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Symptoms journal",
  description: "Track your daily mood, energy, sleep and symptoms.",
  openGraph: { title: "Symptoms journal · Health Tracker", description: "Track your daily mood, energy, sleep and symptoms." },
};
import { prisma } from "@/lib/prisma";
import { decryptIfPresent } from "@/lib/crypto";
import { redirect } from "next/navigation";
import { Plus, Activity } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DeleteSymptomLogButton } from "@/components/symptoms/DeleteSymptomLogButton";
import { getT } from "@/lib/i18n";

function moodEmoji(value: number | null) {
  if (!value) return "—";
  if (value <= 2) return "😞";
  if (value <= 4) return "😕";
  if (value <= 6) return "😐";
  if (value <= 8) return "🙂";
  return "😊";
}

export default async function SymptomsPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string }>;
}) {
  const h = await headers();
  const [params, session, tr] = await Promise.all([
    searchParams,
    auth.api.getSession({ headers: h }),
    getT(),
  ]);

  if (!session?.user?.id) {
    redirect("/login");
  }

  const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
  const from = ISO_DATE.test(params.from ?? "") ? (params.from ?? "") : "";
  const to = ISO_DATE.test(params.to ?? "") ? (params.to ?? "") : "";
  const isFiltered = Boolean(from || to);

  const logs = await prisma.symptomLog.findMany({
    where: {
      userId: session.user.id,
      loggedAt: {
        gte: from ? new Date(from) : undefined,
        lte: to ? new Date(`${to}T23:59:59`) : undefined,
      },
    },
    orderBy: { loggedAt: "desc" },
    select: {
      id: true,
      loggedAt: true,
      overallMood: true,
      energyLevel: true,
      stressLevel: true,
      sleepHours: true,
      sleepQuality: true,
      notes: true,
      entries: {
        select: {
          severity: true,
          value: true,
          symptomDefinition: { select: { name: true, unit: true } },
        },
      },
    },
  });

  const decryptedLogs = logs.map((log) => ({
    ...log,
    notes: decryptIfPresent(log.notes),
  }));

  function formatDate(date: Date) {
    return date.toLocaleDateString(tr.dateLocale, {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-heading italic text-3xl text-foreground">
            {tr.symptoms.title} 🌿
          </h1>
          <p className="text-muted-foreground mt-1">
            {tr.symptoms.entriesCount(decryptedLogs.length)}
          </p>
        </div>
        <Link
          href="/symptoms/new"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
        >
          <Plus size={15} />
          {tr.symptoms.addEntry}
        </Link>
      </div>

      <form
        method="GET"
        className="flex flex-wrap items-end gap-3 p-4 rounded-xl border border-border bg-card"
      >
        <div className="flex flex-col gap-1">
          <label htmlFor="filter-from" className="text-xs text-muted-foreground">{tr.from}</label>
          <input
            id="filter-from"
            type="date"
            name="from"
            defaultValue={from}
            max={to || undefined}
            className="h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="filter-to" className="text-xs text-muted-foreground">{tr.to}</label>
          <input
            id="filter-to"
            type="date"
            name="to"
            defaultValue={to}
            min={from || undefined}
            className="h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>
        <div className="flex items-center gap-2 pb-0.5">
          <button
            type="submit"
            className="h-9 px-4 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
          >
            {tr.apply}
          </button>
          {isFiltered && (
            <Link
              href="/symptoms"
              className="h-9 px-4 inline-flex items-center rounded-md border border-border text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {tr.clearFilter}
            </Link>
          )}
        </div>
      </form>

      {decryptedLogs.length === 0 ? (
        <Card>
          <CardContent className="py-12 flex flex-col items-center gap-3 text-center">
            <Activity size={32} className="text-muted-foreground/40" />
            <p className="text-muted-foreground">
              {isFiltered ? tr.noResults : tr.symptoms.noEntries}
            </p>
            {!isFiltered && (
              <Link
                href="/symptoms/new"
                className="text-primary text-sm underline underline-offset-4"
              >
                {tr.symptoms.startLogging}
              </Link>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {decryptedLogs.map((log) => (
            <Card key={log.id}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between gap-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {formatDate(log.loggedAt)}
                  </CardTitle>
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{moodEmoji(log.overallMood)}</span>
                    <Link
                      href={`/symptoms/${log.id}/edit`}
                      className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {tr.edit}
                    </Link>
                    <DeleteSymptomLogButton logId={log.id} />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm">
                  {log.overallMood !== null && (
                    <span>
                      <span className="text-muted-foreground">{tr.symptoms.moodLabel} </span>
                      <span className="font-medium">{log.overallMood}/10</span>
                    </span>
                  )}
                  {log.energyLevel !== null && (
                    <span>
                      <span className="text-muted-foreground">{tr.symptoms.energyLabel} </span>
                      <span className="font-medium">{log.energyLevel}/10</span>
                    </span>
                  )}
                  {log.stressLevel !== null && (
                    <span>
                      <span className="text-muted-foreground">{tr.symptoms.stressLabel} </span>
                      <span className="font-medium">{log.stressLevel}/10</span>
                    </span>
                  )}
                  {log.sleepHours !== null && (
                    <span>
                      <span className="text-muted-foreground">{tr.symptoms.sleepLabel} </span>
                      <span className="font-medium">{log.sleepHours}h</span>
                    </span>
                  )}
                  {log.sleepQuality !== null && (
                    <span>
                      <span className="text-muted-foreground">{tr.symptoms.sleepQualityLabel} </span>
                      <span className="font-medium">{log.sleepQuality}/10</span>
                    </span>
                  )}
                  {log.entries.map((e) => (
                    <span key={e.symptomDefinition.name}>
                      <span className="text-muted-foreground">{e.symptomDefinition.name} </span>
                      <span className="font-medium">
                        {e.severity ?? Number(e.value)}
                        {e.symptomDefinition.unit ? ` ${e.symptomDefinition.unit}` : "/10"}
                      </span>
                    </span>
                  ))}
                </div>
                {log.notes && (
                  <p className="text-xs text-muted-foreground italic mt-2 line-clamp-2">
                    {log.notes}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
