import type { Metadata } from "next";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Trends",
  description: "Visualize your health data and spot correlations.",
  openGraph: { title: "Trends · Health Tracker", description: "Visualize your health data and spot correlations." },
};
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { WellbeingChart, SleepChart, type ChartDataPoint } from "@/components/patterns/HealthCharts";
import { en, fr } from "@/lib/i18n";
import { getLocale } from "@/lib/locale";
import { computeCorrelations } from "@/lib/correlations";
import { cn } from "@/lib/utils";

function avg(values: (number | null)[]): string | null {
  const nums = values.filter((v): v is number => v !== null);
  if (nums.length === 0) return null;
  return (nums.reduce((a, b) => a + b, 0) / nums.length).toFixed(1);
}

export default async function PatternsPage() {
  const [session, locale] = await Promise.all([
    auth.api.getSession({ headers: await headers() }),
    getLocale(),
  ]);
  const tr = locale === "fr" ? fr : en;

  if (!session?.user?.id) {
    redirect("/login");
  }

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const logs = await prisma.symptomLog.findMany({
    where: {
      userId: session.user.id,
      loggedAt: { gte: thirtyDaysAgo },
    },
    orderBy: { loggedAt: "asc" },
    select: {
      loggedAt: true,
      overallMood: true,
      energyLevel: true,
      stressLevel: true,
      sleepHours: true,
      sleepQuality: true,
    },
  });

  const correlations = computeCorrelations(logs, locale);

  function shortDate(date: Date) {
    return date.toLocaleDateString(tr.dateLocale, { month: "short", day: "numeric" });
  }

  const chartData: ChartDataPoint[] = logs.map((log) => ({
    date: shortDate(log.loggedAt),
    mood: log.overallMood,
    energy: log.energyLevel,
    stress: log.stressLevel,
    sleepHours: log.sleepHours,
    sleepQuality: log.sleepQuality,
  }));

  const moodAvg = avg(logs.map((l) => l.overallMood));
  const energyAvg = avg(logs.map((l) => l.energyLevel));
  const stressAvg = avg(logs.map((l) => l.stressLevel));
  const sleepAvg = avg(logs.map((l) => l.sleepHours));

  const stats = [
    { label: tr.patterns.moodAvg, value: moodAvg },
    { label: tr.patterns.energyAvg, value: energyAvg },
    { label: tr.patterns.stressAvg, value: stressAvg },
    { label: tr.patterns.sleepAvg, value: sleepAvg ? `${sleepAvg}h` : null },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-heading italic text-3xl text-foreground">
            {tr.patterns.title} 🌿
          </h1>
          <p className="text-muted-foreground mt-1">
            {tr.patterns.subtitle(logs.length)}
          </p>
        </div>
        <a
          href="/api/export/pdf"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border text-sm text-muted-foreground hover:text-foreground hover:border-primary transition-colors"
          download
        >
          {tr.patterns.exportPdf}
        </a>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardContent className="pt-4 pb-4">
              <p className="text-xs text-muted-foreground">{s.label}</p>
              <p className="font-heading italic text-2xl mt-1">{s.value ?? "—"}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="font-heading italic text-lg">
            {tr.patterns.wellbeingChart}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <WellbeingChart data={chartData} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-heading italic text-lg">
            {tr.patterns.sleepChart}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <SleepChart data={chartData} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-heading italic text-lg">
            {tr.patterns.correlationsTitle}
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            {tr.patterns.correlationsSubtitle}
          </p>
        </CardHeader>
        <CardContent>
          {correlations.length === 0 ? (
            <p className="text-sm text-muted-foreground">{tr.patterns.correlationsEmpty}</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {correlations.map((insight, i) => (
                <div
                  key={i}
                  className={cn(
                    "rounded-xl border px-4 py-3 space-y-1.5",
                    insight.impact === "positive" && "border-primary/30 bg-primary/5",
                    insight.impact === "alert" && "border-amber-500/30 bg-amber-500/5",
                    insight.impact === "negative" && "border-destructive/30 bg-destructive/5",
                    insight.impact === "info" && "border-border bg-muted/20"
                  )}
                >
                  <p className="flex items-center gap-2 text-sm font-medium">
                    <span>{insight.icon}</span>
                    <span>{insight.title}</span>
                  </p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {insight.body}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-heading italic text-lg">
            {tr.patterns.exportData}
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            {tr.patterns.exportDataDesc}
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              {
                label: tr.patterns.csvSymptoms,
                desc: tr.patterns.csvSymptomsDesc,
                sheet: "symptoms",
              },
              {
                label: tr.patterns.csvMedications,
                desc: tr.patterns.csvMedicationsDesc,
                sheet: "medications",
              },
              {
                label: tr.patterns.csvAppointments,
                desc: tr.patterns.csvAppointmentsDesc,
                sheet: "appointments",
              },
              {
                label: tr.patterns.csvAdherence,
                desc: tr.patterns.csvAdherenceDesc,
                sheet: "adherence",
              },
            ].map(({ label, desc, sheet }) => (
              <div
                key={sheet}
                className="flex items-center justify-between gap-4 rounded-lg border border-border bg-muted/20 px-4 py-3"
              >
                <div>
                  <p className="text-sm font-medium">{label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
                </div>
                <a
                  href={`/api/export/csv?sheet=${sheet}`}
                  download
                  className="shrink-0 text-xs text-muted-foreground hover:text-foreground hover:border-primary border border-border rounded-md px-3 py-1.5 transition-colors"
                >
                  {tr.patterns.download}
                </a>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
