import Link from "next/link";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Plus, HeartPulse } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DeleteConditionButton } from "@/components/conditions/DeleteConditionButton";

function formatDate(date: Date) {
  return date.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
}

export default async function ConditionsPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user?.id) {
    redirect("/login");
  }

  const conditions = await prisma.userCondition.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "asc" },
    include: {
      symptomDefinitions: { select: { id: true } },
    },
  });

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-heading italic text-3xl text-foreground">Conditions 🌿</h1>
          <p className="text-muted-foreground mt-1">
            {conditions.length} {conditions.length === 1 ? "condition" : "conditions"} tracked
          </p>
        </div>
        <Link
          href="/conditions/new"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
        >
          <Plus size={15} />
          Add
        </Link>
      </div>

      {conditions.length === 0 ? (
        <Card>
          <CardContent className="py-12 flex flex-col items-center gap-3 text-center">
            <HeartPulse size={32} className="text-muted-foreground/40" />
            <p className="text-muted-foreground">No conditions added yet.</p>
            <p className="text-xs text-muted-foreground/70 max-w-xs">
              Add your chronic conditions to keep all your health context in one place.
            </p>
            <Link
              href="/conditions/new"
              className="text-primary text-sm underline underline-offset-4"
            >
              Add your first condition
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {conditions.map((c) => (
            <Card key={c.id}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-3">
                  <CardTitle className="font-heading italic text-lg">{c.name}</CardTitle>
                  <DeleteConditionButton conditionId={c.id} />
                </div>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground space-y-0.5">
                {c.diagnosedAt && <p>Diagnosed {formatDate(c.diagnosedAt)}</p>}
                <p>
                  {c.symptomDefinitions.length === 0
                    ? "No custom symptom definitions yet"
                    : `${c.symptomDefinitions.length} custom ${c.symptomDefinitions.length === 1 ? "symptom" : "symptoms"}`}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
