'use client';

import { useLocale } from '@/components/providers/LocaleProvider';
import { cn } from '@/lib/utils';
import { logMedicationStatus } from '@/server/actions/medicationLogs';
import { useRouter } from 'next/navigation';
import { useTransition } from 'react';

type MedWithLog = {
  id: string;
  name: string;
  dosage: string;
  form: string | null;
  todayStatus: 'TAKEN' | 'SKIPPED' | 'PENDING' | null;
};

type Props = {
  medications: MedWithLog[];
};

export function MedicationChecklist({ medications }: Props) {
  const { tr } = useLocale();
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function handle(medicationId: string, status: 'TAKEN' | 'SKIPPED') {
    startTransition(async () => {
      await logMedicationStatus(medicationId, status);
      router.refresh();
    });
  }

  if (medications.length === 0) {
    return null;
  }

  const takenCount = medications.filter(
    (m) => m.todayStatus === 'TAKEN',
  ).length;

  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground">
        {takenCount}/{medications.length} {tr.medications.takenToday}
      </p>
      <ul className="space-y-2">
        {medications.map((med) => {
          const taken = med.todayStatus === 'TAKEN';
          const skipped = med.todayStatus === 'SKIPPED';

          return (
            <li
              key={med.id}
              className={cn(
                'flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg border text-sm transition-colors',
                taken
                  ? 'border-primary/30 bg-primary/5'
                  : skipped
                    ? 'border-border bg-muted/20 opacity-60'
                    : 'border-border bg-card',
              )}
            >
              <div className="min-w-0">
                <span
                  className={cn(
                    'font-medium truncate block',
                    taken ? 'text-primary' : 'text-foreground',
                  )}
                >
                  {taken && <span className="mr-1.5">✓</span>}
                  {med.name}
                </span>
                <span className="text-xs text-muted-foreground">
                  {med.dosage}
                  {med.form ? ` · ${med.form}` : ''}
                </span>
              </div>
              {!taken && (
                <div className="flex gap-1.5 shrink-0">
                  <button
                    onClick={() => handle(med.id, 'TAKEN')}
                    disabled={pending}
                    className="text-xs px-2.5 py-1 rounded-md bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-50 transition-opacity"
                  >
                    {tr.medications.markTaken}
                  </button>
                  {!skipped && (
                    <button
                      onClick={() => handle(med.id, 'SKIPPED')}
                      disabled={pending}
                      className="text-xs px-2.5 py-1 rounded-md border border-border text-muted-foreground hover:text-foreground disabled:opacity-50 transition-colors"
                    >
                      {tr.medications.markSkip}
                    </button>
                  )}
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
