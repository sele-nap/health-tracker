import type { Metadata } from "next";
import Link from "next/link";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Medications",
  description: "Manage your medications and monitor adherence.",
  openGraph: { title: "Medications · Health Tracker", description: "Manage your medications and monitor adherence." },
};
import { prisma } from "@/lib/prisma";
import { decryptIfPresent } from "@/lib/crypto";
import { redirect } from "next/navigation";
import { Plus, Pill } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ToggleActiveButton } from "@/components/medications/ToggleActiveButton";
import { getT } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export default async function MedicationsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
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

  const statusFilter = params.status === "active" ? true : params.status === "inactive" ? false : undefined;
  const isFiltered = statusFilter !== undefined;

  const medications = await prisma.medication.findMany({
    where: {
      userId: session.user.id,
      ...(statusFilter !== undefined ? { isActive: statusFilter } : {}),
    },
    orderBy: [{ isActive: "desc" }, { name: "asc" }],
  });

  const decrypted = medications.map((med) => ({
    ...med,
    prescribedBy: decryptIfPresent(med.prescribedBy),
    instructions: decryptIfPresent(med.instructions),
  }));

  function formatDate(date: Date) {
    return date.toLocaleDateString(tr.dateLocale, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  const activeCount = decrypted.filter((m) => m.isActive).length;

  const filterTabs = [
    { label: tr.medications.filterAll, href: "/medications" },
    { label: tr.medications.active, href: "/medications?status=active" },
    { label: tr.medications.inactive, href: "/medications?status=inactive" },
  ];
  const currentStatus = params.status ?? "";

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-heading italic text-3xl text-foreground">
            {tr.medications.title} 🌿
          </h1>
          <p className="text-muted-foreground mt-1">
            {tr.medications.activeCount(activeCount)}
          </p>
        </div>
        <Link
          href="/medications/new"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
        >
          <Plus size={15} />
          {tr.medications.add}
        </Link>
      </div>

      <div className="flex rounded-lg border border-border overflow-hidden text-sm w-fit">
        {filterTabs.map(({ label, href }, i) => {
          const tabStatus = i === 0 ? "" : i === 1 ? "active" : "inactive";
          const isActive = currentStatus === tabStatus;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "px-4 py-1.5 transition-colors",
                i > 0 && "border-l border-border",
                isActive
                  ? "bg-accent text-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
              )}
            >
              {label}
            </Link>
          );
        })}
      </div>

      {decrypted.length === 0 ? (
        <Card>
          <CardContent className="py-12 flex flex-col items-center gap-3 text-center">
            <Pill size={32} className="text-muted-foreground/40" />
            <p className="text-muted-foreground">
              {isFiltered ? tr.noResults : tr.medications.noMeds}
            </p>
            {!isFiltered && (
              <Link
                href="/medications/new"
                className="text-primary text-sm underline underline-offset-4"
              >
                {tr.medications.addFirst}
              </Link>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {decrypted.map((med) => (
            <Card key={med.id} className={med.isActive ? "" : "opacity-60"}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between gap-3">
                  <CardTitle className="font-heading italic text-lg">
                    <Link
                      href={`/medications/${med.id}`}
                      className="hover:text-primary transition-colors"
                    >
                      {med.name}
                    </Link>
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant={med.isActive ? "default" : "secondary"}>
                      {med.isActive ? tr.medications.active : tr.medications.inactive}
                    </Badge>
                    <ToggleActiveButton medicationId={med.id} isActive={med.isActive} />
                    <Link
                      href={`/medications/${med.id}/edit`}
                      className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {tr.medications.edit}
                    </Link>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-1 text-sm text-muted-foreground">
                <p>
                  <span className="text-foreground font-medium">{med.dosage}</span>
                  {med.form && <span className="ml-1">· {med.form}</span>}
                </p>
                {med.prescribedBy && (
                  <p>{tr.medications.prescribedBy} {med.prescribedBy}</p>
                )}
                <p>
                  {tr.medications.since} {formatDate(med.startDate)}
                  {med.endDate && ` · ${tr.medications.until} ${formatDate(med.endDate)}`}
                </p>
                {med.instructions && (
                  <p className="italic text-xs mt-1">{med.instructions}</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
