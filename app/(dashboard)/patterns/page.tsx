import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { WellbeingChart, SleepChart, type ChartDataPoint } from "@/components/patterns/HealthCharts";
import { getT } from "@/lib/i18n";

function avg(values: (number | null)[]): string | null {
  const nums = values.filter((v): v is number => v !== null);
  if (nums.length === 0) return null;
  return (nums.reduce((a, b) => a + b, 0) / nums.length).toFixed(1);
}

export default async function PatternsPage() {
  const [session, tr] = await Promise.all([
    auth.api.getSession({ headers: await headers() }),
    getT(),
  ]);

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
    </div>
  );
}
