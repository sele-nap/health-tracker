'use client';

import { useLocale } from '@/components/providers/LocaleProvider';
import { deleteCondition } from '@/server/actions/conditions';
import { useTransition } from 'react';

type Props = {
  conditionId: string;
};

export function DeleteConditionButton({ conditionId }: Props) {
  const { tr } = useLocale();
  const [pending, startTransition] = useTransition();

  function handleClick() {
    if (!confirm(tr.conditions.deleteConfirm)) return;
    startTransition(async () => {
      await deleteCondition(conditionId);
    });
  }

  return (
    <button
      onClick={handleClick}
      disabled={pending}
      className="text-xs text-muted-foreground hover:text-destructive transition-colors disabled:opacity-50"
    >
      {pending ? tr.deleting : tr.delete}
    </button>
  );
}
