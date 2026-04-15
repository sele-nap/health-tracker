import type { Metadata } from "next";
import Link from "next/link";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SymptomDefinitionManager } from "@/components/conditions/SymptomDefinitionManager";
import { getT } from "@/lib/i18n";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const cond = await prisma.userCondition.findUnique({ where: { id }, select: { name: true } });
  const title = cond ? cond.name : "Condition";
  return {
    title,
    description: `Manage custom symptoms for ${title}.`,
    openGraph: { title: `${title} · Health Tracker`, description: `Manage custom symptoms for ${title}.` },
  };
}

export default async function ConditionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [session, tr] = await Promise.all([
    auth.api.getSession({ headers: await headers() }),
    getT(),
  ]);

  if (!session?.user?.id) {
    redirect("/login");
  }

  const condition = await prisma.userCondition.findUnique({
    where: { id },
    include: {
      symptomDefinitions: {
        orderBy: { name: "asc" },
        select: { id: true, name: true, unit: true },
      },
    },
  });

  if (!condition || condition.userId !== session.user.id) {
    notFound();
  }

  function formatDate(date: Date) {
    return date.toLocaleDateString(tr.dateLocale, {
      month: "long",
      year: "numeric",
    });
  }

  const ctr = tr.conditions;

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <Link
          href="/conditions"
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          {ctr.backToConditions}
        </Link>
        <h1 className="font-heading italic text-3xl text-foreground mt-3">
          {condition.name} 🌿
        </h1>
        {condition.diagnosedAt && (
          <p className="text-muted-foreground mt-1">
            {ctr.diagnosed} {formatDate(condition.diagnosedAt)}
          </p>
        )}
      </div>

      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="font-heading italic text-lg">
            {ctr.customSymptoms}
          </CardTitle>
          <p className="text-sm text-muted-foreground">{ctr.customSymptomsDesc}</p>
        </CardHeader>
        <CardContent>
          <SymptomDefinitionManager
            conditionId={condition.id}
            definitions={condition.symptomDefinitions}
          />
        </CardContent>
      </Card>
    </div>
  );
}
