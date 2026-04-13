import Link from "next/link";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { CalendarDays, Pill, Activity, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

function formatDate() {
  return new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function moodEmoji(value: number) {
  if (value <= 2) return "😞";
  if (value <= 4) return "😕";
  if (value <= 6) return "😐";
  if (value <= 8) return "🙂";
  return "😊";
}

function formatAppointmentDate(date: Date) {
  const now = new Date();
  const diff = date.getTime() - now.getTime();
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));

  if (days === 0) return "Today";
  if (days === 1) return "Tomorrow";
  if (days <= 7) return `In ${days} days`;

  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default async function DashboardPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user?.id) {
    redirect("/login");
  }

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);

  const sevenDaysAgo = new Date(todayStart.getTime() - 7 * 24 * 60 * 60 * 1000);

  const [todayLog, activeMeds, nextAppointment, recentLogs] = await Promise.all([
    prisma.symptomLog.findFirst({
      where: {
        userId: session.user.id,
        loggedAt: { gte: todayStart, lt: todayEnd },
      },
      select: { overallMood: true },
    }),
    prisma.medication.count({
      where: { userId: session.user.id, isActive: true },
    }),
    prisma.appointment.findFirst({
      where: {
        userId: session.user.id,
        status: "UPCOMING",
        scheduledAt: { gte: now },
      },
      orderBy: { scheduledAt: "asc" },
      select: { scheduledAt: true, title: true },
    }),
    prisma.symptomLog.findMany({
      where: {
        userId: session.user.id,
        loggedAt: { gte: sevenDaysAgo },
        overallMood: { not: null },
      },
      select: { overallMood: true },
    }),
  ]);

  const avgMood =
    recentLogs.length > 0
      ? recentLogs.reduce((sum, l) => sum + (l.overallMood ?? 0), 0) / recentLogs.length
      : null;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="font-heading italic text-3xl text-foreground">
          {getGreeting()} 🌿
        </h1>
        <p className="text-muted-foreground mt-1">{formatDate()}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center gap-2 pb-2">
            <Activity size={16} className="text-primary" />
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Today's log
            </CardTitle>
          </CardHeader>
          <CardContent>
            {todayLog ? (
              <>
                <p className="text-2xl font-heading italic text-foreground">
                  {todayLog.overallMood ? moodEmoji(todayLog.overallMood) : "✓"}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {todayLog.overallMood
                    ? `Mood ${todayLog.overallMood}/10`
                    : "Logged today"}
                </p>
              </>
            ) : (
              <>
                <p className="text-2xl font-heading italic text-foreground">—</p>
                <p className="text-xs text-muted-foreground mt-1">Not logged yet</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center gap-2 pb-2">
            <Pill size={16} className="text-primary" />
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Medications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-heading italic text-foreground">{activeMeds}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {activeMeds === 1 ? "active medication" : "active medications"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center gap-2 pb-2">
            <CalendarDays size={16} className="text-primary" />
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Next appointment
            </CardTitle>
          </CardHeader>
          <CardContent>
            {nextAppointment ? (
              <>
                <p className="text-2xl font-heading italic text-foreground">
                  {formatAppointmentDate(nextAppointment.scheduledAt)}
                </p>
                <p className="text-xs text-muted-foreground mt-1 truncate">
                  {nextAppointment.title}
                </p>
              </>
            ) : (
              <>
                <p className="text-2xl font-heading italic text-foreground">—</p>
                <p className="text-xs text-muted-foreground mt-1">None scheduled</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center gap-2 pb-2">
            <TrendingUp size={16} className="text-primary" />
            <CardTitle className="text-sm font-medium text-muted-foreground">
              7-day mood
            </CardTitle>
          </CardHeader>
          <CardContent>
            {avgMood !== null ? (
              <>
                <p className="text-2xl font-heading italic text-foreground">
                  {avgMood.toFixed(1)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  avg over {recentLogs.length} {recentLogs.length === 1 ? "day" : "days"}
                </p>
              </>
            ) : (
              <>
                <p className="text-2xl font-heading italic text-foreground">—</p>
                <p className="text-xs text-muted-foreground mt-1">No data yet</p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="font-heading italic text-lg">
              Log today's symptoms
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              {todayLog
                ? "You've already logged today. Add another entry?"
                : "Track how you're feeling to spot patterns over time."}
            </p>
            <Link
              href="/symptoms/new"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
            >
              <Activity size={15} />
              {todayLog ? "Log again" : "Log symptoms"}
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-heading italic text-lg">
              Medication checklist
            </CardTitle>
          </CardHeader>
          <CardContent>
            {activeMeds === 0 ? (
              <p className="text-sm text-muted-foreground">
                No medications added yet.{" "}
                <Link href="/medications/new" className="text-primary underline underline-offset-4">
                  Add one
                </Link>
                .
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">
                You have {activeMeds} active{" "}
                {activeMeds === 1 ? "medication" : "medications"}.{" "}
                <Link href="/medications" className="text-primary underline underline-offset-4">
                  View all
                </Link>
                .
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
