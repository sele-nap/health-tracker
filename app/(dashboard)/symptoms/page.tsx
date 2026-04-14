import Link from "next/link";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
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

export default async function SymptomsPage() {
  const [session, tr] = await Promise.all([
    auth.api.getSession({ headers: await headers() }),
    getT(),
  ]);

  if (!session?.user?.id) {
    redirect("/login");
  }

  const logs = await prisma.symptomLog.findMany({
    where: { userId: session.user.id },
    orderBy: { loggedAt: "desc" },
    take: 30,
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
            {tr.symptoms.entriesCount(logs.length)}
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

      {decryptedLogs.length === 0 ? (
        <Card>
          <CardContent className="py-12 flex flex-col items-center gap-3 text-center">
            <Activity size={32} className="text-muted-foreground/40" />
            <p className="text-muted-foreground">{tr.symptoms.noEntries}</p>
            <Link
              href="/symptoms/new"
              className="text-primary text-sm underline underline-offset-4"
            >
              {tr.symptoms.startLogging}
            </Link>
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
