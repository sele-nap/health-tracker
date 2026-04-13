import Link from "next/link";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { decryptIfPresent } from "@/lib/crypto";
import { redirect } from "next/navigation";
import { Plus, CalendarDays } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AppointmentStatusButton } from "@/components/appointments/AppointmentStatusButton";
import { AppointmentSummaryForm } from "@/components/appointments/AppointmentSummaryForm";

const STATUS_LABELS: Record<string, string> = {
  UPCOMING: "upcoming",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
  RESCHEDULED: "rescheduled",
};

const STATUS_VARIANTS: Record<string, "default" | "secondary" | "outline"> = {
  UPCOMING: "default",
  COMPLETED: "secondary",
  CANCELLED: "outline",
  RESCHEDULED: "secondary",
};

function formatDateTime(date: Date) {
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function AppointmentsPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user?.id) {
    redirect("/login");
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

  const upcoming = decrypted.filter((a) => a.status === "UPCOMING");
  const past = decrypted.filter((a) => a.status !== "UPCOMING");

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-heading italic text-3xl text-foreground">Appointments 🌿</h1>
          <p className="text-muted-foreground mt-1">
            {upcoming.length} upcoming
          </p>
        </div>
        <Link
          href="/appointments/new"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
        >
          <Plus size={15} />
          Add
        </Link>
      </div>

      {decrypted.length === 0 ? (
        <Card>
          <CardContent className="py-12 flex flex-col items-center gap-3 text-center">
            <CalendarDays size={32} className="text-muted-foreground/40" />
            <p className="text-muted-foreground">No appointments scheduled.</p>
            <Link href="/appointments/new" className="text-primary text-sm underline underline-offset-4">
              Schedule your first appointment
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          {upcoming.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                Upcoming
              </h2>
              {upcoming.map((appt) => (
                <AppointmentCard key={appt.id} appointment={appt} />
              ))}
            </section>
          )}

          {past.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                Past
              </h2>
              {past.map((appt) => (
                <AppointmentCard key={appt.id} appointment={appt} />
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

function AppointmentCard({ appointment: a }: { appointment: Appointment }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-3">
          <CardTitle className="font-heading italic text-lg leading-tight">{a.title}</CardTitle>
          <div className="flex items-center gap-2 shrink-0">
            <Badge variant={STATUS_VARIANTS[a.status] ?? "secondary"}>
              {STATUS_LABELS[a.status] ?? a.status.toLowerCase()}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-1 text-sm text-muted-foreground">
        <p className="text-foreground font-medium">{formatDateTime(a.scheduledAt)}</p>
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
            Edit
          </a>
        </div>
      </CardContent>
    </Card>
  );
}
