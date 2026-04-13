import Link from "next/link";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { decryptIfPresent } from "@/lib/crypto";
import { redirect } from "next/navigation";
import { Plus, Pill } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ToggleActiveButton } from "@/components/medications/ToggleActiveButton";

function formatDate(date: Date) {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default async function MedicationsPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user?.id) {
    redirect("/login");
  }

  const medications = await prisma.medication.findMany({
    where: { userId: session.user.id },
    orderBy: [{ isActive: "desc" }, { name: "asc" }],
  });

  const decrypted = medications.map((med) => ({
    ...med,
    prescribedBy: decryptIfPresent(med.prescribedBy),
    instructions: decryptIfPresent(med.instructions),
  }));

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-heading italic text-3xl text-foreground">Medications 🌿</h1>
          <p className="text-muted-foreground mt-1">
            {decrypted.filter((m) => m.isActive).length} active
          </p>
        </div>
        <Link
          href="/medications/new"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
        >
          <Plus size={15} />
          Add
        </Link>
      </div>

      {decrypted.length === 0 ? (
        <Card>
          <CardContent className="py-12 flex flex-col items-center gap-3 text-center">
            <Pill size={32} className="text-muted-foreground/40" />
            <p className="text-muted-foreground">No medications added yet.</p>
            <Link href="/medications/new" className="text-primary text-sm underline underline-offset-4">
              Add your first medication
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {decrypted.map((med) => (
            <Card key={med.id} className={med.isActive ? "" : "opacity-60"}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between gap-3">
                  <CardTitle className="font-heading italic text-lg">{med.name}</CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant={med.isActive ? "default" : "secondary"}>
                      {med.isActive ? "active" : "inactive"}
                    </Badge>
                    <ToggleActiveButton medicationId={med.id} isActive={med.isActive} />
                    <Link
                      href={`/medications/${med.id}/edit`}
                      className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Edit
                    </Link>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-1 text-sm text-muted-foreground">
                <p>
                  <span className="text-foreground font-medium">{med.dosage}</span>
                  {med.form && <span className="ml-1">· {med.form}</span>}
                </p>
                {med.prescribedBy && <p>Prescribed by {med.prescribedBy}</p>}
                <p>
                  Since {formatDate(med.startDate)}
                  {med.endDate && ` · until ${formatDate(med.endDate)}`}
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
