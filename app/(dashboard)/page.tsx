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

export default function DashboardPage() {
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
            <p className="text-2xl font-heading italic text-foreground">—</p>
            <p className="text-xs text-muted-foreground mt-1">Not logged yet</p>
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
            <p className="text-2xl font-heading italic text-foreground">0/0</p>
            <p className="text-xs text-muted-foreground mt-1">taken today</p>
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
            <p className="text-2xl font-heading italic text-foreground">—</p>
            <p className="text-xs text-muted-foreground mt-1">None scheduled</p>
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
            <p className="text-2xl font-heading italic text-foreground">—</p>
            <p className="text-xs text-muted-foreground mt-1">No data yet</p>
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
              Track how you're feeling to spot patterns over time.
            </p>
            <a
              href="/symptoms/new"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
            >
              <Activity size={15} />
              Log symptoms
            </a>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-heading italic text-lg">
              Medication checklist
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              No medications added yet.{" "}
              <a href="/medications/new" className="text-primary underline underline-offset-4">
                Add one
              </a>
              .
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
