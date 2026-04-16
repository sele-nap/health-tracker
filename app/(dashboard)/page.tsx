import type { Metadata } from "next";
import Link from "next/link";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Overview of your health at a glance.",
  openGraph: { title: "Dashboard · Health Tracker", description: "Overview of your health at a glance." },
};
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { CalendarDays, Pill, Activity, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MedicationChecklist } from "@/components/medications/MedicationChecklist";
import { getT } from "@/lib/i18n";
import { moodEmoji } from "@/lib/utils";

export default async function DashboardPage() {
  const [session, tr] = await Promise.all([
    auth.api.getSession({ headers: await headers() }),
    getT(),
  ]);

  if (!session?.user?.id) {
    redirect("/login");
  }

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);

  const sevenDaysAgo = new Date(todayStart.getTime() - 7 * 24 * 60 * 60 * 1000);
  const thirtyDaysAgo = new Date(todayStart.getTime() - 30 * 24 * 60 * 60 * 1000);

  const [todayLog, activeMedsData, nextAppointment, recentLogs, streakLogs] =
    await Promise.all([
      prisma.symptomLog.findFirst({
        where: {
          userId: session.user.id,
          loggedAt: { gte: todayStart, lt: todayEnd },
        },
        select: { overallMood: true },
      }),
      prisma.medication.findMany({
        where: { userId: session.user.id, isActive: true },
        orderBy: { name: "asc" },
        select: {
          id: true,
          name: true,
          dosage: true,
          form: true,
          logs: {
            where: { scheduledFor: { gte: todayStart, lt: todayEnd } },
            select: { status: true },
            take: 1,
          },
        },
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
      prisma.symptomLog.findMany({
        where: {
          userId: session.user.id,
          loggedAt: { gte: thirtyDaysAgo },
        },
        select: { loggedAt: true },
        orderBy: { loggedAt: "desc" },
      }),
    ]);

  const activeMeds = activeMedsData.length;

  const checklistMeds = activeMedsData.map((m) => ({
    id: m.id,
    name: m.name,
    dosage: m.dosage,
    form: m.form,
    todayStatus: (m.logs[0]?.status ?? null) as "TAKEN" | "SKIPPED" | "PENDING" | null,
  }));

  const takenToday = checklistMeds.filter((m) => m.todayStatus === "TAKEN").length;

  const avgMood =
    recentLogs.length > 0
      ? recentLogs.reduce((sum, l) => sum + (l.overallMood ?? 0), 0) /
        recentLogs.length
      : null;

  const loggedDays = new Set(
    streakLogs.map((l) => {
      const d = l.loggedAt;
      return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
    })
  );

  let streak = 0;
  for (let i = 0; i < 30; i++) {
    const d = new Date(todayStart.getTime() - i * 24 * 60 * 60 * 1000);
    const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
    if (loggedDays.has(key)) {
      streak++;
    } else {
      break;
    }
  }

  function getGreeting() {
    const hour = new Date().getHours();
    if (hour < 12) return tr.dashboard.greetingMorning;
    if (hour < 18) return tr.dashboard.greetingAfternoon;
    return tr.dashboard.greetingEvening;
  }

  function formatDate() {
    return new Date().toLocaleDateString(tr.dateLocale, {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  function formatAppointmentDate(date: Date) {
    const diff = date.getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    if (days === 0) return tr.dashboard.appointmentToday;
    if (days === 1) return tr.dashboard.appointmentTomorrow;
    if (days <= 7) return tr.dashboard.appointmentDays(days);
    return date.toLocaleDateString(tr.dateLocale, { month: "short", day: "numeric" });
  }

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
              {tr.dashboard.todayLog}
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
                    ? tr.dashboard.moodValue(todayLog.overallMood)
                    : tr.dashboard.loggedToday}
                </p>
              </>
            ) : (
              <>
                <p className="text-2xl font-heading italic text-foreground">—</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {tr.dashboard.notYetLogged}
                </p>
              </>
            )}
            {streak > 0 && (
              <p className="text-xs text-primary mt-2">{tr.dashboard.streak(streak)}</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center gap-2 pb-2">
            <Pill size={16} className="text-primary" />
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {tr.dashboard.medications}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-heading italic text-foreground">
              {activeMeds === 0 ? "—" : `${takenToday}/${activeMeds}`}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {activeMeds === 0 ? tr.dashboard.noneActive : tr.dashboard.takenToday}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center gap-2 pb-2">
            <CalendarDays size={16} className="text-primary" />
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {tr.dashboard.nextAppointment}
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
                <p className="text-xs text-muted-foreground mt-1">
                  {tr.dashboard.noneScheduled}
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center gap-2 pb-2">
            <TrendingUp size={16} className="text-primary" />
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {tr.dashboard.moodWeek}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {avgMood !== null ? (
              <>
                <p className="text-2xl font-heading italic text-foreground">
                  {avgMood.toFixed(1)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {tr.dashboard.avgOverDays(recentLogs.length)}
                </p>
              </>
            ) : (
              <>
                <p className="text-2xl font-heading italic text-foreground">—</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {tr.dashboard.noDataYet}
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="font-heading italic text-lg">
              {tr.dashboard.logToday}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              {todayLog ? tr.dashboard.alreadyLogged : tr.dashboard.trackMoods}
            </p>
            <Link
              href="/symptoms/new"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
            >
              <Activity size={15} />
              {todayLog ? tr.dashboard.addEntry : tr.dashboard.log}
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-heading italic text-lg">
              {tr.dashboard.todaysMeds}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {activeMeds === 0 ? (
              <p className="text-sm text-muted-foreground">
                {tr.dashboard.noMeds}{" "}
                <Link
                  href="/medications/new"
                  className="text-primary underline underline-offset-4"
                >
                  {tr.dashboard.addOneMed}
                </Link>
                .
              </p>
            ) : (
              <MedicationChecklist medications={checklistMeds} />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
