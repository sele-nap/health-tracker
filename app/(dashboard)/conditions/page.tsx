import { DeleteConditionButton } from '@/components/conditions/DeleteConditionButton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { auth } from '@/lib/auth';
import { getT } from '@/lib/locale';
import { prisma } from '@/lib/prisma';
import { HeartPulse, Plus } from 'lucide-react';
import type { Metadata } from 'next';
import { headers } from 'next/headers';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Conditions',
  description: 'Manage your chronic conditions and custom symptoms.',
  openGraph: {
    title: 'Conditions · Health Tracker',
    description: 'Manage your chronic conditions and custom symptoms.',
  },
};

export default async function ConditionsPage() {
  const [session, tr] = await Promise.all([
    auth.api.getSession({ headers: await headers() }),
    getT(),
  ]);

  if (!session?.user?.id) {
    redirect('/login');
  }

  const conditions = await prisma.userCondition.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'asc' },
    include: {
      symptomDefinitions: { select: { id: true } },
    },
  });

  function formatDate(date: Date) {
    return date.toLocaleDateString(tr.dateLocale, {
      month: 'long',
      year: 'numeric',
    });
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-heading italic text-3xl text-foreground">
            {tr.conditions.title} 🌿
          </h1>
          <p className="text-muted-foreground mt-1">
            {tr.conditions.conditionsCount(conditions.length)}
          </p>
        </div>
        <Link
          href="/conditions/new"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
        >
          <Plus size={15} />
          {tr.conditions.add}
        </Link>
      </div>

      {conditions.length === 0 ? (
        <Card>
          <CardContent className="py-12 flex flex-col items-center gap-3 text-center">
            <HeartPulse size={32} className="text-muted-foreground/40" />
            <p className="text-muted-foreground">
              {tr.conditions.noConditions}
            </p>
            <p className="text-xs text-muted-foreground/70 max-w-xs">
              {tr.conditions.noConditionsDesc}
            </p>
            <Link
              href="/conditions/new"
              className="text-primary text-sm underline underline-offset-4"
            >
              {tr.conditions.addFirst}
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {conditions.map((c) => (
            <Card key={c.id}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-3">
                  <CardTitle className="font-heading italic text-lg">
                    <Link
                      href={`/conditions/${c.id}`}
                      className="hover:text-primary transition-colors"
                    >
                      {c.name}
                    </Link>
                  </CardTitle>
                  <div className="flex items-center gap-3">
                    <Link
                      href={`/conditions/${c.id}`}
                      className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {tr.conditions.manageSymptoms}
                    </Link>
                    <DeleteConditionButton conditionId={c.id} />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground space-y-0.5">
                {c.diagnosedAt && (
                  <p>
                    {tr.conditions.diagnosed} {formatDate(c.diagnosedAt)}
                  </p>
                )}
                <p>
                  {c.symptomDefinitions.length === 0
                    ? tr.conditions.noSymptomDefs
                    : tr.conditions.symptomDefs(c.symptomDefinitions.length)}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
