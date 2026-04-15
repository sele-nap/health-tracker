import type { Metadata } from "next";
import Link from "next/link";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Appointments",
  description: "Schedule and review your medical appointments.",
  openGraph: { title: "Appointments · Health Tracker", description: "Schedule and review your medical appointments." },
};
import { prisma } from "@/lib/prisma";
import { decryptIfPresent } from "@/lib/crypto";
import { redirect } from "next/navigation";
import { Plus, CalendarDays, List } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AppointmentStatusButton } from "@/components/appointments/AppointmentStatusButton";
import { AppointmentSummaryForm } from "@/components/appointments/AppointmentSummaryForm";
import {
  AppointmentCalendar,
  type CalendarAppointment,
} from "@/components/appointments/AppointmentCalendar";
import { getT } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export default async function AppointmentsPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string; doctor?: string }>;
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

  const view = params.view === "calendar" ? "calendar" : "list";
  const doctorQuery = params.doctor?.trim() ?? "";

  const STATUS_LABELS = {
    UPCOMING: tr.appointments.statusUpcoming,
    COMPLETED: tr.appointments.statusCompleted,
    CANCELLED: tr.appointments.statusCancelled,
    RESCHEDULED: tr.appointments.statusRescheduled,
  };

  const STATUS_VARIANTS: Record<string, "default" | "secondary" | "outline"> = {
    UPCOMING: "default",
    COMPLETED: "secondary",
    CANCELLED: "outline",
    RESCHEDULED: "secondary",
  };

  function formatDateTime(date: Date) {
    return date.toLocaleDateString(tr.dateLocale, {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  const appointments = await prisma.appointment.findMany({
    where: { userId: session.user.id },
    orderBy: { scheduledAt: "desc" },
  });

  const decrypted = appointments.map((appt) => ({
    ...appt,
    doctorName: decryptIfPresent(appt.doctorName),
    location: decryptIfPresent(appt.location),
    summary: decryptIfPresent(appt.summary),
  }));

  const filtered = doctorQuery
    ? decrypted.filter((a) =>
        a.doctorName?.toLowerCase().includes(doctorQuery.toLowerCase())
      )
    : decrypted;

  const upcoming = filtered.filter((a) => a.status === "UPCOMING");
  const past = filtered.filter((a) => a.status !== "UPCOMING");

  const calendarAppts: CalendarAppointment[] = filtered.map((a) => ({
    id: a.id,
    title: a.title,
    scheduledAt: a.scheduledAt.toISOString(),
    status: a.status,
    doctorName: a.doctorName,
  }));

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-heading italic text-3xl text-foreground">
            {tr.appointments.title} 🌿
          </h1>
          <p className="text-muted-foreground mt-1">
            {tr.appointments.upcomingCount(upcoming.length)}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="flex rounded-lg border border-border overflow-hidden text-sm">
            <Link
              href={doctorQuery ? `/appointments?doctor=${encodeURIComponent(doctorQuery)}` : "/appointments"}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 transition-colors",
                view === "list"
                  ? "bg-accent text-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
              )}
            >
              <List size={14} />
              <span className="hidden sm:inline">{tr.appointments.viewList}</span>
            </Link>
            <Link
              href={doctorQuery ? `/appointments?view=calendar&doctor=${encodeURIComponent(doctorQuery)}` : "/appointments?view=calendar"}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 border-l border-border transition-colors",
                view === "calendar"
                  ? "bg-accent text-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
              )}
            >
              <CalendarDays size={14} />
              <span className="hidden sm:inline">{tr.appointments.viewCalendar}</span>
            </Link>
          </div>

          <Link
            href="/appointments/new"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
          >
            <Plus size={15} />
            <span className="hidden sm:inline">{tr.appointments.add}</span>
          </Link>
        </div>
      </div>

      <form
        method="GET"
        className="flex flex-wrap items-end gap-3 p-4 rounded-xl border border-border bg-card"
      >
        <input type="hidden" name="view" value={view} />
        <div className="flex flex-col gap-1 flex-1 min-w-48">
          <label className="text-xs text-muted-foreground">
            {tr.appointments.searchDoctor}
          </label>
          <input
            type="text"
            name="doctor"
            defaultValue={doctorQuery}
            placeholder={tr.appointments.searchDoctor}
            className="h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>
        <div className="flex items-center gap-2 pb-0.5">
          <button
            type="submit"
            className="h-9 px-4 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
          >
            {tr.apply}
          </button>
          {doctorQuery && (
            <Link
              href={view === "calendar" ? "/appointments?view=calendar" : "/appointments"}
              className="h-9 px-4 inline-flex items-center rounded-md border border-border text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {tr.clearFilter}
            </Link>
          )}
        </div>
      </form>

      {view === "calendar" ? (
        <Card>
          <CardContent className="pt-6 pb-6">
            {filtered.length === 0 ? (
              <div className="py-8 flex flex-col items-center gap-3 text-center">
                <CalendarDays size={32} className="text-muted-foreground/40" />
                <p className="text-muted-foreground">
                  {doctorQuery ? tr.noResults : tr.appointments.noAppointments}
                </p>
                {!doctorQuery && (
                  <Link
                    href="/appointments/new"
                    className="text-primary text-sm underline underline-offset-4"
                  >
                    {tr.appointments.addFirst}
                  </Link>
                )}
              </div>
            ) : (
              <AppointmentCalendar appointments={calendarAppts} />
            )}
          </CardContent>
        </Card>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="py-12 flex flex-col items-center gap-3 text-center">
            <CalendarDays size={32} className="text-muted-foreground/40" />
            <p className="text-muted-foreground">
              {doctorQuery ? tr.noResults : tr.appointments.noAppointments}
            </p>
            {!doctorQuery && (
              <Link
                href="/appointments/new"
                className="text-primary text-sm underline underline-offset-4"
              >
                {tr.appointments.addFirst}
              </Link>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          {upcoming.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                {tr.appointments.upcoming}
              </h2>
              {upcoming.map((appt) => (
                <AppointmentCard
                  key={appt.id}
                  appointment={appt}
                  statusLabel={STATUS_LABELS[appt.status as keyof typeof STATUS_LABELS] ?? appt.status.toLowerCase()}
                  statusVariant={STATUS_VARIANTS[appt.status] ?? "secondary"}
                  formattedDate={formatDateTime(appt.scheduledAt)}
                  editLabel={tr.appointments.edit}
                />
              ))}
            </section>
          )}

          {past.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                {tr.appointments.past}
              </h2>
              {past.map((appt) => (
                <AppointmentCard
                  key={appt.id}
                  appointment={appt}
                  statusLabel={STATUS_LABELS[appt.status as keyof typeof STATUS_LABELS] ?? appt.status.toLowerCase()}
                  statusVariant={STATUS_VARIANTS[appt.status] ?? "secondary"}
                  formattedDate={formatDateTime(appt.scheduledAt)}
                  editLabel={tr.appointments.edit}
                />
              ))}
            </section>
          )}
        </div>
      )}
    </div>
  );
}

type Appointment = {
  id: string;
  title: string;
  doctorName: string | null;
  specialty: string | null;
  location: string | null;
  scheduledAt: Date;
  durationMin: number | null;
  status: string;
  purpose: string | null;
  summary: string | null;
};

function AppointmentCard({
  appointment: a,
  statusLabel,
  statusVariant,
  formattedDate,
  editLabel,
}: {
  appointment: Appointment;
  statusLabel: string;
  statusVariant: "default" | "secondary" | "outline";
  formattedDate: string;
  editLabel: string;
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-3">
          <CardTitle className="font-heading italic text-lg leading-tight">{a.title}</CardTitle>
          <div className="flex items-center gap-2 shrink-0">
            <Badge variant={statusVariant}>{statusLabel}</Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-1 text-sm text-muted-foreground">
        <p className="text-foreground font-medium">{formattedDate}</p>
        {a.durationMin && <p>{a.durationMin} min</p>}
        {a.doctorName && (
          <p>
            {a.doctorName}
            {a.specialty && <span className="ml-1">· {a.specialty}</span>}
          </p>
        )}
        {a.location && <p>{a.location}</p>}
        {a.purpose && <p className="italic text-xs mt-1">{a.purpose}</p>}
        {a.summary && (
          <p className="text-xs text-foreground/70 bg-muted/30 rounded-md px-3 py-2 mt-2 italic">
            {a.summary}
          </p>
        )}
        <div className="pt-2 flex flex-wrap items-center gap-4">
          <AppointmentStatusButton appointmentId={a.id} currentStatus={a.status} />
          {a.status === "COMPLETED" && (
            <AppointmentSummaryForm appointmentId={a.id} existingSummary={a.summary} />
          )}
          <a
            href={`/appointments/${a.id}/edit`}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            {editLabel}
          </a>
        </div>
      </CardContent>
    </Card>
  );
}
