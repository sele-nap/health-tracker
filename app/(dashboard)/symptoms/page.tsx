import Link from "next/link";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { decryptIfPresent } from "@/lib/crypto";
import { redirect } from "next/navigation";
import { Plus, Activity } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function moodEmoji(value: number | null) {
  if (!value) return "—";
  if (value <= 2) return "😞";
  if (value <= 4) return "😕";
  if (value <= 6) return "😐";
  if (value <= 8) return "🙂";
  return "😊";
}

function formatDate(date: Date) {
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default async function SymptomsPage() {
  const session = await auth.api.getSession({ headers: await headers() });

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

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-heading italic text-3xl text-foreground">Symptom logs 🌿</h1>
          <p className="text-muted-foreground mt-1">
            {logs.length} {logs.length === 1 ? "entry" : "entries"} recorded
          </p>
        </div>
        <Link
          href="/symptoms/new"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
        >
          <Plus size={15} />
          Log today
        </Link>
      </div>

      {decryptedLogs.length === 0 ? (
        <Card>
          <CardContent className="py-12 flex flex-col items-center gap-3 text-center">
            <Activity size={32} className="text-muted-foreground/40" />
            <p className="text-muted-foreground">No logs yet.</p>
            <Link href="/symptoms/new" className="text-primary text-sm underline underline-offset-4">
              Log your first day
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {decryptedLogs.map((log) => (
            <Card key={log.id}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {formatDate(log.loggedAt)}
                  </CardTitle>
                  <span className="text-xl" aria-label={`Mood: ${log.overallMood ?? "not logged"}`}>
                    {moodEmoji(log.overallMood)}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm">
                  {log.overallMood !== null && (
                    <span>
                      <span className="text-muted-foreground">mood </span>
                      <span className="font-medium">{log.overallMood}/10</span>
                    </span>
                  )}
                  {log.energyLevel !== null && (
                    <span>
                      <span className="text-muted-foreground">energy </span>
                      <span className="font-medium">{log.energyLevel}/10</span>
                    </span>
                  )}
                  {log.stressLevel !== null && (
                    <span>
                      <span className="text-muted-foreground">stress </span>
                      <span className="font-medium">{log.stressLevel}/10</span>
                    </span>
                  )}
                  {log.sleepHours !== null && (
                    <span>
                      <span className="text-muted-foreground">sleep </span>
                      <span className="font-medium">{log.sleepHours}h</span>
                    </span>
                  )}
                  {log.sleepQuality !== null && (
                    <span>
                      <span className="text-muted-foreground">sleep quality </span>
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
