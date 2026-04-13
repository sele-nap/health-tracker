import Link from "next/link";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { decryptIfPresent } from "@/lib/crypto";
import { notFound, redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MedicationStatus } from "@/generated/prisma/client";

const STATUS_STYLES: Record<MedicationStatus, string> = {
  TAKEN: "text-primary",
  SKIPPED: "text-muted-foreground line-through",
  DELAYED: "text-amber-500",
  PENDING: "text-muted-foreground/60",
};

const STATUS_LABELS: Record<MedicationStatus, string> = {
  TAKEN: "Taken",
  SKIPPED: "Skipped",
  DELAYED: "Delayed",
  PENDING: "Pending",
};

function formatDate(date: Date) {
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatTime(date: Date | null) {
  if (!date) return null;
  return date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
}

export default async function MedicationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user?.id) {
    redirect("/login");
  }

  const medication = await prisma.medication.findUnique({
    where: { id },
    select: {
      id: true,
      userId: true,
      name: true,
      dosage: true,
      form: true,
      prescribedBy: true,
      startDate: true,
      endDate: true,
      instructions: true,
      isActive: true,
      logs: {
        orderBy: { scheduledFor: "desc" },
        take: 60,
        select: {
          id: true,
          scheduledFor: true,
          takenAt: true,
          status: true,
          notes: true,
        },
      },
    },
  });

  if (!medication || medication.userId !== session.user.id) {
    notFound();
  }

  const prescribedBy = decryptIfPresent(medication.prescribedBy);
  const instructions = decryptIfPresent(medication.instructions);

  const takenCount = medication.logs.filter((l) => l.status === "TAKEN").length;
  const adherenceRate =
    medication.logs.length > 0
      ? Math.round((takenCount / medication.logs.length) * 100)
      : null;

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="font-heading italic text-3xl text-foreground">{medication.name}</h1>
            <Badge variant={medication.isActive ? "default" : "secondary"}>
              {medication.isActive ? "active" : "inactive"}
            </Badge>
          </div>
          <p className="text-muted-foreground">
            {medication.dosage}
            {medication.form && ` · ${medication.form}`}
          </p>
        </div>
        <Link
          href={`/medications/${medication.id}/edit`}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors shrink-0"
        >
          Edit
        </Link>
      </div>

      <Card>
        <CardContent className="pt-5 space-y-2 text-sm">
          {prescribedBy && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Prescribed by</span>
              <span>{prescribedBy}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-muted-foreground">Started</span>
            <span>{formatDate(medication.startDate)}</span>
          </div>
          {medication.endDate && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Until</span>
              <span>{formatDate(medication.endDate)}</span>
            </div>
          )}
          {instructions && (
            <p className="text-muted-foreground italic text-xs pt-1">{instructions}</p>
          )}
        </CardContent>
      </Card>

      {adherenceRate !== null && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="font-heading italic text-lg">Adherence</CardTitle>
          </CardHeader>
          <CardContent className="flex items-end gap-3">
            <p className="text-4xl font-heading italic text-primary">{adherenceRate}%</p>
            <p className="text-sm text-muted-foreground pb-1">
              {takenCount} of {medication.logs.length} doses taken
            </p>
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
          Log history
        </h2>
        {medication.logs.length === 0 ? (
          <p className="text-sm text-muted-foreground">No doses logged yet.</p>
        ) : (
          <div className="space-y-1">
            {medication.logs.map((log) => (
              <div
                key={log.id}
                className="flex items-center justify-between px-4 py-2.5 rounded-lg bg-card border border-border text-sm"
              >
                <span className="text-muted-foreground">
                  {formatDate(log.scheduledFor)}
                </span>
                <div className="flex items-center gap-3">
                  {log.takenAt && (
                    <span className="text-xs text-muted-foreground">
                      {formatTime(log.takenAt)}
                    </span>
                  )}
                  <span className={STATUS_STYLES[log.status]}>
                    {STATUS_LABELS[log.status]}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
        {medication.logs.length === 60 && (
          <p className="text-xs text-muted-foreground text-center">Showing last 60 entries</p>
        )}
      </div>
    </div>
  );
}
