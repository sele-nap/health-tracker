'use client';

import { useLocale } from '@/components/providers/LocaleProvider';
import { cn } from '@/lib/utils';
import { toggleMedicationActive } from '@/server/actions/medications';
import { useRouter } from 'next/navigation';
import { useTransition } from 'react';

type Props = {
  medicationId: string;
  isActive: boolean;
};

export function ToggleActiveButton({ medicationId, isActive }: Props) {
  const { tr } = useLocale();
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function handleClick() {
    startTransition(async () => {
      await toggleMedicationActive(medicationId);
      router.refresh();
    });
  }

  return (
    <button
      onClick={handleClick}
      disabled={pending}
      aria-label={
        isActive ? tr.medications.deactivate : tr.medications.activate
      }
      className={cn(
        'text-xs px-2.5 py-1 rounded-md border transition-colors',
        isActive
          ? 'border-border text-muted-foreground hover:border-destructive hover:text-destructive'
          : 'border-primary/40 text-primary hover:bg-primary/10',
        pending && 'opacity-50 cursor-not-allowed',
      )}
    >
      {pending
        ? '…'
        : isActive
          ? tr.medications.deactivate
          : tr.medications.activate}
    </button>
  );
}
